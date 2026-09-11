import { createServerFn } from "@tanstack/react-start";
import { appUserReconnectRequired, callAsAppUser } from "@/integrations/lovable/appUserConnector";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { getConnectionKeyForUser } from "@/server/appUserConnections.server";

const GATEWAY_BASE_URL = "https://connector-gateway.lovable.dev";
const GMAIL_CONNECTOR_ID = "google_mail";
const SEND_SCOPES = ["https://www.googleapis.com/auth/gmail.send"];

const b64 = (s: string) =>
  btoa(Array.from(new TextEncoder().encode(s), (b) => String.fromCharCode(b)).join(""));
const header = (v: string) => (/^[\x00-\x7F]*$/.test(v) ? v : `=?UTF-8?B?${b64(v)}?=`);

function rawEmail(opts: { to: string; from: string; subject: string; body: string }) {
  const message = [
    `From: ${opts.from}`,
    `To: ${opts.to}`,
    `Subject: ${header(opts.subject)}`,
    "MIME-Version: 1.0",
    'Content-Type: text/plain; charset="UTF-8"',
    "",
    opts.body,
  ].join("\r\n");
  return b64(message).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function fill(text: string, vars: Record<string, string>) {
  return text.replace(/\{\{\s*([a-z_]+)\s*\}\}/gi, (m, key: string) => vars[key.toLowerCase()] ?? m);
}

export interface SendBatchResult {
  sent: number;
  failed: number;
  remaining: number;
  errors: string[];
  needsConnection?: boolean;
  reconnectRequired?: boolean;
}

export const sendCampaignBatch = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { campaignId: string; limit?: number }) => {
    if (!input?.campaignId) throw new Error("Missing campaignId");
    return { campaignId: input.campaignId, limit: input.limit };
  })
  .handler(async ({ data, context }): Promise<SendBatchResult> => {
    const { supabase, userId } = context;
    const empty: SendBatchResult = { sent: 0, failed: 0, remaining: 0, errors: [] };

    const connectionAPIKey = await getConnectionKeyForUser(userId, GMAIL_CONNECTOR_ID);
    if (!connectionAPIKey) return { ...empty, needsConnection: true };

    const { data: campaign, error: cErr } = await supabase
      .from("campaigns")
      .select("*")
      .eq("id", data.campaignId)
      .maybeSingle();
    if (cErr) throw cErr;
    if (!campaign) throw new Error("Campaign not found");

    const limit = Math.max(1, Math.min(data.limit ?? campaign.batch_size ?? 20, 50));

    const { data: queued, error: rErr } = await supabase
      .from("campaign_recipients")
      .select("*")
      .eq("campaign_id", campaign.id)
      .eq("state", "queued")
      .order("created_at", { ascending: true })
      .limit(limit);
    if (rErr) throw rErr;
    if (!queued || queued.length === 0) return { ...empty };

    const { data: prospects } = await supabase
      .from("prospects")
      .select("*")
      .in("id", queued.map((r) => r.prospect_id));

    const { data: profile } = await supabase
      .from("profiles")
      .select("display_name")
      .eq("id", userId)
      .maybeSingle();
    const senderName = profile?.display_name ?? "";

    // Sender address: the campaign's mailbox when set, otherwise the Gmail profile.
    let fromAddress = "";
    if (campaign.email_account_id) {
      const { data: acct } = await supabase
        .from("email_accounts")
        .select("address")
        .eq("id", campaign.email_account_id)
        .maybeSingle();
      fromAddress = acct?.address ?? "";
    }
    if (!fromAddress) {
      const profRes = await callAsAppUser({
        gatewayBaseUrl: GATEWAY_BASE_URL,
        connectionAPIKey,
        connectorId: GMAIL_CONNECTOR_ID,
        path: "/gmail/v1/users/me/profile",
      });
      if (await appUserReconnectRequired(profRes)) return { ...empty, reconnectRequired: true };
      if (profRes.ok) {
        const p = (await profRes.json()) as { emailAddress?: string };
        fromAddress = p.emailAddress ?? "";
      }
    }
    const from = senderName && fromAddress ? `${header(senderName)} <${fromAddress}>` : fromAddress;

    let sent = 0;
    const errors: string[] = [];
    const nowIso = new Date().toISOString();

    for (const recipient of queued) {
      const prospect = prospects?.find((p) => p.id === recipient.prospect_id);
      if (!prospect?.email) {
        errors.push("A recipient has no email address");
        await supabase
          .from("campaign_recipients")
          .update({ state: "bounced", error_message: "Missing email address" })
          .eq("id", recipient.id);
        continue;
      }

      const first = (prospect.contact_name || "").trim().split(/\s+/)[0] ?? "";
      const vars: Record<string, string> = {
        first_name: first || prospect.company,
        contact_name: prospect.contact_name || prospect.company,
        company: prospect.company,
        city: prospect.city ?? "",
        country: prospect.country ?? "",
        sender_name: senderName,
      };
      const subject = fill(recipient.subject || campaign.subject, vars);
      const body = fill(recipient.body || campaign.body, vars);

      const res = await callAsAppUser({
        gatewayBaseUrl: GATEWAY_BASE_URL,
        connectionAPIKey,
        connectorId: GMAIL_CONNECTOR_ID,
        path: "/gmail/v1/users/me/messages/send",
        requiredScopes: SEND_SCOPES,
        init: {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ raw: rawEmail({ to: prospect.email, from, subject, body }) }),
        },
      });

      if (await appUserReconnectRequired(res)) {
        return { sent, failed: errors.length, remaining: 0, errors, reconnectRequired: true };
      }

      if (!res.ok) {
        const text = await res.text();
        console.error(`Gmail send failed [${res.status}]: ${text}`);
        errors.push(`${prospect.email}: ${res.status} ${text.slice(0, 200)}`);
        await supabase
          .from("campaign_recipients")
          .update({ state: "bounced", error_message: text.slice(0, 500) })
          .eq("id", recipient.id);
        continue;
      }

      const msg = (await res.json()) as { id?: string; threadId?: string };
      await supabase
        .from("campaign_recipients")
        .update({
          state: "sent",
          sent_at: nowIso,
          subject,
          body,
          provider_message_id: msg.id ?? null,
          provider_thread_id: msg.threadId ?? null,
          error_message: null,
        })
        .eq("id", recipient.id);

      await supabase
        .from("prospects")
        .update({
          last_contacted_at: nowIso,
          status: prospect.status === "new" ? "contacted" : prospect.status,
        })
        .eq("id", prospect.id);

      await supabase.from("activities").insert({
        user_id: userId,
        type: "email_sent",
        title: `${campaign.name} sent to ${prospect.company}`,
        detail: subject,
        prospect_id: prospect.id,
        campaign_id: campaign.id,
        category_id: campaign.category_id,
        at: nowIso,
      });

      sent += 1;
    }

    const { count } = await supabase
      .from("campaign_recipients")
      .select("id", { count: "exact", head: true })
      .eq("campaign_id", campaign.id)
      .eq("state", "queued");
    const remaining = count ?? 0;

    await supabase
      .from("campaigns")
      .update({ status: remaining === 0 ? "completed" : "sending" })
      .eq("id", campaign.id);

    return { sent, failed: errors.length, remaining, errors };
  });

import * as React from "react";
import { createFileRoute } from "@tanstack/react-router";
import { CheckCircle2, Link2, Plug, RefreshCw, ShieldCheck, XCircle } from "lucide-react";
import { toast } from "sonner";
import { useOutreach } from "@/lib/outreach/store";
import { relative } from "@/lib/outreach/format";
import { CategoryChip, PageHeader, Pill, ProgressBar, SectionCard } from "@/components/app/primitives";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field } from "@/routes/prospects.index";

export const Route = createFileRoute("/accounts")({
  head: () => ({
    meta: [
      { title: "Email Accounts — OutreachOS" },
      { name: "description", content: "Connect Gmail and Outlook accounts, set daily sending limits and monitor synchronisation." },
      { property: "og:title", content: "Email Accounts — OutreachOS" },
      { property: "og:description", content: "One sender per business, with limits, sync status and category routing." },
    ],
  }),
  component: AccountsPage,
});

const PROVIDER_LABEL = { google: "Gmail / Google Workspace", microsoft: "Microsoft / Outlook", smtp: "SMTP" } as const;

function AccountsPage() {
  const store = useOutreach();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Email Accounts"
        description="Each campaign category sends from its own address. Connections use OAuth — no passwords are ever stored."
        actions={
          <Button onClick={() => toast.message("OAuth not configured", { description: "Connect a provider in Settings → Integrations to enable live sending." })}>
            <Plug className="size-4" /> Connect account
          </Button>
        }
      />

      <div className="surface-card flex flex-wrap items-center gap-3 border-l-4 border-l-warning p-4 text-sm">
        <ShieldCheck className="size-5 text-warning" />
        <p className="text-muted-foreground">
          <strong className="text-foreground">Demo mode.</strong> These accounts are sample data. Real sending and reply
          sync require OAuth credentials for Google or Microsoft — see Settings → Integrations.
        </p>
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        {store.accounts.map((a) => {
          const remaining = Math.max(0, a.dailyLimit - a.sentToday);
          return (
            <SectionCard key={a.id} bodyClassName="p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="text-base font-semibold text-foreground">{a.label}</h2>
                  <p className="text-sm text-muted-foreground">{a.address}</p>
                  <p className="mt-1 text-xs text-muted-foreground">{PROVIDER_LABEL[a.provider]}</p>
                </div>
                <Pill tone={a.status === "connected" ? "success" : "danger"}>
                  {a.status === "connected" ? <CheckCircle2 className="size-3" /> : <XCircle className="size-3" />}
                  {a.status}
                </Pill>
              </div>

              <div className="mt-4 flex flex-wrap gap-1.5">
                {a.categoryIds.map((id) => (
                  <CategoryChip key={id} category={store.categories.find((c) => c.id === id)} />
                ))}
              </div>

              <div className="mt-4">
                <div className="mb-1.5 flex justify-between text-xs text-muted-foreground">
                  <span>
                    {a.sentToday} sent today · {remaining} remaining
                  </span>
                  <span className="num">{a.dailyLimit}/day</span>
                </div>
                <ProgressBar value={(a.sentToday / a.dailyLimit) * 100} />
              </div>

              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <Field label="Daily sending limit">
                  <Input
                    type="number"
                    value={a.dailyLimit}
                    onChange={(e) => store.updateAccount(a.id, { dailyLimit: Number(e.target.value) })}
                  />
                </Field>
                <Field label="Last synchronisation">
                  <div className="flex h-9 items-center text-sm text-muted-foreground">{relative(a.lastSyncAt)}</div>
                </Field>
              </div>

              <div className="mt-4 flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    store.syncAccount(a.id);
                    toast.success(`${a.label} synchronised`, { description: "Replies and bounces are up to date." });
                  }}
                >
                  <RefreshCw className="size-3.5" /> Sync now
                </Button>
                <Button
                  size="sm"
                  variant={a.status === "connected" ? "ghost" : "default"}
                  onClick={() => {
                    store.toggleAccount(a.id);
                    toast.message(a.status === "connected" ? "Account disconnected" : "Account connected");
                  }}
                >
                  <Link2 className="size-3.5" /> {a.status === "connected" ? "Disconnect" : "Connect"}
                </Button>
              </div>
            </SectionCard>
          );
        })}
      </div>

      <SectionCard title="How synchronisation works" description="What the app reads once an account is connected">
        <ul className="grid gap-3 text-sm text-muted-foreground sm:grid-cols-2">
          {[
            "Sent messages matched to campaign recipients",
            "Replies matched back to the prospect and campaign",
            "Bounces and delivery failures",
            "Thread history for the conversation view",
            "Follow-up responses that stop a sequence",
            "Nothing else — the app never reads unrelated mail",
          ].map((t) => (
            <li key={t} className="flex items-start gap-2">
              <CheckCircle2 className="mt-0.5 size-4 text-success" /> {t}
            </li>
          ))}
        </ul>
      </SectionCard>
    </div>
  );
}

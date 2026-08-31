import * as React from "react";
import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import { ArrowLeft, Ban, Pause, Play, Send } from "lucide-react";
import { toast } from "sonner";
import { campaignStats, useLookups, useOutreach } from "@/lib/outreach/store";
import { formatDate, formatShort, pct } from "@/lib/outreach/format";
import { CategoryChip, EmptyState, Pill, ProgressBar, SectionCard, StatusBadge } from "@/components/app/primitives";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/_authenticated/_authenticated/campaigns/$campaignId")({
  head: () => ({
    meta: [
      { title: "Campaign detail — OutreachOS" },
      { name: "description", content: "Sending progress, per-recipient delivery state, replies and follow-ups for this campaign." },
      { property: "og:title", content: "Campaign detail — OutreachOS" },
      { property: "og:description", content: "Track every recipient of this outreach campaign in real time." },
    ],
  }),
  component: CampaignDetail,
});

function CampaignDetail() {
  const { campaignId } = useParams({ from: "/campaigns/$campaignId" });
  const store = useOutreach();
  const lookups = useLookups();
  const campaign = store.campaigns.find((c) => c.id === campaignId);

  if (!campaign) {
    return (
      <EmptyState
        title="Campaign not found"
        action={
          <Button asChild>
            <Link to="/campaigns">Back to campaigns</Link>
          </Button>
        }
      />
    );
  }

  const stats = campaignStats(campaign.id, store.recipients, store.prospects);
  const rows = store.recipients.filter((r) => r.campaignId === campaign.id);
  const account = lookups.account(campaign.emailAccountId);

  return (
    <div className="space-y-6">
      <Link to="/campaigns" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="size-4" /> Campaigns
      </Link>

      <div className="surface-card p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-2xl font-semibold text-foreground">{campaign.name}</h1>
              <Pill tone={campaign.status === "completed" ? "success" : campaign.status === "paused" ? "warn" : "accent"}>
                {campaign.status}
              </Pill>
            </div>
            <p className="mt-1 text-sm text-muted-foreground">
              {campaign.purpose} · {account?.label} ({account?.address}) · created {formatDate(campaign.createdAt)}
            </p>
            <div className="mt-3">
              <CategoryChip category={lookups.category(campaign.categoryId)} />
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {campaign.status === "sending" ? (
              <Button variant="outline" onClick={() => { store.updateCampaign(campaign.id, { status: "paused" }); toast.message("Campaign paused"); }}>
                <Pause className="size-4" /> Pause
              </Button>
            ) : campaign.status !== "completed" ? (
              <Button onClick={() => { store.updateCampaign(campaign.id, { status: "sending" }); toast.success("Campaign resumed"); }}>
                <Play className="size-4" /> Resume
              </Button>
            ) : null}
            <Button
              variant="outline"
              disabled={stats.sent >= stats.recipients}
              onClick={() => {
                const n = store.sendBatch(campaign.id);
                toast.success(`${n} emails sent`);
              }}
            >
              <Send className="size-4" /> Send next batch
            </Button>
            <Button
              variant="outline"
              onClick={() => { store.updateCampaign(campaign.id, { status: "cancelled" }); toast.message("Remaining emails cancelled"); }}
            >
              <Ban className="size-4" /> Cancel remaining
            </Button>
          </div>
        </div>

        <div className="mt-6">
          <div className="mb-1.5 flex justify-between text-sm">
            <span className="text-muted-foreground">
              {stats.sent} / {stats.recipients} sent · batches of {campaign.batchSize} every {campaign.intervalMinutes} min
            </span>
            <span className="num font-medium text-foreground">{stats.progress}%</span>
          </div>
          <ProgressBar value={stats.progress} />
        </div>

        <div className="mt-6 grid grid-cols-2 gap-4 border-t border-border pt-5 sm:grid-cols-4 xl:grid-cols-7">
          <Stat label="Recipients" value={stats.recipients} />
          <Stat label="Sent" value={stats.sent} />
          <Stat label="Delivered" value={stats.delivered} />
          <Stat label="Opened" value={stats.opened} />
          <Stat label="Replies" value={stats.replied} />
          <Stat label="Interested" value={stats.interested} />
          <Stat label="Won" value={stats.won} />
        </div>
      </div>

      <SectionCard title="Email" description={campaign.subject}>
        <div className="whitespace-pre-wrap rounded-lg border border-border bg-muted/40 p-4 text-sm text-foreground">
          {campaign.body}
        </div>
      </SectionCard>

      <SectionCard title="Recipients" description={`Reply rate ${pct(stats.replied, stats.sent)}%`} bodyClassName="p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left text-xs text-muted-foreground">
                <th className="px-5 py-3 font-medium">Recipient</th>
                <th className="px-3 py-3 font-medium">Company</th>
                <th className="px-3 py-3 font-medium">Status</th>
                <th className="px-3 py-3 font-medium">Sent</th>
                <th className="px-3 py-3 font-medium">Opened</th>
                <th className="px-3 py-3 font-medium">Replied</th>
                <th className="px-5 py-3 font-medium">Follow-up</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => {
                const p = lookups.prospect(r.prospectId);
                if (!p) return null;
                return (
                  <tr key={r.id} className="border-b border-border/70 last:border-0 hover:bg-muted/50">
                    <td className="px-5 py-3">
                      <Link
                        to="/prospects/$prospectId"
                        params={{ prospectId: p.id }}
                        className="font-medium text-foreground hover:text-primary"
                      >
                        {p.contactName}
                      </Link>
                      <p className="text-xs text-muted-foreground">{p.email}</p>
                    </td>
                    <td className="px-3 py-3 text-muted-foreground">{p.company}</td>
                    <td className="px-3 py-3">
                      <StatusBadge status={p.status} />
                    </td>
                    <td className="px-3 py-3 text-muted-foreground">{formatShort(r.sentAt)}</td>
                    <td className="px-3 py-3 text-muted-foreground">{r.openedAt ? `${r.openCount}×` : "—"}</td>
                    <td className="px-3 py-3 text-muted-foreground">{formatShort(r.repliedAt)}</td>
                    <td className="px-5 py-3 text-muted-foreground">{formatShort(r.followUpAt)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </SectionCard>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <p className="num text-2xl font-semibold text-foreground">{value}</p>
      <p className="text-xs text-muted-foreground">{label}</p>
    </div>
  );
}

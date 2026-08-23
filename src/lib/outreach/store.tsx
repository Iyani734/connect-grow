import * as React from "react";
import { buildDemoState } from "./demo";
import { NOW } from "./format";
import type {
  Activity,
  ActivityType,
  Campaign,
  CampaignRecipient,
  Category,
  EmailAccount,
  FollowUp,
  ID,
  LeadStatus,
  Prospect,
  Template,
  WorkspaceState,
} from "./types";

const STORAGE_KEY = "outreachos.workspace.v1";

interface StoreValue extends WorkspaceState {
  /** true once client-side persisted state has been hydrated */
  ready: boolean;
  addProspect: (p: Omit<Prospect, "id" | "createdAt" | "status"> & Partial<Pick<Prospect, "status">>) => Prospect;
  addProspects: (list: Array<Omit<Prospect, "id" | "createdAt" | "status">>) => number;
  updateProspect: (id: ID, patch: Partial<Prospect>) => void;
  deleteProspect: (id: ID) => void;
  setProspectStatus: (id: ID, status: LeadStatus) => void;
  addCategory: (c: Omit<Category, "id">) => void;
  updateCategory: (id: ID, patch: Partial<Category>) => void;
  deleteCategory: (id: ID) => void;
  createCampaign: (c: Omit<Campaign, "id" | "createdAt">, prospectIds: ID[]) => Campaign;
  updateCampaign: (id: ID, patch: Partial<Campaign>) => void;
  deleteCampaign: (id: ID) => void;
  sendBatch: (campaignId: ID, count?: number) => number;
  saveTemplate: (t: Omit<Template, "id" | "timesUsed" | "replyRate" | "won">) => void;
  deleteTemplate: (id: ID) => void;
  completeFollowUp: (id: ID) => void;
  skipFollowUp: (id: ID) => void;
  scheduleFollowUp: (prospectId: ID, campaignId: ID, dueAt: string) => void;
  syncAccount: (id: ID) => void;
  toggleAccount: (id: ID) => void;
  updateAccount: (id: ID, patch: Partial<EmailAccount>) => void;
  duplicateCheck: (prospectId: ID, campaignId: ID) => CampaignRecipient | undefined;
  reset: () => void;
}

const StoreContext = React.createContext<StoreValue | null>(null);

function uid(prefix: string) {
  return `${prefix}-${Math.random().toString(36).slice(2, 9)}`;
}

export function OutreachProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = React.useState<WorkspaceState>(() => buildDemoState());
  const [ready, setReady] = React.useState(false);

  React.useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) setState(JSON.parse(raw) as WorkspaceState);
    } catch {
      /* ignore corrupt cache */
    }
    setReady(true);
  }, []);

  React.useEffect(() => {
    if (!ready) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      /* quota */
    }
  }, [state, ready]);

  const logActivity = React.useCallback(
    (draft: WorkspaceState, type: ActivityType, title: string, extra: Partial<Activity> = {}) => {
      const activity: Activity = {
        id: uid("a"),
        type,
        at: new Date().toISOString(),
        title,
        ...extra,
      };
      draft.activities = [activity, ...draft.activities];
    },
    [],
  );

  const mutate = React.useCallback((fn: (draft: WorkspaceState) => void) => {
    setState((prev) => {
      const draft: WorkspaceState = {
        ...prev,
        categories: [...prev.categories],
        accounts: [...prev.accounts],
        prospects: [...prev.prospects],
        campaigns: [...prev.campaigns],
        recipients: [...prev.recipients],
        templates: [...prev.templates],
        followUps: [...prev.followUps],
        activities: [...prev.activities],
      };
      fn(draft);
      return draft;
    });
  }, []);

  const value = React.useMemo<StoreValue>(() => {
    return {
      ...state,
      ready,
      addProspect(input) {
        const prospect: Prospect = {
          id: uid("p"),
          createdAt: new Date().toISOString(),
          status: input.status ?? "new",
          lastContactedAt: null,
          lastResponseAt: null,
          nextFollowUpAt: null,
          ...input,
        };
        mutate((d) => {
          d.prospects = [prospect, ...d.prospects];
          logActivity(d, "prospect_created", `${prospect.company} added as a prospect`, {
            prospectId: prospect.id,
            categoryId: prospect.categoryId,
            detail: prospect.email,
          });
        });
        return prospect;
      },
      addProspects(list) {
        const created = list.map<Prospect>((input) => ({
          id: uid("p"),
          createdAt: new Date().toISOString(),
          status: "new",
          lastContactedAt: null,
          lastResponseAt: null,
          nextFollowUpAt: null,
          ...input,
        }));
        mutate((d) => {
          d.prospects = [...created, ...d.prospects];
          logActivity(d, "prospect_created", `${created.length} prospects imported`, {
            detail: "CSV import",
          });
        });
        return created.length;
      },
      updateProspect(id, patch) {
        mutate((d) => {
          d.prospects = d.prospects.map((p) => (p.id === id ? { ...p, ...patch } : p));
          const p = d.prospects.find((x) => x.id === id);
          if (p) logActivity(d, "prospect_updated", `${p.company} updated`, { prospectId: id });
        });
      },
      deleteProspect(id) {
        mutate((d) => {
          d.prospects = d.prospects.filter((p) => p.id !== id);
          d.recipients = d.recipients.filter((r) => r.prospectId !== id);
          d.followUps = d.followUps.filter((f) => f.prospectId !== id);
        });
      },
      setProspectStatus(id, status) {
        mutate((d) => {
          d.prospects = d.prospects.map((p) => (p.id === id ? { ...p, status } : p));
          const p = d.prospects.find((x) => x.id === id);
          if (p)
            logActivity(d, "status_changed", `${p.company} marked ${status.replace("_", " ")}`, {
              prospectId: id,
              categoryId: p.categoryId,
            });
        });
      },
      addCategory(c) {
        mutate((d) => {
          d.categories = [...d.categories, { ...c, id: uid("cat") }];
        });
      },
      updateCategory(id, patch) {
        mutate((d) => {
          d.categories = d.categories.map((c) => (c.id === id ? { ...c, ...patch } : c));
        });
      },
      deleteCategory(id) {
        mutate((d) => {
          d.categories = d.categories.filter((c) => c.id !== id);
        });
      },
      createCampaign(input, prospectIds) {
        const campaign: Campaign = { ...input, id: uid("c"), createdAt: new Date().toISOString() };
        mutate((d) => {
          d.campaigns = [campaign, ...d.campaigns];
          d.recipients = [
            ...prospectIds.map<CampaignRecipient>((pid) => ({
              id: uid("r"),
              campaignId: campaign.id,
              prospectId: pid,
              state: "queued",
              sentAt: null,
              openedAt: null,
              openCount: 0,
              repliedAt: null,
              followUpAt: null,
              outcome: null,
              subject: campaign.subject,
              body: campaign.body,
            })),
            ...d.recipients,
          ];
          logActivity(d, "campaign_started", `${campaign.name} campaign created`, {
            campaignId: campaign.id,
            categoryId: campaign.categoryId,
            detail: `${prospectIds.length} recipients queued`,
          });
        });
        return campaign;
      },
      updateCampaign(id, patch) {
        mutate((d) => {
          d.campaigns = d.campaigns.map((c) => (c.id === id ? { ...c, ...patch } : c));
          const c = d.campaigns.find((x) => x.id === id);
          if (c && patch.status) {
            const type: ActivityType =
              patch.status === "paused"
                ? "campaign_paused"
                : patch.status === "completed"
                  ? "campaign_completed"
                  : "campaign_started";
            logActivity(d, type, `${c.name} ${patch.status}`, {
              campaignId: c.id,
              categoryId: c.categoryId,
            });
          }
        });
      },
      deleteCampaign(id) {
        mutate((d) => {
          d.campaigns = d.campaigns.filter((c) => c.id !== id);
          d.recipients = d.recipients.filter((r) => r.campaignId !== id);
          d.followUps = d.followUps.filter((f) => f.campaignId !== id);
        });
      },
      sendBatch(campaignId, count) {
        let sent = 0;
        mutate((d) => {
          const campaign = d.campaigns.find((c) => c.id === campaignId);
          if (!campaign) return;
          const limit = count ?? campaign.batchSize;
          const queued = d.recipients.filter((r) => r.campaignId === campaignId && r.state === "queued");
          const batch = queued.slice(0, limit);
          const now = new Date().toISOString();
          const ids = new Set(batch.map((b) => b.id));
          d.recipients = d.recipients.map((r) =>
            ids.has(r.id) ? { ...r, state: "sent", sentAt: now } : r,
          );
          d.prospects = d.prospects.map((p) =>
            batch.some((b) => b.prospectId === p.id)
              ? { ...p, status: p.status === "new" ? "contacted" : p.status, lastContactedAt: now }
              : p,
          );
          for (const b of batch) {
            const prospect = d.prospects.find((p) => p.id === b.prospectId);
            logActivity(d, "email_sent", `${campaign.name} sent to ${prospect?.company ?? "prospect"}`, {
              prospectId: b.prospectId,
              campaignId,
              categoryId: campaign.categoryId,
              detail: campaign.subject,
            });
          }
          sent = batch.length;
          const remaining = d.recipients.filter((r) => r.campaignId === campaignId && r.state === "queued");
          d.campaigns = d.campaigns.map((c) =>
            c.id === campaignId
              ? { ...c, status: remaining.length === 0 ? "completed" : "sending" }
              : c,
          );
        });
        return sent;
      },
      saveTemplate(t) {
        mutate((d) => {
          d.templates = [{ ...t, id: uid("t"), timesUsed: 0, replyRate: 0, won: 0 }, ...d.templates];
        });
      },
      deleteTemplate(id) {
        mutate((d) => {
          d.templates = d.templates.filter((t) => t.id !== id);
        });
      },
      completeFollowUp(id) {
        mutate((d) => {
          d.followUps = d.followUps.map((f) => (f.id === id ? { ...f, status: "sent" } : f));
          const f = d.followUps.find((x) => x.id === id);
          const p = f && d.prospects.find((x) => x.id === f.prospectId);
          if (f && p) {
            d.prospects = d.prospects.map((x) =>
              x.id === p.id ? { ...x, lastContactedAt: new Date().toISOString() } : x,
            );
            logActivity(d, "follow_up_sent", `Follow-up sent to ${p.company}`, {
              prospectId: p.id,
              campaignId: f.campaignId,
            });
          }
        });
      },
      skipFollowUp(id) {
        mutate((d) => {
          d.followUps = d.followUps.map((f) => (f.id === id ? { ...f, status: "skipped" } : f));
        });
      },
      scheduleFollowUp(prospectId, campaignId, dueAt) {
        mutate((d) => {
          d.followUps = [
            { id: uid("f"), prospectId, campaignId, step: 1, dueAt, status: "pending" },
            ...d.followUps,
          ];
          d.prospects = d.prospects.map((p) => (p.id === prospectId ? { ...p, nextFollowUpAt: dueAt } : p));
          const p = d.prospects.find((x) => x.id === prospectId);
          logActivity(d, "follow_up_scheduled", `Follow-up scheduled for ${p?.company ?? "prospect"}`, {
            prospectId,
            campaignId,
          });
        });
      },
      syncAccount(id) {
        mutate((d) => {
          const now = new Date().toISOString();
          d.accounts = d.accounts.map((a) => (a.id === id ? { ...a, lastSyncAt: now } : a));
          const a = d.accounts.find((x) => x.id === id);
          if (a) logActivity(d, "account_synced", `${a.label} synchronised`, { detail: a.address });
        });
      },
      toggleAccount(id) {
        mutate((d) => {
          d.accounts = d.accounts.map((a) =>
            a.id === id
              ? {
                  ...a,
                  status: a.status === "connected" ? "disconnected" : "connected",
                  lastSyncAt: a.status === "connected" ? a.lastSyncAt : new Date().toISOString(),
                }
              : a,
          );
        });
      },
      updateAccount(id, patch) {
        mutate((d) => {
          d.accounts = d.accounts.map((a) => (a.id === id ? { ...a, ...patch } : a));
        });
      },
      duplicateCheck(prospectId, campaignId) {
        const campaign = state.campaigns.find((c) => c.id === campaignId);
        if (!campaign) return undefined;
        // Uniqueness rule: recipient + campaign purpose (not simply email address).
        return state.recipients.find((r) => {
          if (r.prospectId !== prospectId) return false;
          if (!r.sentAt) return false;
          const other = state.campaigns.find((c) => c.id === r.campaignId);
          return other?.purpose === campaign.purpose;
        });
      },
      reset() {
        const fresh = buildDemoState();
        setState(fresh);
      },
    };
  }, [state, ready, mutate, logActivity]);

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useOutreach(): StoreValue {
  const ctx = React.useContext(StoreContext);
  if (!ctx) throw new Error("useOutreach must be used inside <OutreachProvider>");
  return ctx;
}

/* ---------------------------------- selectors --------------------------------- */

export function useLookups() {
  const { categories, accounts, campaigns, prospects } = useOutreach();
  return React.useMemo(
    () => ({
      category: (id?: ID) => categories.find((c) => c.id === id),
      account: (id?: ID) => accounts.find((a) => a.id === id),
      campaign: (id?: ID) => campaigns.find((c) => c.id === id),
      prospect: (id?: ID) => prospects.find((p) => p.id === id),
    }),
    [categories, accounts, campaigns, prospects],
  );
}

export interface CampaignStats {
  recipients: number;
  sent: number;
  delivered: number;
  opened: number;
  replied: number;
  bounced: number;
  interested: number;
  won: number;
  progress: number;
}

export function campaignStats(
  campaignId: ID,
  recipients: CampaignRecipient[],
  prospects: Prospect[],
): CampaignStats {
  const rows = recipients.filter((r) => r.campaignId === campaignId);
  const sent = rows.filter((r) => r.sentAt).length;
  const bounced = rows.filter((r) => r.state === "bounced").length;
  const opened = rows.filter((r) => r.openedAt).length;
  const replied = rows.filter((r) => r.repliedAt).length;
  const statusOf = (pid: ID) => prospects.find((p) => p.id === pid)?.status;
  return {
    recipients: rows.length,
    sent,
    delivered: sent - bounced,
    opened,
    replied,
    bounced,
    interested: rows.filter((r) =>
      ["interested", "meeting", "negotiating", "won"].includes(statusOf(r.prospectId) ?? ""),
    ).length,
    won: rows.filter((r) => statusOf(r.prospectId) === "won").length,
    progress: rows.length ? Math.round((sent / rows.length) * 100) : 0,
  };
}

export function useFollowUpBuckets() {
  const { followUps } = useOutreach();
  return React.useMemo(() => {
    const startOfToday = new Date(NOW);
    startOfToday.setUTCHours(0, 0, 0, 0);
    const endOfToday = new Date(startOfToday.getTime() + 86400000);
    const pending = followUps.filter((f) => f.status === "pending");
    const overdue: FollowUp[] = [];
    const today: FollowUp[] = [];
    const upcoming: FollowUp[] = [];
    for (const f of pending) {
      const due = new Date(f.dueAt);
      if (due < startOfToday) overdue.push(f);
      else if (due < endOfToday) today.push(f);
      else upcoming.push(f);
    }
    const bySoonest = (a: FollowUp, b: FollowUp) => (a.dueAt < b.dueAt ? -1 : 1);
    return {
      overdue: overdue.sort(bySoonest),
      today: today.sort(bySoonest),
      upcoming: upcoming.sort(bySoonest),
      pending,
    };
  }, [followUps]);
}

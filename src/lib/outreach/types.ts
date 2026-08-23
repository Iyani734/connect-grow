// Domain model for OutreachOS.
// Designed to map 1:1 onto relational tables when a backend is added:
// workspaces, users, categories, prospects, campaigns, campaign_recipients,
// emails, email_accounts, templates, follow_ups, activities, tags.

export type ID = string;

export type LeadStatus =
  | "new"
  | "contacted"
  | "opened"
  | "replied"
  | "interested"
  | "meeting"
  | "negotiating"
  | "won"
  | "lost"
  | "not_interested"
  | "do_not_contact";

export const LEAD_STATUSES: LeadStatus[] = [
  "new",
  "contacted",
  "opened",
  "replied",
  "interested",
  "meeting",
  "negotiating",
  "won",
  "lost",
  "not_interested",
  "do_not_contact",
];

export const STATUS_LABEL: Record<LeadStatus, string> = {
  new: "New",
  contacted: "Contacted",
  opened: "Opened",
  replied: "Replied",
  interested: "Interested",
  meeting: "Meeting",
  negotiating: "Negotiating",
  won: "Won",
  lost: "Lost",
  not_interested: "Not Interested",
  do_not_contact: "Do Not Contact",
};

export interface Category {
  id: ID;
  name: string;
  icon: string; // emoji
  color: string; // css var name suffix or hex-free token
  purposes: string[];
  emailAccountId?: ID;
}

export interface EmailAccount {
  id: ID;
  label: string;
  address: string;
  provider: "google" | "microsoft" | "smtp";
  status: "connected" | "disconnected" | "error";
  categoryIds: ID[];
  dailyLimit: number;
  sentToday: number;
  lastSyncAt: string | null;
}

export interface Prospect {
  id: ID;
  company: string;
  contactName: string;
  email: string;
  phone?: string;
  website?: string;
  industry?: string;
  country: string;
  city: string;
  categoryId: ID;
  tags: string[];
  notes?: string;
  status: LeadStatus;
  createdAt: string;
  lastContactedAt?: string | null;
  lastResponseAt?: string | null;
  nextFollowUpAt?: string | null;
}

export type CampaignStatus = "draft" | "scheduled" | "sending" | "paused" | "completed" | "cancelled";

export interface Campaign {
  id: ID;
  name: string;
  categoryId: ID;
  purpose: string;
  description?: string;
  emailAccountId: ID;
  subject: string;
  body: string;
  status: CampaignStatus;
  createdAt: string;
  batchSize: number;
  intervalMinutes: number;
  scheduledAt?: string | null;
}

export type RecipientState =
  | "queued"
  | "sent"
  | "delivered"
  | "opened"
  | "clicked"
  | "replied"
  | "bounced";

export interface CampaignRecipient {
  id: ID;
  campaignId: ID;
  prospectId: ID;
  state: RecipientState;
  sentAt?: string | null;
  openedAt?: string | null;
  openCount: number;
  repliedAt?: string | null;
  followUpAt?: string | null;
  outcome?: Extract<LeadStatus, "interested" | "meeting" | "negotiating" | "won" | "lost" | "not_interested"> | null;
  subject?: string;
  body?: string;
}

export interface Template {
  id: ID;
  name: string;
  categoryId: ID;
  subject: string;
  body: string;
  timesUsed: number;
  replyRate: number;
  won: number;
}

export type FollowUpStatus = "pending" | "sent" | "skipped" | "cancelled";

export interface FollowUp {
  id: ID;
  prospectId: ID;
  campaignId: ID;
  step: number;
  dueAt: string;
  status: FollowUpStatus;
  note?: string;
}

export type ActivityType =
  | "email_sent"
  | "email_opened"
  | "email_replied"
  | "email_bounced"
  | "prospect_created"
  | "prospect_updated"
  | "campaign_started"
  | "campaign_paused"
  | "campaign_completed"
  | "follow_up_scheduled"
  | "follow_up_sent"
  | "account_synced"
  | "status_changed";

export interface Activity {
  id: ID;
  type: ActivityType;
  at: string;
  title: string;
  detail?: string;
  prospectId?: ID;
  campaignId?: ID;
  categoryId?: ID;
}

export interface WorkspaceState {
  user: { name: string; email: string; workspace: string };
  categories: Category[];
  accounts: EmailAccount[];
  prospects: Prospect[];
  campaigns: Campaign[];
  recipients: CampaignRecipient[];
  templates: Template[];
  followUps: FollowUp[];
  activities: Activity[];
}

import * as React from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Plus, RotateCcw, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useOutreach } from "@/lib/outreach/store";
import { PageHeader, Pill, SectionCard } from "@/components/app/primitives";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field } from "@/routes/_authenticated/prospects.index";

export const Route = createFileRoute("/_authenticated/settings")({
  head: () => ({
    meta: [
      { title: "Settings — OutreachOS" },
      { name: "description", content: "Manage workspace profile, outreach categories, sending defaults and integrations." },
      { property: "og:title", content: "Settings — OutreachOS" },
      { property: "og:description", content: "Categories, purposes, sending rules and email provider integrations." },
    ],
  }),
  component: SettingsPage,
});

function SettingsPage() {
  const store = useOutreach();
  const [name, setName] = React.useState("");
  const [icon, setIcon] = React.useState("✨");
  const [purposes, setPurposes] = React.useState("");

  return (
    <div className="space-y-6">
      <PageHeader title="Settings" description="Workspace, categories and integrations." />

      <SectionCard title="Workspace">
        <div className="grid gap-4 sm:grid-cols-3">
          <Field label="Owner">
            <Input readOnly value={store.user.name} />
          </Field>
          <Field label="Email">
            <Input readOnly value={store.user.email} />
          </Field>
          <Field label="Workspace">
            <Input readOnly value={store.user.workspace} />
          </Field>
        </div>
      </SectionCard>

      <SectionCard title="Categories" description="Each category groups prospects, campaigns and a sending address.">
        <div className="space-y-3">
          {store.categories.map((c) => (
            <div key={c.id} className="flex flex-wrap items-center gap-3 rounded-lg border border-border p-3">
              <span className="text-lg">{c.icon}</span>
              <Input
                value={c.name}
                onChange={(e) => store.updateCategory(c.id, { name: e.target.value })}
                className="h-9 w-48"
              />
              <div className="flex flex-wrap gap-1.5">
                {c.purposes.map((p) => (
                  <Pill key={p}>{p}</Pill>
                ))}
              </div>
              <Button
                size="sm"
                variant="ghost"
                className="ml-auto text-destructive"
                onClick={() => {
                  store.deleteCategory(c.id);
                  toast.success("Category removed");
                }}
              >
                <Trash2 className="size-3.5" />
              </Button>
            </div>
          ))}
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-[80px_1fr_2fr_auto] sm:items-end">
          <Field label="Icon">
            <Input value={icon} onChange={(e) => setIcon(e.target.value)} />
          </Field>
          <Field label="Name">
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Event Planning" />
          </Field>
          <Field label="Purposes (comma separated)">
            <Input value={purposes} onChange={(e) => setPurposes(e.target.value)} placeholder="Partnership, Sponsorship" />
          </Field>
          <Button
            onClick={() => {
              if (!name.trim()) {
                toast.error("Give the category a name");
                return;
              }
              store.addCategory({
                name: name.trim(),
                icon: icon || "✨",
                color: "chart-1",
                purposes: purposes
                  .split(",")
                  .map((p) => p.trim())
                  .filter(Boolean),
              });
              setName("");
              setPurposes("");
              toast.success("Category added");
            }}
          >
            <Plus className="size-4" /> Add
          </Button>
        </div>
      </SectionCard>

      <SectionCard
        title="Integrations"
        description="Live sending and reply sync require a backend with OAuth credentials."
      >
        <div className="space-y-3 text-sm text-muted-foreground">
          <p>
            The workspace currently runs in demo mode: data lives in this browser and campaign sends are simulated. To
            send real email you need three things — a server-side database, OAuth apps for Gmail and Microsoft, and a
            sending queue that respects each account's daily limit.
          </p>
          <ul className="list-disc space-y-1 pl-5">
            <li>Google Cloud project with the Gmail API enabled and an OAuth consent screen</li>
            <li>Microsoft Entra app registration with Mail.Send and Mail.Read permissions</li>
            <li>Encrypted refresh-token storage server-side — passwords are never used</li>
            <li>Background sync to pull replies, bounces and thread history back into the CRM</li>
          </ul>
          <p>Ask in chat to enable the backend and I will wire this up.</p>
        </div>
      </SectionCard>

      <SectionCard title="Danger zone" description="Restore the workspace to the original demo dataset.">
        <Button
          variant="outline"
          className="text-destructive"
          onClick={() => {
            store.reset();
            toast.success("Workspace reset to demo data");
          }}
        >
          <RotateCcw className="size-4" /> Reset workspace
        </Button>
      </SectionCard>
    </div>
  );
}

import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import {
  listCityPagesAdmin,
  upsertCityPage,
  deleteCityPage,
  type CityPage,
} from "@/lib/city-pages.functions";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Loader2, Plus, Pencil, Trash2, ArrowLeft, ExternalLink, Save } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/admin/cities")({
  head: () => ({
    meta: [{ title: "Location Pages — Admin" }, { name: "robots", content: "noindex, nofollow" }],
  }),
  component: CityAdminPage,
});

type Draft = Partial<CityPage> & { slug: string; name: string };

const empty = (): Draft => ({
  slug: "",
  name: "",
  postcodes: "",
  intro: "",
  meta_title: "",
  meta_description: "",
  h1: "",
  body: "",
  published: true,
  sort_order: 100,
});

function CityAdminPage() {
  const listFn = useServerFn(listCityPagesAdmin);
  const upsertFn = useServerFn(upsertCityPage);
  const deleteFn = useServerFn(deleteCityPage);
  const qc = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["admin", "city-pages"],
    queryFn: () => listFn(),
  });

  const [editing, setEditing] = useState<Draft | null>(null);

  const saveMut = useMutation({
    mutationFn: (draft: Draft) => upsertFn({ data: draft as any }),
    onSuccess: () => {
      toast.success("Location page saved");
      qc.invalidateQueries({ queryKey: ["admin", "city-pages"] });
      qc.invalidateQueries({ queryKey: ["published-cities"] });
      qc.invalidateQueries({ queryKey: ["city-page"] });
      setEditing(null);
    },
    onError: (e: any) => toast.error(e?.message ?? "Save failed"),
  });

  const deleteMut = useMutation({
    mutationFn: (id: string) => deleteFn({ data: { id } }),
    onSuccess: () => {
      toast.success("Deleted");
      qc.invalidateQueries({ queryKey: ["admin", "city-pages"] });
      qc.invalidateQueries({ queryKey: ["published-cities"] });
    },
    onError: (e: any) => toast.error(e?.message ?? "Delete failed"),
  });

  return (
    <div className="container-x py-8 space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <Link
            to="/admin"
            className="text-xs text-muted-foreground inline-flex items-center gap-1 hover:text-foreground"
          >
            <ArrowLeft className="h-3 w-3" /> Back to dashboard
          </Link>
          <h1 className="mt-1 font-display font-bold text-3xl">Location SEO Pages</h1>
          <p className="text-sm text-muted-foreground">
            Edit the local landing pages at <span className="font-mono">/repairs/[slug]</span>.
            Titles and meta descriptions here appear in Google.
          </p>
        </div>
        <Button onClick={() => setEditing(empty())}>
          <Plus className="h-4 w-4 mr-2" /> New location
        </Button>
      </div>

      <Card className="overflow-hidden">
        {isLoading ? (
          <div className="p-16 grid place-items-center">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        ) : (data ?? []).length === 0 ? (
          <div className="p-16 text-center text-sm text-muted-foreground">
            No location pages yet.
          </div>
        ) : (
          <div className="divide-y">
            {(data ?? []).map((c) => (
              <div key={c.id} className="p-4 flex flex-wrap items-center gap-4">
                <div className="flex-1 min-w-[240px]">
                  <div className="flex items-center gap-2">
                    <div className="font-semibold">{c.name}</div>
                    {c.published ? (
                      <Badge
                        variant="secondary"
                        className="bg-emerald-500/15 text-emerald-700 border-emerald-500/30"
                      >
                        Published
                      </Badge>
                    ) : (
                      <Badge variant="outline">Draft</Badge>
                    )}
                  </div>
                  <div className="text-xs text-muted-foreground font-mono">/repairs/{c.slug}</div>
                  <div className="text-xs text-muted-foreground mt-1 line-clamp-1">
                    {c.meta_title || <span className="italic">No SEO title set</span>}
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button asChild size="sm" variant="ghost">
                    <a href={`/repairs/${c.slug}`} target="_blank" rel="noreferrer">
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => setEditing(c)}>
                    <Pencil className="h-4 w-4 mr-1" /> Edit
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-destructive"
                    onClick={() => {
                      if (confirm(`Delete "${c.name}"?`)) deleteMut.mutate(c.id);
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      <Sheet open={!!editing} onOpenChange={(o) => !o && setEditing(null)}>
        <SheetContent className="w-full sm:max-w-2xl overflow-y-auto">
          <SheetHeader>
            <SheetTitle>{editing?.id ? `Edit ${editing.name}` : "New location page"}</SheetTitle>
          </SheetHeader>
          {editing && (
            <EditForm
              draft={editing}
              onChange={setEditing}
              onSave={() => saveMut.mutate(editing)}
              saving={saveMut.isPending}
            />
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}

function EditForm({
  draft,
  onChange,
  onSave,
  saving,
}: {
  draft: Draft;
  onChange: (d: Draft) => void;
  onSave: () => void;
  saving: boolean;
}) {
  const set = (patch: Partial<Draft>) => onChange({ ...draft, ...patch });
  const titleLen = (draft.meta_title ?? "").length;
  const descLen = (draft.meta_description ?? "").length;

  return (
    <div className="space-y-5 mt-6">
      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <Label>City name</Label>
          <Input
            value={draft.name}
            onChange={(e) => set({ name: e.target.value })}
            placeholder="Liverpool"
          />
        </div>
        <div>
          <Label>URL slug</Label>
          <Input
            value={draft.slug}
            onChange={(e) =>
              set({ slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "-") })
            }
            placeholder="liverpool"
          />
          <p className="text-xs text-muted-foreground mt-1 font-mono">
            /repairs/{draft.slug || "…"}
          </p>
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <Label>Postcodes</Label>
          <Input
            value={draft.postcodes ?? ""}
            onChange={(e) => set({ postcodes: e.target.value })}
            placeholder="L1 – L36"
          />
        </div>
        <div>
          <Label>Sort order</Label>
          <Input
            type="number"
            value={draft.sort_order ?? 0}
            onChange={(e) => set({ sort_order: Number(e.target.value) || 0 })}
          />
        </div>
      </div>

      <div>
        <Label>H1 heading (shown at top of page)</Label>
        <Input
          value={draft.h1 ?? ""}
          onChange={(e) => set({ h1: e.target.value })}
          placeholder="Mobile Phone Repair in Liverpool"
        />
      </div>

      <div>
        <Label>Intro text (shown under the H1)</Label>
        <Textarea
          rows={3}
          value={draft.intro ?? ""}
          onChange={(e) => set({ intro: e.target.value })}
        />
      </div>

      <div className="border-t pt-5 space-y-4">
        <div className="text-sm font-semibold">SEO — appears in Google search results</div>
        <div>
          <div className="flex justify-between">
            <Label>Meta title</Label>
            <span
              className={`text-xs ${titleLen > 60 ? "text-destructive" : "text-muted-foreground"}`}
            >
              {titleLen}/60
            </span>
          </div>
          <Input
            value={draft.meta_title ?? ""}
            onChange={(e) => set({ meta_title: e.target.value })}
            placeholder="Mobile Phone Repair Liverpool | MR KHAN"
          />
        </div>
        <div>
          <div className="flex justify-between">
            <Label>Meta description</Label>
            <span
              className={`text-xs ${descLen > 160 ? "text-destructive" : "text-muted-foreground"}`}
            >
              {descLen}/160
            </span>
          </div>
          <Textarea
            rows={3}
            value={draft.meta_description ?? ""}
            onChange={(e) => set({ meta_description: e.target.value })}
            placeholder="Same-day mobile phone repair in Liverpool…"
          />
        </div>
      </div>

      <div>
        <Label>Page body (optional long-form copy)</Label>
        <Textarea
          rows={8}
          value={draft.body ?? ""}
          onChange={(e) => set({ body: e.target.value })}
          placeholder="Add extra local SEO content — landmarks, neighborhoods, common issues, delivery options…"
        />
      </div>

      <div className="flex items-center justify-between border-t pt-5">
        <div className="flex items-center gap-2">
          <Switch
            checked={draft.published ?? true}
            onCheckedChange={(v) => set({ published: v })}
          />
          <Label className="cursor-pointer">Published (visible on site &amp; sitemap)</Label>
        </div>
        <Button onClick={onSave} disabled={saving || !draft.name || !draft.slug}>
          {saving ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Save className="h-4 w-4 mr-2" />
          )}
          Save
        </Button>
      </div>
    </div>
  );
}

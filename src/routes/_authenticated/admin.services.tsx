import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { listAdminServices, upsertService, deleteService } from "@/lib/cms.functions";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, Plus, Pencil, Trash2, ArrowLeft, Save } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/admin/services")({
  head: () => ({ meta: [{ title: "Services — Admin" }, { name: "robots", content: "noindex" }] }),
  component: ServicesPage,
});

type Draft = any;
const empty = (): Draft => ({
  slug: "",
  title: "",
  short: "",
  description: "",
  category: "repair",
  icon: "Smartphone",
  price_from: "",
  turnaround: "",
  estimated_time: "",
  warranty: "12-month warranty",
  features: [],
  sort_order: 100,
  active: true,
});

function ServicesPage() {
  const listFn = useServerFn(listAdminServices);
  const upsertFn = useServerFn(upsertService);
  const delFn = useServerFn(deleteService);
  const qc = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["admin", "services"],
    queryFn: () => listFn(),
  });
  const [editing, setEditing] = useState<Draft | null>(null);
  const [featuresText, setFeaturesText] = useState("");

  const saveMut = useMutation({
    mutationFn: (d: Draft) => upsertFn({ data: d }),
    onSuccess: () => {
      toast.success("Saved");
      qc.invalidateQueries({ queryKey: ["admin", "services"] });
      qc.invalidateQueries({ queryKey: ["public-services"] });
      setEditing(null);
    },
    onError: (e: any) => toast.error(e?.message ?? "Save failed"),
  });
  const delMut = useMutation({
    mutationFn: (id: string) => delFn({ data: { id } }),
    onSuccess: () => {
      toast.success("Deleted");
      qc.invalidateQueries({ queryKey: ["admin", "services"] });
    },
  });

  const openEdit = (s: any) => {
    setEditing(s ?? empty());
    setFeaturesText((s?.features ?? []).join("\n"));
  };
  const doSave = () => {
    const draft = {
      ...editing,
      features: featuresText
        .split("\n")
        .map((s) => s.trim())
        .filter(Boolean),
    };
    saveMut.mutate(draft);
  };

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
          <h1 className="mt-1 font-display font-bold text-3xl">Services</h1>
          <p className="text-sm text-muted-foreground">
            Repair services shown on the site and in the booking flow.
          </p>
        </div>
        <Button onClick={() => openEdit(null)}>
          <Plus className="h-4 w-4 mr-2" />
          New service
        </Button>
      </div>

      <Card className="overflow-hidden">
        {isLoading ? (
          <div className="p-16 grid place-items-center">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        ) : (data ?? []).length === 0 ? (
          <div className="p-16 text-center text-sm text-muted-foreground">No services yet.</div>
        ) : (
          <div className="divide-y">
            {(data ?? []).map((s: any) => (
              <div key={s.id} className="p-4 flex flex-wrap items-center gap-4">
                <div className="flex-1 min-w-[240px]">
                  <div className="flex items-center gap-2">
                    <div className="font-semibold">{s.title}</div>
                    <Badge variant="outline" className="text-xs">
                      {s.category}
                    </Badge>
                    {s.active ? (
                      <Badge
                        className="bg-emerald-500/15 text-emerald-700 border-emerald-500/30 text-xs"
                        variant="secondary"
                      >
                        Active
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="text-xs">
                        Inactive
                      </Badge>
                    )}
                  </div>
                  <div className="text-xs text-muted-foreground font-mono">/services/{s.slug}</div>
                  <div className="text-xs text-muted-foreground mt-1">
                    From <b>{s.price_from ?? "—"}</b> · {s.turnaround ?? "—"} · Est{" "}
                    {s.estimated_time ?? "—"}
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => openEdit(s)}>
                    <Pencil className="h-4 w-4 mr-1" />
                    Edit
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-destructive"
                    onClick={() => confirm(`Delete "${s.title}"?`) && delMut.mutate(s.id)}
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
            <SheetTitle>{editing?.id ? `Edit ${editing.title}` : "New service"}</SheetTitle>
          </SheetHeader>
          {editing && (
            <div className="space-y-4 mt-6">
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <Label>Title</Label>
                  <Input
                    value={editing.title}
                    onChange={(e) => setEditing({ ...editing, title: e.target.value })}
                  />
                </div>
                <div>
                  <Label>URL slug</Label>
                  <Input
                    value={editing.slug}
                    onChange={(e) =>
                      setEditing({
                        ...editing,
                        slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "-"),
                      })
                    }
                  />
                </div>
              </div>
              <div>
                <Label>Short (one line)</Label>
                <Input
                  value={editing.short ?? ""}
                  onChange={(e) => setEditing({ ...editing, short: e.target.value })}
                />
              </div>
              <div>
                <Label>Description</Label>
                <Textarea
                  rows={4}
                  value={editing.description ?? ""}
                  onChange={(e) => setEditing({ ...editing, description: e.target.value })}
                />
              </div>
              <div className="grid sm:grid-cols-3 gap-4">
                <div>
                  <Label>Category</Label>
                  <Select
                    value={editing.category}
                    onValueChange={(v) => setEditing({ ...editing, category: v })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="device">Device (brand)</SelectItem>
                      <SelectItem value="repair">Repair</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Icon name</Label>
                  <Input
                    value={editing.icon}
                    onChange={(e) => setEditing({ ...editing, icon: e.target.value })}
                    placeholder="Smartphone"
                  />
                </div>
                <div>
                  <Label>Sort order</Label>
                  <Input
                    type="number"
                    value={editing.sort_order}
                    onChange={(e) =>
                      setEditing({ ...editing, sort_order: Number(e.target.value) || 100 })
                    }
                  />
                </div>
              </div>
              <div className="grid sm:grid-cols-4 gap-4">
                <div>
                  <Label>Price from</Label>
                  <Input
                    value={editing.price_from ?? ""}
                    onChange={(e) => setEditing({ ...editing, price_from: e.target.value })}
                    placeholder="£29"
                  />
                </div>
                <div>
                  <Label>Turnaround</Label>
                  <Input
                    value={editing.turnaround ?? ""}
                    onChange={(e) => setEditing({ ...editing, turnaround: e.target.value })}
                    placeholder="1 – 2 hrs"
                  />
                </div>
                <div>
                  <Label>Estimated time</Label>
                  <Input
                    value={editing.estimated_time ?? ""}
                    onChange={(e) => setEditing({ ...editing, estimated_time: e.target.value })}
                    placeholder="Same day"
                  />
                </div>
                <div>
                  <Label>Warranty</Label>
                  <Input
                    value={editing.warranty ?? ""}
                    onChange={(e) => setEditing({ ...editing, warranty: e.target.value })}
                  />
                </div>
              </div>
              <div>
                <Label>Features (one per line)</Label>
                <Textarea
                  rows={5}
                  value={featuresText}
                  onChange={(e) => setFeaturesText(e.target.value)}
                  placeholder="OEM-quality parts&#10;12-month warranty"
                />
              </div>
              <div className="flex items-center justify-between border-t pt-4">
                <div className="flex items-center gap-2">
                  <Switch
                    checked={editing.active}
                    onCheckedChange={(v) => setEditing({ ...editing, active: v })}
                  />
                  <Label className="cursor-pointer">Active</Label>
                </div>
                <Button
                  onClick={doSave}
                  disabled={saveMut.isPending || !editing.title || !editing.slug}
                >
                  {saveMut.isPending ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Save className="h-4 w-4 mr-2" />
                  )}
                  Save
                </Button>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}

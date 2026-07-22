import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { listAdminRepairTypes, upsertRepairType, deleteRepairType } from "@/lib/cms.functions";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Loader2, Plus, Pencil, Trash2, ArrowLeft, Save } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/admin/repair-types")({
  head: () => ({
    meta: [{ title: "Repair Types — Admin" }, { name: "robots", content: "noindex" }],
  }),
  component: RepairTypesPage,
});

function RepairTypesPage() {
  const listFn = useServerFn(listAdminRepairTypes);
  const upsertFn = useServerFn(upsertRepairType);
  const delFn = useServerFn(deleteRepairType);
  const qc = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["admin", "repair-types"],
    queryFn: () => listFn(),
  });
  const [editing, setEditing] = useState<any | null>(null);

  const saveMut = useMutation({
    mutationFn: (d: any) => upsertFn({ data: d }),
    onSuccess: () => {
      toast.success("Saved");
      qc.invalidateQueries({ queryKey: ["admin", "repair-types"] });
      qc.invalidateQueries({ queryKey: ["public-repair-types"] });
      setEditing(null);
    },
    onError: (e: any) => toast.error(e?.message ?? "Save failed"),
  });
  const delMut = useMutation({
    mutationFn: (id: string) => delFn({ data: { id } }),
    onSuccess: () => {
      toast.success("Deleted");
      qc.invalidateQueries({ queryKey: ["admin", "repair-types"] });
    },
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
          <h1 className="mt-1 font-display font-bold text-3xl">Repair Types</h1>
          <p className="text-sm text-muted-foreground">Problem list shown in the booking form.</p>
        </div>
        <Button
          onClick={() =>
            setEditing({
              slug: "",
              name: "",
              description: "",
              icon: "Wrench",
              sort_order: 100,
              active: true,
            })
          }
        >
          <Plus className="h-4 w-4 mr-2" />
          New type
        </Button>
      </div>

      <Card className="overflow-hidden">
        {isLoading ? (
          <div className="p-16 grid place-items-center">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        ) : (
          <div className="divide-y">
            {(data ?? []).map((r: any) => (
              <div key={r.id} className="p-4 flex items-center gap-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <div className="font-semibold">{r.name}</div>
                    {!r.active && (
                      <Badge variant="outline" className="text-xs">
                        Inactive
                      </Badge>
                    )}
                  </div>
                  <div className="text-xs text-muted-foreground">{r.description}</div>
                </div>
                <Button size="sm" variant="outline" onClick={() => setEditing(r)}>
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  className="text-destructive"
                  onClick={() => confirm(`Delete ${r.name}?`) && delMut.mutate(r.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </Card>

      <Sheet open={!!editing} onOpenChange={(o) => !o && setEditing(null)}>
        <SheetContent className="overflow-y-auto">
          <SheetHeader>
            <SheetTitle>{editing?.id ? "Edit repair type" : "New repair type"}</SheetTitle>
          </SheetHeader>
          {editing && (
            <div className="space-y-4 mt-6">
              <div>
                <Label>Name</Label>
                <Input
                  value={editing.name}
                  onChange={(e) => setEditing({ ...editing, name: e.target.value })}
                />
              </div>
              <div>
                <Label>Slug</Label>
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
              <div>
                <Label>Description</Label>
                <Textarea
                  rows={3}
                  value={editing.description ?? ""}
                  onChange={(e) => setEditing({ ...editing, description: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Icon</Label>
                  <Input
                    value={editing.icon}
                    onChange={(e) => setEditing({ ...editing, icon: e.target.value })}
                    placeholder="Wrench"
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
              <div className="flex items-center gap-2">
                <Switch
                  checked={editing.active}
                  onCheckedChange={(v) => setEditing({ ...editing, active: v })}
                />
                <Label>Active</Label>
              </div>
              <Button
                className="w-full"
                onClick={() => saveMut.mutate(editing)}
                disabled={saveMut.isPending || !editing.name || !editing.slug}
              >
                <Save className="h-4 w-4 mr-2" />
                Save
              </Button>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}

import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { listAdminGallery, upsertGallery, deleteGallery } from "@/lib/cms.functions";
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

export const Route = createFileRoute("/_authenticated/admin/gallery")({
  head: () => ({ meta: [{ title: "Gallery — Admin" }, { name: "robots", content: "noindex" }] }),
  component: GalleryPage,
});

function GalleryPage() {
  const listFn = useServerFn(listAdminGallery);
  const upsertFn = useServerFn(upsertGallery);
  const delFn = useServerFn(deleteGallery);
  const qc = useQueryClient();

  const { data, isLoading } = useQuery({ queryKey: ["admin", "gallery"], queryFn: () => listFn() });
  const [editing, setEditing] = useState<any | null>(null);

  const saveMut = useMutation({
    mutationFn: (d: any) => upsertFn({ data: d }),
    onSuccess: () => {
      toast.success("Saved");
      qc.invalidateQueries({ queryKey: ["admin", "gallery"] });
      qc.invalidateQueries({ queryKey: ["public-gallery"] });
      setEditing(null);
    },
    onError: (e: any) => toast.error(e?.message ?? "Save failed"),
  });
  const delMut = useMutation({
    mutationFn: (id: string) => delFn({ data: { id } }),
    onSuccess: () => {
      toast.success("Deleted");
      qc.invalidateQueries({ queryKey: ["admin", "gallery"] });
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
          <h1 className="mt-1 font-display font-bold text-3xl">Gallery</h1>
          <p className="text-sm text-muted-foreground">
            Before/after and workshop images. Paste public image URLs.
          </p>
        </div>
        <Button
          onClick={() =>
            setEditing({
              title: "",
              description: "",
              image_url: "",
              category: "general",
              sort_order: 100,
              published: true,
            })
          }
        >
          <Plus className="h-4 w-4 mr-2" />
          New image
        </Button>
      </div>

      {isLoading ? (
        <div className="grid place-items-center py-16">
          <Loader2 className="h-6 w-6 animate-spin" />
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {(data ?? []).map((g: any) => (
            <Card key={g.id} className="overflow-hidden">
              <div className="aspect-video bg-muted overflow-hidden">
                {g.image_url && (
                  <img
                    src={g.image_url}
                    alt={g.title}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                )}
              </div>
              <div className="p-3 space-y-2">
                <div className="flex items-center gap-2">
                  <div className="font-semibold text-sm flex-1 truncate">{g.title}</div>
                  {!g.published && (
                    <Badge variant="outline" className="text-[10px]">
                      Draft
                    </Badge>
                  )}
                </div>
                <div className="text-xs text-muted-foreground line-clamp-1">{g.description}</div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex-1"
                    onClick={() => setEditing(g)}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-destructive"
                    onClick={() => confirm("Delete?") && delMut.mutate(g.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Sheet open={!!editing} onOpenChange={(o) => !o && setEditing(null)}>
        <SheetContent className="overflow-y-auto">
          <SheetHeader>
            <SheetTitle>{editing?.id ? "Edit image" : "New image"}</SheetTitle>
          </SheetHeader>
          {editing && (
            <div className="space-y-4 mt-6">
              <div>
                <Label>Image URL</Label>
                <Input
                  value={editing.image_url}
                  onChange={(e) => setEditing({ ...editing, image_url: e.target.value })}
                  placeholder="https://…"
                />
              </div>
              {editing.image_url && (
                <img
                  src={editing.image_url}
                  alt="preview"
                  className="rounded-md max-h-64 w-full object-cover border"
                />
              )}
              <div>
                <Label>Title</Label>
                <Input
                  value={editing.title}
                  onChange={(e) => setEditing({ ...editing, title: e.target.value })}
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
                  <Label>Category</Label>
                  <Input
                    value={editing.category}
                    onChange={(e) => setEditing({ ...editing, category: e.target.value })}
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
                  checked={editing.published}
                  onCheckedChange={(v) => setEditing({ ...editing, published: v })}
                />
                <Label>Published</Label>
              </div>
              <Button
                className="w-full"
                onClick={() => saveMut.mutate(editing)}
                disabled={saveMut.isPending || !editing.title || !editing.image_url}
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

import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { listAdminFaqs, upsertFaq, deleteFaq } from "@/lib/cms.functions";
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

export const Route = createFileRoute("/_authenticated/admin/faqs")({
  head: () => ({ meta: [{ title: "FAQs — Admin" }, { name: "robots", content: "noindex" }] }),
  component: FaqsPage,
});

function FaqsPage() {
  const listFn = useServerFn(listAdminFaqs);
  const upsertFn = useServerFn(upsertFaq);
  const delFn = useServerFn(deleteFaq);
  const qc = useQueryClient();

  const { data, isLoading } = useQuery({ queryKey: ["admin", "faqs"], queryFn: () => listFn() });
  const [editing, setEditing] = useState<any | null>(null);

  const saveMut = useMutation({
    mutationFn: (d: any) => upsertFn({ data: d }),
    onSuccess: () => {
      toast.success("Saved");
      qc.invalidateQueries({ queryKey: ["admin", "faqs"] });
      qc.invalidateQueries({ queryKey: ["public-faqs"] });
      setEditing(null);
    },
  });
  const delMut = useMutation({
    mutationFn: (id: string) => delFn({ data: { id } }),
    onSuccess: () => {
      toast.success("Deleted");
      qc.invalidateQueries({ queryKey: ["admin", "faqs"] });
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
          <h1 className="mt-1 font-display font-bold text-3xl">FAQs</h1>
          <p className="text-sm text-muted-foreground">
            Questions shown on the FAQ page and home page.
          </p>
        </div>
        <Button
          onClick={() =>
            setEditing({
              question: "",
              answer: "",
              category: "general",
              sort_order: 100,
              published: true,
            })
          }
        >
          <Plus className="h-4 w-4 mr-2" />
          New FAQ
        </Button>
      </div>

      <div className="grid gap-3">
        {isLoading ? (
          <div className="grid place-items-center py-16">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        ) : (
          (data ?? []).map((f: any) => (
            <Card key={f.id} className="p-4 flex flex-wrap items-start gap-4">
              <div className="flex-1 min-w-[240px]">
                <div className="flex items-center gap-2">
                  <div className="font-semibold">{f.question}</div>
                  <Badge variant="outline" className="text-xs">
                    {f.category}
                  </Badge>
                  {!f.published && (
                    <Badge variant="outline" className="text-xs">
                      Draft
                    </Badge>
                  )}
                </div>
                <div className="text-sm text-muted-foreground mt-1 line-clamp-2">{f.answer}</div>
              </div>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={() => setEditing(f)}>
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  className="text-destructive"
                  onClick={() => confirm("Delete FAQ?") && delMut.mutate(f.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </Card>
          ))
        )}
      </div>

      <Sheet open={!!editing} onOpenChange={(o) => !o && setEditing(null)}>
        <SheetContent className="overflow-y-auto">
          <SheetHeader>
            <SheetTitle>{editing?.id ? "Edit FAQ" : "New FAQ"}</SheetTitle>
          </SheetHeader>
          {editing && (
            <div className="space-y-4 mt-6">
              <div>
                <Label>Question</Label>
                <Input
                  value={editing.question}
                  onChange={(e) => setEditing({ ...editing, question: e.target.value })}
                />
              </div>
              <div>
                <Label>Answer</Label>
                <Textarea
                  rows={6}
                  value={editing.answer}
                  onChange={(e) => setEditing({ ...editing, answer: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Category</Label>
                  <Input
                    value={editing.category}
                    onChange={(e) => setEditing({ ...editing, category: e.target.value })}
                    placeholder="general"
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
                disabled={saveMut.isPending || !editing.question || !editing.answer}
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

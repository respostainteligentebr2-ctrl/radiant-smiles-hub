import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Calendar, FileText, Layers, LogOut, Trash2, Plus, Image as ImageIcon } from "lucide-react";
import { useSession } from "@/lib/use-session";
import {
  appointments as aStore, budgets as bStore, services as svcStore,
  fileToBase64, logout, uid,
  type Appointment, type Budget, type ServiceCard,
} from "@/lib/store";
import { Toaster } from "@/components/ui/sonner";
import { toast } from "sonner";
import { PanelHeader, Field, inputCls, SectionTitle, Empty, StatusBadge } from "./cliente";

export const Route = createFileRoute("/admin")({
  component: AdminPanel,
});

type Tab = "agendamentos" | "orcamentos" | "servicos";

function AdminPanel() {
  const { user, ready } = useSession();
  const navigate = useNavigate();
  const [tab, setTab] = useState<Tab>("agendamentos");

  useEffect(() => {
    if (ready && (!user || user.role !== "admin")) navigate({ to: "/" });
  }, [ready, user, navigate]);

  if (!user || user.role !== "admin") return null;

  return (
    <div className="min-h-screen bg-background">
      <PanelHeader title="Painel administrativo" subtitle={user.name} />
      <div className="mx-auto grid max-w-6xl gap-6 px-4 py-8 sm:px-6 lg:grid-cols-[260px_1fr] lg:px-8">
        <aside className="rounded-2xl border border-border bg-card p-3 lg:sticky lg:top-24 lg:self-start">
          <nav className="flex flex-row gap-1 overflow-x-auto lg:flex-col">
            <NavBtn active={tab === "agendamentos"} onClick={() => setTab("agendamentos")} icon={<Calendar className="h-4 w-4" strokeWidth={1.5} />}>Agendamentos</NavBtn>
            <NavBtn active={tab === "orcamentos"} onClick={() => setTab("orcamentos")} icon={<FileText className="h-4 w-4" strokeWidth={1.5} />}>Orçamentos</NavBtn>
            <NavBtn active={tab === "servicos"} onClick={() => setTab("servicos")} icon={<Layers className="h-4 w-4" strokeWidth={1.5} />}>Cards de Serviços</NavBtn>
            <button
              onClick={() => { logout(); navigate({ to: "/" }); }}
              className="mt-2 flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm text-muted-foreground transition hover:bg-secondary"
            >
              <LogOut className="h-4 w-4" strokeWidth={1.5} /> Sair
            </button>
          </nav>
        </aside>

        <section className="rounded-2xl border border-border bg-card p-6 sm:p-8 shadow-soft">
          {tab === "agendamentos" && <AdminAppointments />}
          {tab === "orcamentos" && <AdminBudgets />}
          {tab === "servicos" && <AdminServices />}
        </section>
      </div>
      <Toaster position="top-center" />
    </div>
  );
}

function NavBtn({
  children, icon, active, onClick,
}: { children: React.ReactNode; icon: React.ReactNode; active?: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`flex shrink-0 items-center gap-2 whitespace-nowrap rounded-lg px-3 py-2.5 text-sm transition ${
        active ? "bg-gradient-luxury text-white" : "text-foreground/80 hover:bg-secondary"
      }`}
    >
      {icon} {children}
    </button>
  );
}

/* ----- Agendamentos ----- */

function AdminAppointments() {
  const [list, setList] = useState<Appointment[]>([]);
  const [filter, setFilter] = useState<"all" | "today" | "week">("all");

  useEffect(() => {
    const refresh = () => setList(aStore.list());
    refresh();
    window.addEventListener("dcr-store-change", refresh);
    return () => window.removeEventListener("dcr-store-change", refresh);
  }, []);

  const setStatus = (id: string, status: Appointment["status"]) => {
    aStore.save(aStore.list().map((a) => a.id === id ? { ...a, status } : a));
    toast.success("Status atualizado.");
  };
  const remove = (id: string) => {
    aStore.save(aStore.list().filter((a) => a.id !== id));
    toast.success("Removido.");
  };

  const filtered = list.filter((a) => {
    if (filter === "all") return true;
    const d = new Date(a.date);
    const now = new Date();
    if (filter === "today") return d.toDateString() === now.toDateString();
    if (filter === "week") {
      const diff = (d.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
      return diff >= -1 && diff <= 7;
    }
    return true;
  });

  return (
    <div>
      <SectionTitle title="Agendamentos" action={
        <div className="flex gap-1 rounded-full border border-border p-1 text-xs">
          {(["all", "today", "week"] as const).map((f) => (
            <button key={f} onClick={() => setFilter(f)} className={`rounded-full px-3 py-1.5 ${filter === f ? "bg-gradient-luxury text-white" : "text-muted-foreground"}`}>
              {f === "all" ? "Todos" : f === "today" ? "Hoje" : "Semana"}
            </button>
          ))}
        </div>
      } />
      {filtered.length === 0 ? (
        <Empty text="Nenhum agendamento." />
      ) : (
        <div className="mt-6 space-y-3">
          {filtered.map((a) => (
            <div key={a.id} className="rounded-xl border border-border p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="font-serif text-lg">{a.userName}</div>
                  <div className="text-xs text-muted-foreground">{a.userEmail}</div>
                  <div className="mt-2 text-sm">
                    <span className="font-medium">{a.service}</span> · {new Date(a.date).toLocaleDateString("pt-BR")} · {a.time}
                  </div>
                  {a.notes && <div className="mt-1 text-xs text-muted-foreground">{a.notes}</div>}
                </div>
                <StatusBadge status={a.status} />
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                <select value={a.status} onChange={(e) => setStatus(a.id, e.target.value as Appointment["status"])} className="rounded-lg border border-input bg-background px-3 py-1.5 text-xs">
                  <option value="agendado">agendado</option>
                  <option value="confirmado">confirmado</option>
                  <option value="realizado">realizado</option>
                  <option value="cancelado">cancelado</option>
                </select>
                <button onClick={() => remove(a.id)} className="inline-flex items-center gap-1 rounded-lg border border-border px-3 py-1.5 text-xs text-muted-foreground hover:text-destructive">
                  <Trash2 className="h-3.5 w-3.5" strokeWidth={1.5} /> Remover
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ----- Orçamentos ----- */

function AdminBudgets() {
  const [list, setList] = useState<Budget[]>([]);
  const [replying, setReplying] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");

  useEffect(() => {
    const refresh = () => setList(bStore.list());
    refresh();
    window.addEventListener("dcr-store-change", refresh);
    return () => window.removeEventListener("dcr-store-change", refresh);
  }, []);

  const reply = (id: string) => {
    if (!replyText.trim()) return toast.error("Escreva uma resposta.");
    bStore.save(bStore.list().map((b) => b.id === id ? { ...b, reply: replyText, status: "respondido" } : b));
    setReplying(null); setReplyText("");
    toast.success("Resposta enviada.");
  };
  const remove = (id: string) => {
    bStore.save(bStore.list().filter((b) => b.id !== id));
    toast.success("Removido.");
  };

  return (
    <div>
      <SectionTitle title="Solicitações de orçamento" />
      {list.length === 0 ? (
        <Empty text="Nenhum orçamento." />
      ) : (
        <div className="mt-6 space-y-3">
          {list.map((b) => (
            <div key={b.id} className="rounded-xl border border-border p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="font-serif text-lg">{b.userName}</div>
                  <div className="text-xs text-muted-foreground">{b.userEmail} · {new Date(b.createdAt).toLocaleDateString("pt-BR")}</div>
                </div>
                <StatusBadge status={b.status} />
              </div>
              <p className="mt-3 text-sm">{b.description}</p>
              {b.attachment && <a href={b.attachment} target="_blank" rel="noreferrer" className="mt-2 inline-block text-xs text-gold underline">Ver anexo</a>}
              {b.reply && (
                <div className="mt-3 rounded-lg border border-gold/30 bg-gold/5 p-3 text-sm">
                  <div className="text-xs uppercase tracking-wider text-gold">Sua resposta</div>
                  <div className="mt-1">{b.reply}</div>
                </div>
              )}
              {replying === b.id ? (
                <div className="mt-3 space-y-2">
                  <textarea rows={3} value={replyText} onChange={(e) => setReplyText(e.target.value)} className={inputCls} placeholder="Resposta..." />
                  <div className="flex gap-2">
                    <button onClick={() => reply(b.id)} className="btn-gold rounded-full px-4 py-2 text-xs">Enviar</button>
                    <button onClick={() => { setReplying(null); setReplyText(""); }} className="rounded-full border border-border px-4 py-2 text-xs">Cancelar</button>
                  </div>
                </div>
              ) : (
                <div className="mt-3 flex gap-2">
                  <button onClick={() => { setReplying(b.id); setReplyText(b.reply ?? ""); }} className="rounded-full border border-gold/50 px-4 py-2 text-xs text-foreground hover:bg-gold/10">
                    {b.reply ? "Editar resposta" : "Responder"}
                  </button>
                  <button onClick={() => remove(b.id)} className="inline-flex items-center gap-1 rounded-full border border-border px-4 py-2 text-xs text-muted-foreground hover:text-destructive">
                    <Trash2 className="h-3.5 w-3.5" strokeWidth={1.5} /> Remover
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ----- Serviços ----- */

function AdminServices() {
  const [list, setList] = useState<ServiceCard[]>([]);
  useEffect(() => {
    const refresh = () => setList(svcStore.list());
    refresh();
    window.addEventListener("dcr-store-change", refresh);
    return () => window.removeEventListener("dcr-store-change", refresh);
  }, []);

  const update = (id: string, patch: Partial<ServiceCard>) => {
    svcStore.save(list.map((s) => s.id === id ? { ...s, ...patch } : s));
  };
  const remove = (id: string) => {
    svcStore.save(list.filter((s) => s.id !== id));
    toast.success("Card removido.");
  };
  const add = () => {
    svcStore.save([
      ...list,
      { id: uid(), image: "https://placehold.co/600x450/eee/aaa?text=Novo", title: "Novo serviço", description: "Descrição do serviço." },
    ]);
    toast.success("Card adicionado.");
  };
  const onFile = async (id: string, file?: File) => {
    if (!file) return;
    if (file.size > 2_000_000) return toast.error("Imagem deve ter até 2MB.");
    const b64 = await fileToBase64(file);
    update(id, { image: b64 });
    toast.success("Imagem atualizada.");
  };

  return (
    <div>
      <SectionTitle title="Cards de Serviços" action={
        <button onClick={add} className="btn-gold inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm">
          <Plus className="h-4 w-4" strokeWidth={1.5} /> Adicionar
        </button>
      } />
      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        {list.map((s) => (
          <div key={s.id} className="rounded-xl border border-border p-4">
            <div className="aspect-[4/3] overflow-hidden rounded-lg border border-border">
              <img src={s.image} alt={s.title} className="h-full w-full object-cover" />
            </div>
            <div className="mt-3 space-y-2">
              <Field label="Título">
                <input value={s.title} onChange={(e) => update(s.id, { title: e.target.value })} className={inputCls} />
              </Field>
              <Field label="Descrição">
                <textarea rows={2} value={s.description} onChange={(e) => update(s.id, { description: e.target.value })} className={inputCls} />
              </Field>
              <Field label="Imagem (URL)">
                <input value={s.image.startsWith("data:") ? "(arquivo enviado)" : s.image} onChange={(e) => update(s.id, { image: e.target.value })} className={inputCls} />
              </Field>
              <label className="inline-flex cursor-pointer items-center gap-2 text-xs text-gold hover:underline">
                <ImageIcon className="h-4 w-4" strokeWidth={1.5} /> Enviar arquivo
                <input type="file" accept="image/*" className="hidden" onChange={(e) => onFile(s.id, e.target.files?.[0])} />
              </label>
              <button onClick={() => remove(s.id)} className="ml-3 inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-destructive">
                <Trash2 className="h-3.5 w-3.5" strokeWidth={1.5} /> Remover card
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

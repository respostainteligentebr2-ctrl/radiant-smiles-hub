import { useEffect, useMemo, useState } from "react";
import { Calendar, FileText, Plus, Search, Pencil, Trash2, X, Check, Phone, Mail, User as UserIcon, MessageSquare } from "lucide-react";
import {
  appointments as aStore,
  budgets as bStore,
  getUsers,
  uid,
  type Appointment,
  type Budget,
} from "@/lib/store";
import { toast } from "sonner";
import { Field, inputCls } from "@/routes/cliente";

type TabKey = "agendamentos" | "orcamentos";
type ApptStatus = Appointment["status"];
type BudgetStatus = Budget["status"];

const APPT_STATUSES: ApptStatus[] = ["agendado", "confirmado", "realizado", "cancelado"];
const BUDGET_STATUSES: BudgetStatus[] = ["pendente", "respondido"];

const statusColor: Record<string, string> = {
  agendado: "bg-blue-100 text-blue-700 border-blue-200",
  confirmado: "bg-emerald-100 text-emerald-700 border-emerald-200",
  realizado: "bg-violet-100 text-violet-700 border-violet-200",
  cancelado: "bg-rose-100 text-rose-700 border-rose-200",
  pendente: "bg-amber-100 text-amber-700 border-amber-200",
  respondido: "bg-emerald-100 text-emerald-700 border-emerald-200",
};

function initials(n: string) {
  return n.trim().split(/\s+/).slice(0, 2).map((w) => w[0]).join("").toUpperCase();
}

function fmtDateBR(iso: string) {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleDateString("pt-BR");
  } catch {
    return iso;
  }
}

export function AdminCRM() {
  const [appts, setAppts] = useState<Appointment[]>([]);
  const [bdgs, setBdgs] = useState<Budget[]>([]);
  const [tab, setTab] = useState<TabKey>("agendamentos");
  const [statusFilter, setStatusFilter] = useState<string>("todos");
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingAppt, setEditingAppt] = useState<Appointment | null>(null);
  const [editingBdg, setEditingBdg] = useState<Budget | null>(null);

  const refresh = () => {
    setAppts(aStore.list());
    setBdgs(bStore.list());
  };

  useEffect(() => { refresh(); }, []);

  const metrics = useMemo(() => ({
    total: appts.length,
    confirmados: appts.filter(a => a.status === "confirmado").length,
    pendentes: bdgs.filter(b => b.status === "pendente").length,
    realizados: appts.filter(a => a.status === "realizado").length,
  }), [appts, bdgs]);

  const filteredAppts = useMemo(() => {
    let r = appts;
    if (statusFilter !== "todos") r = r.filter(a => a.status === statusFilter);
    if (search) {
      const q = search.toLowerCase();
      r = r.filter(a => a.userName.toLowerCase().includes(q) || a.userEmail.toLowerCase().includes(q) || (a.service||"").toLowerCase().includes(q));
    }
    return r;
  }, [appts, statusFilter, search]);

  const filteredBdgs = useMemo(() => {
    let r = bdgs;
    if (statusFilter !== "todos") r = r.filter(b => b.status === statusFilter);
    if (search) {
      const q = search.toLowerCase();
      r = r.filter(b => b.userName.toLowerCase().includes(q) || b.userEmail.toLowerCase().includes(q) || b.description.toLowerCase().includes(q));
    }
    return r;
  }, [bdgs, statusFilter, search]);

  const changeApptStatus = (id: string, status: ApptStatus) => {
    const next = appts.map(a => a.id === id ? { ...a, status } : a);
    aStore.save(next);
    setAppts(next);
    toast.success("Status atualizado");
  };

  const changeBdgStatus = (id: string, status: BudgetStatus) => {
    const next = bdgs.map(b => b.id === id ? { ...b, status } : b);
    bStore.save(next);
    setBdgs(next);
    toast.success("Status atualizado");
  };

  const deleteAppt = (id: string) => {
    if (!confirm("Remover este agendamento?")) return;
    const next = appts.filter(a => a.id !== id);
    aStore.save(next);
    setAppts(next);
    toast.success("Agendamento removido");
  };

  const deleteBdg = (id: string) => {
    if (!confirm("Remover este orçamento?")) return;
    const next = bdgs.filter(b => b.id !== id);
    bStore.save(next);
    setBdgs(next);
    toast.success("Orçamento removido");
  };

  const saveApptEdit = (patch: Appointment) => {
    const next = appts.map(a => a.id === patch.id ? patch : a);
    aStore.save(next);
    setAppts(next);
    setEditingAppt(null);
    toast.success("Agendamento atualizado");
  };

  const saveBdgEdit = (patch: Budget) => {
    const next = bdgs.map(b => b.id === patch.id ? patch : b);
    bStore.save(next);
    setBdgs(next);
    setEditingBdg(null);
    toast.success("Orçamento atualizado");
  };

  const insertLead = (data: {
    nome: string; email: string; phone: string; tipo: "agendamento" | "orcamento";
    servico: string; data: string; hora: string; obs: string;
  }) => {
    if (!data.nome.trim()) return toast.error("Nome é obrigatório");
    const fakeUserId = `lead-${uid()}`;
    if (data.tipo === "agendamento") {
      aStore.add({
        userId: fakeUserId,
        userName: data.nome,
        userEmail: data.email,
        date: data.data,
        time: data.hora,
        service: data.servico || "Avaliação",
        notes: data.obs,
      });
      toast.success("Agendamento inserido");
    } else {
      bStore.add({
        userId: fakeUserId,
        userName: data.nome,
        userEmail: data.email,
        description: data.obs || data.servico || "Lead inserido manualmente",
      });
      toast.success("Lead/orçamento inserido");
    }
    setShowModal(false);
    refresh();
  };

  const statusList = tab === "agendamentos" ? APPT_STATUSES : BUDGET_STATUSES;

  return (
    <div>
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-4">
        <div>
          <div className="text-xs uppercase tracking-widest text-gold">Painel CRM</div>
          <h2 className="font-serif text-2xl">Gestão de consultas e leads</h2>
        </div>
        <button
          onClick={() => { setShowModal(true); }}
          className="inline-flex items-center gap-2 rounded-lg bg-gradient-luxury px-4 py-2 text-sm font-medium text-white shadow-soft transition hover:opacity-90"
        >
          <Plus className="h-4 w-4" /> Novo lead
        </button>
      </div>

      {/* Metrics */}
      <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard label="Agendamentos" value={metrics.total} />
        <MetricCard label="Confirmados" value={metrics.confirmados} />
        <MetricCard label="Orç. pendentes" value={metrics.pendentes} />
        <MetricCard label="Realizados" value={metrics.realizados} />
      </div>

      {/* Search + Tabs */}
      <div className="mt-6 flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Buscar por nome, e-mail ou serviço..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border border-input bg-background py-2 pl-9 pr-3 text-sm focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/20"
          />
        </div>
        <div className="flex gap-1 rounded-lg border border-border p-1">
          <TabBtn active={tab === "agendamentos"} onClick={() => { setTab("agendamentos"); setStatusFilter("todos"); }}>
            <Calendar className="h-3.5 w-3.5" /> Agendamentos ({appts.length})
          </TabBtn>
          <TabBtn active={tab === "orcamentos"} onClick={() => { setTab("orcamentos"); setStatusFilter("todos"); }}>
            <FileText className="h-3.5 w-3.5" /> Orçamentos ({bdgs.length})
          </TabBtn>
        </div>
      </div>

      {/* Status filter */}
      <div className="mt-4 flex flex-wrap gap-2">
        <FilterPill active={statusFilter === "todos"} onClick={() => setStatusFilter("todos")}>Todos</FilterPill>
        {statusList.map(s => (
          <FilterPill key={s} active={statusFilter === s} onClick={() => setStatusFilter(s)}>{s}</FilterPill>
        ))}
      </div>

      {/* List */}
      <div className="mt-5 space-y-3">
        {tab === "agendamentos" ? (
          filteredAppts.length === 0 ? (
            <EmptyState text="Nenhum agendamento encontrado." />
          ) : (
            filteredAppts.map(a => (
              <ApptCard
                key={a.id}
                appt={a}
                onStatus={(s) => changeApptStatus(a.id, s)}
                onEdit={() => setEditingAppt(a)}
                onDelete={() => deleteAppt(a.id)}
              />
            ))
          )
        ) : (
          filteredBdgs.length === 0 ? (
            <EmptyState text="Nenhum orçamento encontrado." />
          ) : (
            filteredBdgs.map(b => (
              <BdgCard
                key={b.id}
                bdg={b}
                onStatus={(s) => changeBdgStatus(b.id, s)}
                onEdit={() => setEditingBdg(b)}
                onDelete={() => deleteBdg(b.id)}
              />
            ))
          )
        )}
      </div>

      {showModal && <NewLeadModal onClose={() => setShowModal(false)} onSave={insertLead} />}
      {editingAppt && <EditApptModal appt={editingAppt} onClose={() => setEditingAppt(null)} onSave={saveApptEdit} />}
      {editingBdg && <EditBdgModal bdg={editingBdg} onClose={() => setEditingBdg(null)} onSave={saveBdgEdit} />}
    </div>
  );
}

function MetricCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-2xl border border-border bg-background px-4 py-3">
      <div className="text-xs uppercase tracking-widest text-muted-foreground">{label}</div>
      <div className="mt-2 font-serif text-3xl">{value}</div>
    </div>
  );
}

function TabBtn({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={`inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition ${active ? "bg-gradient-luxury text-white" : "text-muted-foreground hover:bg-secondary"}`}
    >
      {children}
    </button>
  );
}

function FilterPill({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={`rounded-full border px-3 py-1 text-xs capitalize transition ${active ? "border-gold bg-gold/10 text-gold font-medium" : "border-border text-muted-foreground hover:border-gold/40"}`}
    >
      {children}
    </button>
  );
}

function EmptyState({ text }: { text: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-border bg-card/50 p-10 text-center text-sm text-muted-foreground">
      {text}
    </div>
  );
}

function ApptCard({ appt, onStatus, onEdit, onDelete }: {
  appt: Appointment;
  onStatus: (s: ApptStatus) => void;
  onEdit: () => void;
  onDelete: () => void;
}) {
  return (
    <div className="rounded-2xl border border-border bg-card p-4 transition hover:border-gold/40">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-start gap-3 min-w-0 flex-1">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gold/10 text-xs font-medium text-gold">
            {initials(appt.userName)}
          </div>
          <div className="min-w-0 flex-1">
            <div className="font-serif text-lg truncate">{appt.userName}</div>
            <div className="text-xs text-muted-foreground truncate">{appt.userEmail}</div>
            <div className="mt-2 text-sm">
              <span className="font-medium">{appt.service}</span>
              {appt.date && <> · {fmtDateBR(appt.date)}</>}
              {appt.time && <> · {appt.time}</>}
            </div>
            {appt.notes && <div className="mt-1 text-xs text-muted-foreground">{appt.notes}</div>}
          </div>
        </div>
        <span className={`rounded-full border px-3 py-1 text-xs font-medium capitalize ${statusColor[appt.status]}`}>
          {appt.status}
        </span>
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <select
          value={appt.status}
          onChange={(e) => onStatus(e.target.value as ApptStatus)}
          className="rounded-lg border border-input bg-background px-3 py-1.5 text-xs focus:border-gold focus:outline-none"
        >
          {APPT_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
        <button onClick={onEdit} className="inline-flex items-center gap-1 rounded-lg border border-border px-3 py-1.5 text-xs hover:bg-secondary">
          <Pencil className="h-3 w-3" /> Editar
        </button>
        <button onClick={onDelete} className="inline-flex items-center gap-1 rounded-lg border border-border px-3 py-1.5 text-xs text-rose-600 hover:bg-rose-50">
          <Trash2 className="h-3 w-3" /> Remover
        </button>
      </div>
    </div>
  );
}

function BdgCard({ bdg, onStatus, onEdit, onDelete }: {
  bdg: Budget;
  onStatus: (s: BudgetStatus) => void;
  onEdit: () => void;
  onDelete: () => void;
}) {
  return (
    <div className="rounded-2xl border border-border bg-card p-4 transition hover:border-gold/40">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-start gap-3 min-w-0 flex-1">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gold/10 text-xs font-medium text-gold">
            {initials(bdg.userName)}
          </div>
          <div className="min-w-0 flex-1">
            <div className="font-serif text-lg truncate">{bdg.userName}</div>
            <div className="text-xs text-muted-foreground truncate">{bdg.userEmail}</div>
            <div className="mt-2 text-sm">{fmtDateBR(bdg.createdAt)}</div>
            <p className="mt-2 text-sm text-muted-foreground">{bdg.description}</p>
            {bdg.reply && <p className="mt-1 text-xs italic text-emerald-700">Resposta: {bdg.reply}</p>}
          </div>
        </div>
        <span className={`rounded-full border px-3 py-1 text-xs font-medium capitalize ${statusColor[bdg.status]}`}>
          {bdg.status}
        </span>
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        <button
          onClick={() => onStatus(bdg.status === "pendente" ? "respondido" : "pendente")}
          className="inline-flex items-center gap-1 rounded-lg border border-border px-3 py-1.5 text-xs hover:bg-secondary"
        >
          <Check className="h-3 w-3" />
          {bdg.status === "pendente" ? "Marcar como respondido" : "Reabrir orçamento"}
        </button>
        <button onClick={onEdit} className="inline-flex items-center gap-1 rounded-lg border border-border px-3 py-1.5 text-xs hover:bg-secondary">
          <Pencil className="h-3 w-3" /> Editar
        </button>
        <button onClick={onDelete} className="inline-flex items-center gap-1 rounded-lg border border-border px-3 py-1.5 text-xs text-rose-600 hover:bg-rose-50">
          <Trash2 className="h-3 w-3" /> Remover
        </button>
      </div>
    </div>
  );
}

function ModalShell({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={onClose}>
      <div className="w-full max-w-lg rounded-2xl bg-card p-6 shadow-2xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="mb-4 flex items-center justify-between">
          <h3 className="font-serif text-xl">{title}</h3>
          <button onClick={onClose} className="rounded-lg p-1 hover:bg-secondary"><X className="h-4 w-4" /></button>
        </div>
        {children}
      </div>
    </div>
  );
}

function NewLeadModal({ onClose, onSave }: { onClose: () => void; onSave: (d: any) => void }) {
  const [form, setForm] = useState({
    nome: "", email: "", phone: "", tipo: "agendamento" as "agendamento" | "orcamento",
    servico: "", data: "", hora: "", obs: "",
  });
  const set = (k: string, v: string) => setForm(p => ({ ...p, [k]: v }));
  return (
    <ModalShell title="Novo lead / paciente" onClose={onClose}>
      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="Nome *" full>
          <input className={inputCls} value={form.nome} onChange={(e) => set("nome", e.target.value)} placeholder="Nome completo" />
        </Field>
        <Field label="E-mail">
          <input className={inputCls} type="email" value={form.email} onChange={(e) => set("email", e.target.value)} />
        </Field>
        <Field label="Telefone">
          <input className={inputCls} value={form.phone} onChange={(e) => set("phone", e.target.value)} placeholder="(31) 9 ____-____" />
        </Field>
        <Field label="Tipo">
          <select className={inputCls} value={form.tipo} onChange={(e) => set("tipo", e.target.value)}>
            <option value="agendamento">Agendamento</option>
            <option value="orcamento">Orçamento / lead</option>
          </select>
        </Field>
        <Field label="Serviço">
          <select className={inputCls} value={form.servico} onChange={(e) => set("servico", e.target.value)}>
            <option value="">Selecionar...</option>
            <option>Avaliação</option>
            <option>Clareamento</option>
            <option>Lentes de contato</option>
            <option>Alinhadores</option>
            <option>Implante</option>
            <option>Limpeza</option>
            <option>Outro</option>
          </select>
        </Field>
        {form.tipo === "agendamento" && (
          <>
            <Field label="Data">
              <input className={inputCls} type="date" value={form.data} onChange={(e) => set("data", e.target.value)} />
            </Field>
            <Field label="Horário">
              <input className={inputCls} type="time" value={form.hora} onChange={(e) => set("hora", e.target.value)} />
            </Field>
          </>
        )}
        <Field label="Observação" full>
          <textarea className={inputCls} rows={3} value={form.obs} onChange={(e) => set("obs", e.target.value)} placeholder="Notas sobre o contato..." />
        </Field>
      </div>
      <div className="mt-5 flex justify-end gap-2">
        <button onClick={onClose} className="rounded-lg border border-border px-4 py-2 text-sm hover:bg-secondary">Cancelar</button>
        <button onClick={() => onSave(form)} className="rounded-lg bg-gradient-luxury px-4 py-2 text-sm text-white hover:opacity-90">Salvar</button>
      </div>
    </ModalShell>
  );
}

function EditApptModal({ appt, onClose, onSave }: { appt: Appointment; onClose: () => void; onSave: (a: Appointment) => void }) {
  const [form, setForm] = useState<Appointment>(appt);
  const set = (k: keyof Appointment, v: string) => setForm(p => ({ ...p, [k]: v }));
  return (
    <ModalShell title="Editar agendamento" onClose={onClose}>
      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="Nome" full>
          <input className={inputCls} value={form.userName} onChange={(e) => set("userName", e.target.value)} />
        </Field>
        <Field label="E-mail">
          <input className={inputCls} value={form.userEmail} onChange={(e) => set("userEmail", e.target.value)} />
        </Field>
        <Field label="Serviço">
          <input className={inputCls} value={form.service} onChange={(e) => set("service", e.target.value)} />
        </Field>
        <Field label="Data">
          <input className={inputCls} type="date" value={form.date} onChange={(e) => set("date", e.target.value)} />
        </Field>
        <Field label="Horário">
          <input className={inputCls} type="time" value={form.time} onChange={(e) => set("time", e.target.value)} />
        </Field>
        <Field label="Status" full>
          <select className={inputCls} value={form.status} onChange={(e) => setForm(p => ({ ...p, status: e.target.value as ApptStatus }))}>
            {APPT_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </Field>
        <Field label="Observações" full>
          <textarea className={inputCls} rows={3} value={form.notes || ""} onChange={(e) => set("notes", e.target.value)} />
        </Field>
      </div>
      <div className="mt-5 flex justify-end gap-2">
        <button onClick={onClose} className="rounded-lg border border-border px-4 py-2 text-sm hover:bg-secondary">Cancelar</button>
        <button onClick={() => onSave(form)} className="rounded-lg bg-gradient-luxury px-4 py-2 text-sm text-white hover:opacity-90">Salvar alterações</button>
      </div>
    </ModalShell>
  );
}

function EditBdgModal({ bdg, onClose, onSave }: { bdg: Budget; onClose: () => void; onSave: (b: Budget) => void }) {
  const [form, setForm] = useState<Budget>(bdg);
  const set = (k: keyof Budget, v: string) => setForm(p => ({ ...p, [k]: v }));
  return (
    <ModalShell title="Editar orçamento" onClose={onClose}>
      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="Nome" full>
          <input className={inputCls} value={form.userName} onChange={(e) => set("userName", e.target.value)} />
        </Field>
        <Field label="E-mail" full>
          <input className={inputCls} value={form.userEmail} onChange={(e) => set("userEmail", e.target.value)} />
        </Field>
        <Field label="Status">
          <select className={inputCls} value={form.status} onChange={(e) => setForm(p => ({ ...p, status: e.target.value as BudgetStatus }))}>
            {BUDGET_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </Field>
        <Field label="Descrição" full>
          <textarea className={inputCls} rows={3} value={form.description} onChange={(e) => set("description", e.target.value)} />
        </Field>
        <Field label="Resposta" full>
          <textarea className={inputCls} rows={3} value={form.reply || ""} onChange={(e) => set("reply", e.target.value)} placeholder="Resposta enviada ao paciente..." />
        </Field>
      </div>
      <div className="mt-5 flex justify-end gap-2">
        <button onClick={onClose} className="rounded-lg border border-border px-4 py-2 text-sm hover:bg-secondary">Cancelar</button>
        <button onClick={() => onSave(form)} className="rounded-lg bg-gradient-luxury px-4 py-2 text-sm text-white hover:opacity-90">Salvar alterações</button>
      </div>
    </ModalShell>
  );
}

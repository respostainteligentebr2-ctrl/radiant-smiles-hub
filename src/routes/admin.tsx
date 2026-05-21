import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Calendar, FileText, Layers, LogOut, Trash2, Plus, Image as ImageIcon, Palette, RotateCcw } from "lucide-react";
import { useSession } from "@/lib/use-session";
import {
  appointments as aStore, budgets as bStore, services as svcStore,
  settings as settingsStore, documents as docsStore, getUsers,
  DEFAULT_HERO_IMAGE, DEFAULT_ABOUT_IMAGE,
  fileToBase64, logout, uid,
  type Appointment, type Budget, type ServiceCard, type DocumentTemplate, type DocumentType,
} from "@/lib/store";
import { Toaster } from "@/components/ui/sonner";
import { toast } from "sonner";
import { PanelHeader, Field, inputCls, SectionTitle, Empty, StatusBadge } from "./cliente";

export const Route = createFileRoute("/admin")({
  component: AdminPanel,
});

type Tab = "crm" | "documentos" | "agendamentos" | "orcamentos" | "servicos" | "aparencia";

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
            <NavBtn active={tab === "crm"} onClick={() => setTab("crm")} icon={<Calendar className="h-4 w-4" strokeWidth={1.5} />}>CRM</NavBtn>
            <NavBtn active={tab === "documentos"} onClick={() => setTab("documentos")} icon={<FileText className="h-4 w-4" strokeWidth={1.5} />}>Documentos</NavBtn>
            <NavBtn active={tab === "agendamentos"} onClick={() => setTab("agendamentos")} icon={<Calendar className="h-4 w-4" strokeWidth={1.5} />}>Agendamentos</NavBtn>
            <NavBtn active={tab === "orcamentos"} onClick={() => setTab("orcamentos")} icon={<FileText className="h-4 w-4" strokeWidth={1.5} />}>Orçamentos</NavBtn>
            <NavBtn active={tab === "servicos"} onClick={() => setTab("servicos")} icon={<Layers className="h-4 w-4" strokeWidth={1.5} />}>Cards de Serviços</NavBtn>
            <NavBtn active={tab === "aparencia"} onClick={() => setTab("aparencia")} icon={<Palette className="h-4 w-4" strokeWidth={1.5} />}>Aparência</NavBtn>
            <button
              onClick={() => { logout(); navigate({ to: "/" }); }}
              className="mt-2 flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm text-muted-foreground transition hover:bg-secondary"
            >
              <LogOut className="h-4 w-4" strokeWidth={1.5} /> Sair
            </button>
          </nav>
        </aside>

        <section className="rounded-2xl border border-border bg-card p-6 sm:p-8 shadow-soft">
          {tab === "crm" && <AdminCRM />}
          {tab === "documentos" && <AdminDocuments />}
          {tab === "agendamentos" && <AdminAppointments />}
          {tab === "orcamentos" && <AdminBudgets />}
          {tab === "servicos" && <AdminServices />}
          {tab === "aparencia" && <AdminAppearance />}
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

/* ----- CRM ----- */

function AdminCRM() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [filter, setFilter] = useState<"all" | Appointment["status"]>("all");

  useEffect(() => {
    const refresh = () => {
      setAppointments(aStore.list());
      setBudgets(bStore.list());
    };
    refresh();
    window.addEventListener("dcr-store-change", refresh);
    return () => window.removeEventListener("dcr-store-change", refresh);
  }, []);

  const summary = {
    agendado: appointments.filter((a) => a.status === "agendado").length,
    confirmado: appointments.filter((a) => a.status === "confirmado").length,
    realizado: appointments.filter((a) => a.status === "realizado").length,
    cancelado: appointments.filter((a) => a.status === "cancelado").length,
    totalAppointments: appointments.length,
    pendingBudgets: budgets.filter((b) => b.status === "pendente").length,
    respondedBudgets: budgets.filter((b) => b.status === "respondido").length,
  };

  const filteredAppointments = appointments.filter((a) => (filter === "all" ? true : a.status === filter));

  const setAppointmentStatus = (id: string, status: Appointment["status"]) => {
    aStore.save(aStore.list().map((a) => (a.id === id ? { ...a, status } : a)));
    toast.success("Status do agendamento atualizado.");
  };

  const setBudgetStatus = (id: string, status: Budget["status"]) => {
    bStore.save(bStore.list().map((b) => (b.id === id ? { ...b, status } : b)));
    toast.success("Status do orçamento atualizado.");
  };

  return (
    <div>
      <SectionTitle title="CRM de consultas" action={
        <div className="grid gap-2 sm:grid-cols-3">
          <div className="rounded-2xl border border-border bg-background px-4 py-3 text-sm">
            <div className="text-xs uppercase tracking-widest text-muted-foreground">Agendamentos</div>
            <div className="mt-2 text-3xl font-serif">{summary.totalAppointments}</div>
          </div>
          <div className="rounded-2xl border border-border bg-background px-4 py-3 text-sm">
            <div className="text-xs uppercase tracking-widest text-muted-foreground">Orçamentos pendentes</div>
            <div className="mt-2 text-3xl font-serif">{summary.pendingBudgets}</div>
          </div>
          <div className="rounded-2xl border border-border bg-background px-4 py-3 text-sm">
            <div className="text-xs uppercase tracking-widest text-muted-foreground">Orçamentos respondidos</div>
            <div className="mt-2 text-3xl font-serif">{summary.respondedBudgets}</div>
          </div>
        </div>
      } />

      <div className="mt-6 grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="rounded-2xl border border-border bg-card p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="font-serif text-xl">Agendamentos</h3>
              <p className="text-sm text-muted-foreground">Controle de consultas agendadas, confirmadas, realizadas e canceladas.</p>
            </div>
            <div className="flex flex-wrap gap-2 rounded-full border border-border p-1 text-xs">
              {(["all", "agendado", "confirmado", "realizado", "cancelado"] as const).map((value) => (
                <button
                  key={value}
                  onClick={() => setFilter(value)}
                  className={`rounded-full px-3 py-1.5 ${filter === value ? "bg-gradient-luxury text-white" : "text-muted-foreground"}`}
                >
                  {value === "all" ? "Todos" : value}
                </button>
              ))}
            </div>
          </div>

          {filteredAppointments.length === 0 ? (
            <Empty text="Nenhum agendamento nessa categoria." />
          ) : (
            <div className="mt-5 space-y-3">
              {filteredAppointments.map((a) => (
                <div key={a.id} className="rounded-2xl border border-border p-4">
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
                    <select
                      value={a.status}
                      onChange={(e) => setAppointmentStatus(a.id, e.target.value as Appointment["status"])}
                      className="rounded-lg border border-input bg-background px-3 py-1.5 text-xs"
                    >
                      <option value="agendado">agendado</option>
                      <option value="confirmado">confirmado</option>
                      <option value="realizado">realizado</option>
                      <option value="cancelado">cancelado</option>
                    </select>
                    {a.googleSyncStatus === 'synced' ? (
                      <span className="inline-flex items-center gap-1 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs text-emerald-700">
                        Google Agenda sincronizado
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 rounded-lg border border-border bg-background px-3 py-1.5 text-xs text-muted-foreground">
                        {!a.googleSyncStatus ? 'Pendente de sincronização' : 'Falha na sincronização'}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="rounded-2xl border border-border bg-card p-5">
          <h3 className="font-serif text-xl">Orçamentos</h3>
          <p className="mt-1 text-sm text-muted-foreground">Leads de orçamento com acompanhamento rápido.</p>
          {budgets.length === 0 ? (
            <Empty text="Nenhum orçamento registrado." />
          ) : (
            <div className="mt-5 space-y-3">
              {budgets.map((b) => (
                <div key={b.id} className="rounded-2xl border border-border p-4">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <div className="font-serif text-lg">{b.userName}</div>
                      <div className="text-xs text-muted-foreground">{b.userEmail}</div>
                      <div className="mt-2 text-sm">{new Date(b.createdAt).toLocaleDateString("pt-BR")}</div>
                    </div>
                    <StatusBadge status={b.status} />
                  </div>
                  <p className="mt-3 text-sm text-muted-foreground">{b.description}</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <button
                      onClick={() => setBudgetStatus(b.id, b.status === 'pendente' ? 'respondido' : 'pendente')}
                      className="inline-flex items-center gap-1 rounded-lg border border-border px-3 py-1.5 text-xs text-foreground hover:bg-secondary"
                    >
                      {b.status === 'pendente' ? 'Marcar como respondido' : 'Reabrir orçamento'}
                    </button>
                    {b.reply && <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs text-emerald-700">Resposta registrada</span>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function renderDocumentPreview(template: string, user: { name: string; email: string; phone?: string } | null, service: ServiceCard | null, values: { date: string; term: string; total: string; customNote: string; }) {
  return template
    .replace(/\{\{clientName\}\}/g, user?.name ?? "[nome do cliente]")
    .replace(/\{\{clientEmail\}\}/g, user?.email ?? "[e-mail do cliente]")
    .replace(/\{\{clientPhone\}\}/g, user?.phone ?? "[telefone do cliente]")
    .replace(/\{\{serviceTitle\}\}/g, service?.title ?? "[serviço]")
    .replace(/\{\{serviceDescription\}\}/g, service?.description ?? "[descrição do serviço]")
    .replace(/\{\{date\}\}/g, values.date || new Date().toLocaleDateString("pt-BR"))
    .replace(/\{\{term\}\}/g, values.term || "[prazo]")
    .replace(/\{\{total\}\}/g, values.total || "[valor]")
    .replace(/\{\{customNote\}\}/g, values.customNote || "-");
}

function AdminDocuments() {
  const [templates, setTemplates] = useState<DocumentTemplate[]>([]);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>("");
  const [title, setTitle] = useState("");
  const [type, setType] = useState<DocumentType>("contrato");
  const [content, setContent] = useState("");
  const [selectedUserId, setSelectedUserId] = useState<string>("");
  const [selectedServiceId, setSelectedServiceId] = useState<string>("");
  const [term, setTerm] = useState("6 meses");
  const [total, setTotal] = useState("R$ 0,00");
  const [customNote, setCustomNote] = useState("");

  const users = getUsers();
  const services = svcStore.list();

  useEffect(() => {
    const list = docsStore.list();
    setTemplates(list);
    setSelectedTemplateId(list[0]?.id ?? "");
  }, []);

  useEffect(() => {
    const template = templates.find((t) => t.id === selectedTemplateId) ?? templates[0];
    if (template) {
      setTitle(template.title);
      setType(template.type);
      setContent(template.content);
    }
  }, [selectedTemplateId, templates]);

  useEffect(() => {
    if (!selectedServiceId && services[0]) setSelectedServiceId(services[0].id);
    if (!selectedUserId && users[0]) setSelectedUserId(users[0].id);
  }, [services, users, selectedServiceId, selectedUserId]);

  const user = users.find((u) => u.id === selectedUserId) ?? null;
  const service = services.find((s) => s.id === selectedServiceId) ?? null;
  const preview = renderDocumentPreview(content, user, service, { date: new Date().toLocaleDateString("pt-BR"), term, total, customNote });

  const saveTemplate = () => {
    const next = templates.map((template) =>
      template.id === selectedTemplateId
        ? { ...template, title, type, content }
        : template,
    );
    docsStore.save(next);
    setTemplates(next);
    toast.success("Modelo salvo.");
  };

  const addTemplate = () => {
    const id = uid();
    const next = [
      ...templates,
      {
        id,
        title: "Novo modelo de documento",
        type: "outro" as DocumentType,
        content: "{{clientName}}\n\nDescreva o documento aqui...",
      },
    ];
    docsStore.save(next);
    setTemplates(next);
    setSelectedTemplateId(id);
    toast.success("Novo modelo criado.");
  };

  const deleteTemplate = () => {
    if (templates.length === 1) return toast.error("Pelo menos um modelo deve permanecer.");
    const next = templates.filter((template) => template.id !== selectedTemplateId);
    docsStore.save(next);
    setTemplates(next);
    setSelectedTemplateId(next[0]?.id ?? "");
    toast.success("Modelo removido.");
  };

  const downloadDocument = () => {
    const filename = `${title.toLowerCase().replace(/[^a-z0-9]+/gi, "-").replace(/^-|-$/g, "") || "documento"}.txt`;
    const blob = new Blob([preview], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div>
      <SectionTitle title="Documentos e contratos" action={
        <div className="flex flex-wrap gap-2">
          <button
            onClick={addTemplate}
            className="inline-flex items-center gap-2 rounded-full bg-gold px-4 py-2 text-sm font-medium text-black"
          >
            <Plus className="h-4 w-4" strokeWidth={1.5} /> Novo modelo
          </button>
          <button
            onClick={downloadDocument}
            className="inline-flex items-center gap-2 rounded-full border border-border bg-background px-4 py-2 text-sm text-foreground hover:bg-secondary"
          >
            <FileText className="h-4 w-4" strokeWidth={1.5} /> Baixar documento
          </button>
        </div>
      } />

      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_1fr]">
        <div className="space-y-4">
          <label className="block">
            <span className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-muted-foreground">Modelo</span>
            <select
              value={selectedTemplateId}
              onChange={(e) => setSelectedTemplateId(e.target.value)}
              className="w-full rounded-lg border border-input bg-background px-4 py-2.5 text-sm"
            >
              {templates.map((templateOption) => (
                <option key={templateOption.id} value={templateOption.id}>{templateOption.title}</option>
              ))}
            </select>
          </label>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block">
              <span className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-muted-foreground">Tipo de documento</span>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as DocumentType)}
                className="w-full rounded-lg border border-input bg-background px-4 py-2.5 text-sm"
              >
                <option value="contrato">Contrato</option>
                <option value="recibo">Recibo</option>
                <option value="declaracao">Declaração</option>
                <option value="outro">Outro</option>
              </select>
            </label>
            <label className="block">
              <span className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-muted-foreground">Serviço</span>
              <select
                value={selectedServiceId}
                onChange={(e) => setSelectedServiceId(e.target.value)}
                className="w-full rounded-lg border border-input bg-background px-4 py-2.5 text-sm"
              >
                {services.map((serviceOption) => (
                  <option key={serviceOption.id} value={serviceOption.id}>{serviceOption.title}</option>
                ))}
              </select>
            </label>
          </div>

          <label className="block">
            <span className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-muted-foreground">Título do modelo</span>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full rounded-lg border border-input bg-background px-4 py-2.5 text-sm"
            />
          </label>

          <label className="block">
            <span className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-muted-foreground">Prazo / tempo previsto</span>
            <input
              value={term}
              onChange={(e) => setTerm(e.target.value)}
              className="w-full rounded-lg border border-input bg-background px-4 py-2.5 text-sm"
              placeholder="6 meses"
            />
          </label>

          <label className="block">
            <span className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-muted-foreground">Valor / Condições</span>
            <input
              value={total}
              onChange={(e) => setTotal(e.target.value)}
              className="w-full rounded-lg border border-input bg-background px-4 py-2.5 text-sm"
              placeholder="R$ 0,00"
            />
          </label>

          <label className="block">
            <span className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-muted-foreground">Observações adicionais</span>
            <textarea
              value={customNote}
              onChange={(e) => setCustomNote(e.target.value)}
              className="h-28 w-full rounded-lg border border-input bg-background px-4 py-2.5 text-sm"
              placeholder="Ex.: condições de pagamento, prazos de entrega, observações fiscais"
            />
          </label>

          <label className="block">
            <span className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-muted-foreground">Conteúdo do documento</span>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="h-48 w-full rounded-xl border border-input bg-background px-4 py-3 text-sm font-mono whitespace-pre-wrap"
            />
          </label>

          <div className="flex flex-wrap gap-3">
            <button onClick={saveTemplate} className="inline-flex items-center gap-2 rounded-full bg-gold px-4 py-2 text-sm font-medium text-black">Salvar modelo</button>
            <button onClick={deleteTemplate} className="inline-flex items-center gap-2 rounded-full border border-border px-4 py-2 text-sm text-destructive hover:bg-destructive/10">Excluir modelo</button>
          </div>
        </div>

        <div>
          <div className="rounded-3xl border border-border bg-background p-5">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h3 className="font-serif text-xl">Pré-visualização</h3>
                <p className="mt-1 text-sm text-muted-foreground">Substitui automaticamente os dados do cliente e do serviço.</p>
              </div>
              <div className="rounded-full border border-border px-3 py-1 text-xs text-muted-foreground">{type}</div>
            </div>
            <div className="mt-4 rounded-3xl border border-border bg-card p-4 text-sm leading-relaxed whitespace-pre-wrap">{preview}</div>
          </div>

          <div className="mt-6 rounded-3xl border border-border bg-card p-5">
            <h3 className="font-serif text-xl">Cliente</h3>
            <p className="mt-1 text-sm text-muted-foreground">Selecione o cliente que terá os dados inseridos automaticamente.</p>
            <label className="mt-4 block">
              <select
                value={selectedUserId}
                onChange={(e) => setSelectedUserId(e.target.value)}
                className="w-full rounded-lg border border-input bg-background px-4 py-2.5 text-sm"
              >
                {users.map((userOption) => (
                  <option key={userOption.id} value={userOption.id}>{userOption.name} — {userOption.email}</option>
                ))}
              </select>
            </label>
          </div>
        </div>
      </div>
    </div>
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

  const [syncing, setSyncing] = useState<Record<string, boolean>>({});

  const setStatus = (id: string, status: Appointment["status"]) => {
    aStore.save(aStore.list().map((a) => a.id === id ? { ...a, status } : a));
    toast.success("Status atualizado.");
  };

  const syncToGoogleCalendar = async (appointment: Appointment) => {
    setSyncing((prev) => ({ ...prev, [appointment.id]: true }));
    try {
      const response = await fetch('/api/google-calendar/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userName: appointment.userName,
          userEmail: appointment.userEmail,
          date: appointment.date,
          time: appointment.time,
          service: appointment.service,
          notes: appointment.notes,
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Falha ao sincronizar com Google Agenda.');

      aStore.save(aStore.list().map((a) => a.id === appointment.id ? {
        ...a,
        googleEventId: data.eventId,
        googleCalendarLink: data.htmlLink,
        googleSyncStatus: 'synced',
      } : a));
      toast.success('Agendamento sincronizado com Google Agenda.');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Erro ao enviar para Google Agenda.');
      aStore.save(aStore.list().map((a) => a.id === appointment.id ? {
        ...a,
        googleSyncStatus: 'failed',
      } : a));
    } finally {
      setSyncing((prev) => ({ ...prev, [appointment.id]: false }));
    }
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
                  {a.googleSyncStatus === 'synced' && a.googleCalendarLink && (
                    <a
                      href={a.googleCalendarLink}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-2 inline-block rounded-full bg-emerald-100 px-3 py-1 text-xs text-emerald-700"
                    >
                      Evento no Google Agenda
                    </a>
                  )}
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
                {a.googleSyncStatus !== 'synced' ? (
                  <button
                    onClick={() => syncToGoogleCalendar(a)}
                    disabled={!!syncing[a.id]}
                    className="inline-flex items-center gap-1 rounded-lg border border-border bg-background px-3 py-1.5 text-xs text-foreground transition hover:border-gold hover:bg-gold/5 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {syncing[a.id] ? 'Sincronizando...' : 'Enviar para Google Agenda'}
                  </button>
                ) : (
                  <span className="inline-flex items-center gap-1 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs text-emerald-700">
                    Sincronizado
                  </span>
                )}
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

/* ----- Aparência ----- */

function AdminAppearance() {
  const [heroImage, setHeroImage] = useState<string>(DEFAULT_HERO_IMAGE);
  const [pendingHeroImage, setPendingHeroImage] = useState<string>(DEFAULT_HERO_IMAGE);
  const [aboutImage, setAboutImage] = useState<string>(DEFAULT_ABOUT_IMAGE);
  const [pendingAboutImage, setPendingAboutImage] = useState<string>(DEFAULT_ABOUT_IMAGE);

  useEffect(() => {
    const refresh = () => {
      const currentHero = settingsStore.get().heroImage || DEFAULT_HERO_IMAGE;
      const currentAbout = settingsStore.get().aboutImage || DEFAULT_ABOUT_IMAGE;
      setHeroImage(currentHero);
      setPendingHeroImage(currentHero);
      setAboutImage(currentAbout);
      setPendingAboutImage(currentAbout);
    };
    refresh();
    window.addEventListener("dcr-store-change", refresh);
    return () => window.removeEventListener("dcr-store-change", refresh);
  }, []);

  const saveChanges = () => {
    settingsStore.save({ ...settingsStore.get(), heroImage: pendingHeroImage, aboutImage: pendingAboutImage });
    setHeroImage(pendingHeroImage);
    setAboutImage(pendingAboutImage);
    toast.success("Aparência salva.");
  };

  const onHeroFile = async (file?: File) => {
    if (!file) return;
    if (file.size > 2_500_000) return toast.error("Imagem deve ter até 2.5MB.");
    const b64 = await fileToBase64(file);
    setPendingHeroImage(b64);
    toast.success("Arquivo do Hero carregado. Clique em salvar para confirmar.");
  };

  const onAboutFile = async (file?: File) => {
    if (!file) return;
    if (file.size > 2_500_000) return toast.error("Imagem deve ter até 2.5MB.");
    const b64 = await fileToBase64(file);
    setPendingAboutImage(b64);
    toast.success("Arquivo do ambiente carregado. Clique em salvar para confirmar.");
  };

  const onHeroUrl = (url: string) => {
    setPendingHeroImage(url);
  };

  const onAboutUrl = (url: string) => {
    setPendingAboutImage(url);
  };

  const resetHero = () => {
    setPendingHeroImage(DEFAULT_HERO_IMAGE);
  };

  const resetAbout = () => {
    setPendingAboutImage(DEFAULT_ABOUT_IMAGE);
  };

  const hasChanges = pendingHeroImage !== heroImage || pendingAboutImage !== aboutImage;

  return (
    <div>
      <SectionTitle title="Aparência da página inicial" />
      <p className="mt-2 text-sm text-muted-foreground">
        Personalize a imagem em destaque exibida no Hero da página inicial.
      </p>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_1fr]">
        <div>
          <div className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Pré-visualização</div>
          <div className="mt-3 flex aspect-square w-full max-w-sm items-center justify-center overflow-hidden rounded-3xl border border-gold/30 bg-card p-6 shadow-soft">
            <img src={pendingHeroImage} alt="Hero" className="h-full w-full object-contain" />
          </div>
        </div>

        <div className="space-y-4">
          <Field label="URL da imagem">
            <input
              value={pendingHeroImage.startsWith("data:") ? "(arquivo enviado)" : pendingHeroImage}
              onChange={(e) => onHeroUrl(e.target.value)}
              className={inputCls}
              placeholder="https://..."
            />
          </Field>
          <div>
            <label className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-gold/50 px-4 py-2 text-sm text-foreground hover:bg-gold/10">
              <ImageIcon className="h-4 w-4" strokeWidth={1.5} /> Enviar arquivo
              <input type="file" accept="image/*" className="hidden" onChange={(e) => onHeroFile(e.target.files?.[0])} />
            </label>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <button
              onClick={saveChanges}
              disabled={!hasChanges}
              className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium ${hasChanges ? "btn-gold text-black" : "border border-border bg-muted/20 text-muted-foreground cursor-not-allowed"}`}
            >
              <Palette className="h-4 w-4" strokeWidth={1.5} /> Salvar alterações
            </button>
            <button
              onClick={resetHero}
              className="inline-flex items-center gap-2 rounded-full border border-border px-4 py-2 text-sm text-muted-foreground hover:text-foreground"
            >
              <RotateCcw className="h-4 w-4" strokeWidth={1.5} /> Redefinir
            </button>
          </div>
          <p className="text-xs text-muted-foreground">
            {hasChanges
              ? "Alterações pendentes. Clique em salvar para confirmar." 
              : "Nenhuma alteração pendente."}
          </p>
          <p className="text-xs text-muted-foreground">
            Dica: use imagens com boa resolução e fundo neutro para melhor apresentação.
          </p>
        </div>
      </div>

      <div className="mt-12 rounded-3xl border border-border bg-card p-6 shadow-soft">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="font-serif text-xl">Imagem do ambiente</h3>
            <p className="text-sm text-muted-foreground">Conteúdo de demonstração e fotos internas do consultório.</p>
          </div>
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_1fr]">
          <div>
            <div className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Pré-visualização</div>
            <div className="mt-3 flex aspect-square w-full max-w-sm items-center justify-center overflow-hidden rounded-3xl border border-gold/30 bg-card p-6 shadow-soft">
              <img src={pendingAboutImage} alt="Ambiente" className="h-full w-full object-contain" />
            </div>
          </div>

          <div className="space-y-4">
            <Field label="URL da imagem">
              <input
                value={pendingAboutImage.startsWith("data:") ? "(arquivo enviado)" : pendingAboutImage}
                onChange={(e) => onAboutUrl(e.target.value)}
                className={inputCls}
                placeholder="https://..."
              />
            </Field>
            <div>
              <label className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-gold/50 px-4 py-2 text-sm text-foreground hover:bg-gold/10">
                <ImageIcon className="h-4 w-4" strokeWidth={1.5} /> Enviar arquivo
                <input type="file" accept="image/*" className="hidden" onChange={(e) => onAboutFile(e.target.files?.[0])} />
              </label>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <button
                onClick={saveChanges}
                disabled={!hasChanges}
                className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium ${hasChanges ? "btn-gold text-black" : "border border-border bg-muted/20 text-muted-foreground cursor-not-allowed"}`}
              >
                <Palette className="h-4 w-4" strokeWidth={1.5} /> Salvar alterações
              </button>
              <button
                onClick={() => { resetHero(); resetAbout(); }}
                className="inline-flex items-center gap-2 rounded-full border border-border px-4 py-2 text-sm text-muted-foreground hover:text-foreground"
              >
                <RotateCcw className="h-4 w-4" strokeWidth={1.5} /> Redefinir para padrão
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

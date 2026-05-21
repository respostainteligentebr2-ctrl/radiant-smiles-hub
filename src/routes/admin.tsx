import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  Calendar,
  FileText,
  Layers,
  User as UserIcon,
  LogOut,
  Trash2,
  Plus,
  Image as ImageIcon,
  Palette,
  RotateCcw,
  Clock,
  CreditCard,
  DollarSign,
  MessageCircle,
  Mail,
  LayoutDashboard,
} from "lucide-react";
import { useSession } from "@/lib/use-session";
import {
  appointments as aStore,
  budgets as bStore,
  charges as chargesStore,
  services as svcStore,
  professionals as professionalsStore,
  settings as settingsStore,
  documents as docsStore,
  DEFAULT_HERO_IMAGE,
  fileToBase64,
  getUsers,
  saveUsers,
  updateUser,
  logout,
  uid,
  type Appointment,
  type Budget,
  type Charge,
  type ServiceCard,
  type Professional,
  type DocumentTemplate,
  type DocumentType,
  type User,
} from "@/lib/store";
import { Toaster } from "@/components/ui/sonner";
import { AdminCRM } from "@/components/AdminCRM";
import { toast } from "sonner";
import { PanelHeader, Field, inputCls, SectionTitle, Empty, StatusBadge } from "./cliente";

export const Route = createFileRoute("/admin")({
  component: AdminPanel,
});

type Tab =
  | "crm"
  | "documentos"
  | "agendamentos"
  | "orcamentos"
  | "servicos"
  | "clientes"
  | "horarios"
  | "cobrancas"
  | "profissionais"
  | "aparencia";

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
            <NavBtn active={tab === "clientes"} onClick={() => setTab("clientes")} icon={<UserIcon className="h-4 w-4" strokeWidth={1.5} />}>Pacientes</NavBtn>
            <NavBtn active={tab === "horarios"} onClick={() => setTab("horarios")} icon={<Clock className="h-4 w-4" strokeWidth={1.5} />}>Horários</NavBtn>
            <NavBtn active={tab === "cobrancas"} onClick={() => setTab("cobrancas")} icon={<CreditCard className="h-4 w-4" strokeWidth={1.5} />}>Cobranças</NavBtn>
            <NavBtn active={tab === "profissionais"} onClick={() => setTab("profissionais")} icon={<UserIcon className="h-4 w-4" strokeWidth={1.5} />}>Profissionais</NavBtn>
            <NavBtn active={tab === "aparencia"} onClick={() => setTab("aparencia")} icon={<Palette className="h-4 w-4" strokeWidth={1.5} />}>Aparência</NavBtn>
            <button
              onClick={() => {
                logout();
                navigate({ to: "/" });
              }}
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
          {tab === "clientes" && <AdminClients />}
          {tab === "horarios" && <AdminSchedule />}
          {tab === "cobrancas" && <AdminBilling />}
          {tab === "profissionais" && <AdminProfessionals />}
          {tab === "aparencia" && <AdminAppearance />}
        </section>
      </div>
      <Toaster position="top-center" />
    </div>
  );
}

function NavBtn({
  children,
  icon,
  active,
  onClick,
}: {
  children: React.ReactNode;
  icon: React.ReactNode;
  active?: boolean;
  onClick: () => void;
}) {
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
        content: `{{clientName}}

Descreva o documento aqui...`,
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
      <SectionTitle
        title="Documentos e contratos"
        action={
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
        }
      />

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

function AdminAppointments() {
  const [list, setList] = useState<Appointment[]>([]);
  const [filter, setFilter] = useState<"all" | "today" | "week">("all");

  useEffect(() => {
    const refresh = () => setList(aStore.list());
    refresh();
    window.addEventListener("dcr-store-change", refresh);
    return () => window.removeEventListener("dcr-store-change", refresh);
  }, []);

  const setStatus = async (id: string, status: Appointment["status"]) => {
    const appointments = aStore.list();
    const updated = appointments.map((a) => (a.id === id ? { ...a, status } : a));
    aStore.save(updated);
    setList(updated);

    const appointment = updated.find((a) => a.id === id);
    if (status === "confirmado" && appointment && !appointment.googleEventId) {
      try {
        const response = await fetch("/api/google/event", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            summary: `Consulta: ${appointment.service}`,
            description: `Agendamento de ${appointment.service} para ${appointment.userName}.

Observações: ${appointment.notes ?? "sem observações"}`,
            location:
              "Av. Visconde de Ibituruna, 336 — Sala 107, Barreiro de Baixo, Belo Horizonte, MG",
            startDate: appointment.date,
            startTime: appointment.time,
            durationMinutes: 60,
            attendeeEmail: appointment.userEmail,
            attendeeName: appointment.userName,
            notes: appointment.notes,
          }),
        });

        const data = await response.json();
        if (response.ok && data.id) {
          aStore.save(updated.map((a) => (a.id === id ? { ...a, googleEventId: data.id } : a)));
          setList(aStore.list());
          toast.success("Status atualizado e evento criado no Google Calendar.");
          return;
        }

        throw new Error(data.error || "Falha ao sincronizar com Google Calendar.");
      } catch (error) {
        console.error(error);
        toast.error(
          "Status atualizado, mas não foi possível sincronizar o evento no Google Calendar.",
        );
        return;
      }
    }

    toast.success("Status atualizado.");
  };
  const remove = (id: string) => {
    aStore.save(aStore.list().filter((a) => a.id !== id));
    toast.success("Removido.");
  };

  const getWhatsAppUrl = (appointment: Appointment) => {
    const user = getUsers().find((u) => u.id === appointment.userId);
    const phone = user?.phone?.replace(/[^0-9]/g, "") ?? "";
    if (!phone) return "";
    const formattedPhone = phone.startsWith("55") ? phone : `55${phone}`;
    const message = `Olá ${appointment.userName}, seu agendamento para ${appointment.service} está marcado em ${new Date(appointment.date).toLocaleDateString("pt-BR")} às ${appointment.time}.`;
    return `https://wa.me/${formattedPhone}?text=${encodeURIComponent(message)}`;
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
      <SectionTitle
        title="Agendamentos"
        action={
          <div className="flex gap-1 rounded-full border border-border p-1 text-xs">
            {(["all", "today", "week"] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`rounded-full px-3 py-1.5 ${filter === f ? "bg-gradient-luxury text-white" : "text-muted-foreground"}`}
              >
                {f === "all" ? "Todos" : f === "today" ? "Hoje" : "Semana"}
              </button>
            ))}
          </div>
        }
      />
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
                    {a.professionalName ? ` · ${a.professionalName}` : ""}
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
                {getWhatsAppUrl(a) && (
                  <a href={getWhatsAppUrl(a)} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 rounded-lg border border-gold px-3 py-1.5 text-xs text-gold transition hover:bg-gold/10">
                    <MessageCircle className="h-3.5 w-3.5" strokeWidth={1.5} /> WhatsApp
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

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
    bStore.save(bStore.list().map((b) => (b.id === id ? { ...b, reply: replyText, status: "respondido" } : b)));
    setReplying(null);
    setReplyText("");
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
              {b.attachment && (
                <a href={b.attachment} target="_blank" rel="noreferrer" className="mt-2 inline-block text-xs text-gold underline">Ver anexo</a>
              )}
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

function openPrintableWindow(title: string, content: string) {
  if (typeof window === "undefined") return;
  const printWindow = window.open("", "_blank", "width=900,height=700");
  if (!printWindow) return;
  printWindow.document.write(`
    <html>
      <head>
        <title>${title}</title>
        <style>
          body { font-family: Inter, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; margin: 24px; color: #111; }
          h1 { font-size: 24px; margin-bottom: 16px; }
          table { width: 100%; border-collapse: collapse; margin-top: 16px; }
          th, td { border: 1px solid #ddd; padding: 12px; text-align: left; }
          th { background: #fafafa; }
          .badge { display: inline-flex; border-radius: 999px; padding: 6px 12px; background: #f3f4f6; color: #111; font-size: 13px; }
        </style>
      </head>
      <body>
        <h1>${title}</h1>
        ${content}
      </body>
    </html>
  `);
  printWindow.document.close();
  printWindow.focus();
  printWindow.print();
}

function AdminBilling() {
  const [list, setList] = useState<Charge[]>([]);
  const [clientId, setClientId] = useState("");
  const [chargeType, setChargeType] = useState("Cobrança PIX");
  const [amount, setAmount] = useState("0.00");
  const [dueDate, setDueDate] = useState(new Date().toISOString().slice(0, 10));
  const [notes, setNotes] = useState("");
  const [sendVia, setSendVia] = useState<"none" | "whatsapp" | "email">("none");

  const clients = getUsers().filter((u) => u.role === "cliente");

  useEffect(() => {
    const refresh = () => setList(chargesStore.list());
    refresh();
    window.addEventListener("dcr-store-change", refresh);
    return () => window.removeEventListener("dcr-store-change", refresh);
  }, []);

  const formatMoney = (value: number) =>
    new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);

  const chargeMessage = (charge: Charge) => {
    return `Olá ${charge.clientName}, segue a cobrança de ${charge.type} no valor de ${formatMoney(charge.amount)} com vencimento em ${new Date(charge.dueDate).toLocaleDateString("pt-BR")}.

${charge.notes ?? "Sem observações."}

Caso queira pagar por PIX, utilize a chave cadastrada ou solicite o link. Obrigado.`;
  };

  const getWhatsAppUrl = (charge: Charge) => {
    const phone = charge.clientPhone?.replace(/[^0-9]/g, "") ?? "";
    if (!phone) return "";
    const formattedPhone = phone.startsWith("55") ? phone : `55${phone}`;
    return `https://wa.me/${formattedPhone}?text=${encodeURIComponent(chargeMessage(charge))}`;
  };

  const getEmailUrl = (charge: Charge) => {
    const subject = `Cobrança: ${charge.type} - ${formatMoney(charge.amount)}`;
    return `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(charge.clientEmail)}&su=${encodeURIComponent(subject)}&body=${encodeURIComponent(chargeMessage(charge))}`;
  };

  const sendCharge = (charge: Charge, via: "whatsapp" | "email") => {
    const url = via === "whatsapp" ? getWhatsAppUrl(charge) : getEmailUrl(charge);
    if (!url) return;
    window.open(url, "_blank");
    chargesStore.save(
      list.map((item) =>
        item.id === charge.id ? { ...item, status: "enviado", sentVia: via } : item,
      ),
    );
    toast.success(`Cobrança enviada por ${via === "whatsapp" ? "WhatsApp" : "e-mail"}.`);
  };

  const createCharge = (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientId) return toast.error("Selecione um cliente.");
    if (!amount || Number(amount) <= 0) return toast.error("Informe um valor válido.");
    if (!dueDate) return toast.error("Informe a data de vencimento.");

    const client = clients.find((c) => c.id === clientId);
    if (!client) return toast.error("Cliente inválido.");

    const charge = chargesStore.add({
      clientId: client.id,
      clientName: client.name,
      clientEmail: client.email,
      clientPhone: client.phone,
      amount: Number(amount),
      dueDate,
      type: chargeType,
      notes: notes.trim() || undefined,
    });

    setClientId("");
    setAmount("0.00");
    setDueDate(new Date().toISOString().slice(0, 10));
    setNotes("");
    setSendVia("none");
    toast.success("Cobrança criada.");

    if (sendVia !== "none") {
      setTimeout(() => sendCharge(charge, sendVia), 200);
    }
  };

  const printCharges = () => {
    const rows = list
      .map(
        (charge) => `
      <tr>
        <td>${charge.clientName}</td>
        <td>${charge.type}</td>
        <td>${formatMoney(charge.amount)}</td>
        <td>${new Date(charge.dueDate).toLocaleDateString("pt-BR")}</td>
        <td>${charge.status}</td>
      </tr>
    `,
      )
      .join("");
    const html = `
      <table>
        <thead><tr><th>Cliente</th><th>Tipo</th><th>Valor</th><th>Vencimento</th><th>Status</th></tr></thead>
        <tbody>${rows}</tbody>
      </table>
    `;
    openPrintableWindow("Relatório de cobranças", html);
  };

  return (
    <div>
      <SectionTitle
        title="Cobranças"
        action={
          <button
            onClick={printCharges}
            className="btn-gold inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm"
          >
            <DollarSign className="h-4 w-4" strokeWidth={1.5} /> Exportar PDF
          </button>
        }
      />

      <div className="mt-6 grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
        <div className="rounded-3xl border border-border bg-background/80 p-6">
          <div className="text-sm font-medium text-muted-foreground">Nova cobrança</div>
          <form onSubmit={createCharge} className="mt-6 space-y-4">
            <Field label="Cliente" full>
              <select value={clientId} onChange={(e) => setClientId(e.target.value)} className={inputCls}>
                <option value="">Selecione um cliente</option>
                {clients.map((client) => (
                  <option key={client.id} value={client.id}>
                    {client.name} — {client.email}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Tipo">
              <input value={chargeType} onChange={(e) => setChargeType(e.target.value)} className={inputCls} />
            </Field>
            <Field label="Valor">
              <input type="number" min="0.01" step="0.01" value={amount} onChange={(e) => setAmount(e.target.value)} className={inputCls} />
            </Field>
            <Field label="Vencimento">
              <input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} className={inputCls} />
            </Field>
            <Field label="Observações" full>
              <textarea rows={4} value={notes} onChange={(e) => setNotes(e.target.value)} className={inputCls} />
            </Field>
            <Field label="Enviar agora" full>
              <div className="grid gap-2 sm:grid-cols-3">
                {(["none", "whatsapp", "email"] as const).map((option) => (
                  <button
                    type="button"
                    key={option}
                    onClick={() => setSendVia(option)}
                    className={`rounded-full border px-4 py-2 text-sm transition ${sendVia === option ? "border-gold bg-gold/10 text-foreground" : "border-border bg-background text-muted-foreground hover:border-gold/60"}`}
                  >
                    {option === "none" ? "Nenhum" : option === "whatsapp" ? "WhatsApp" : "Gmail"}
                  </button>
                ))}
              </div>
            </Field>
            <button type="submit" className="btn-gold w-full rounded-full px-6 py-3 text-sm font-medium">Criar cobrança</button>
          </form>
        </div>

        <div className="rounded-3xl border border-border bg-background/80 p-6">
          <div className="text-sm font-medium text-muted-foreground">Status rápido</div>
          <div className="mt-4 space-y-3 text-sm text-foreground">
            <p><span className="font-medium">WhatsApp:</span> abre web ou app com mensagem pronta.</p>
            <p><span className="font-medium">Gmail:</span> abre composição do Gmail com assunto e corpo.</p>
            <p><span className="font-medium">PDF:</span> gera relatórios imprimíveis para salvar como PDF.</p>
          </div>
        </div>
      </div>

      <div className="mt-8">
        {list.length === 0 ? (
          <Empty text="Nenhuma cobrança registrada." />
        ) : (
          <div className="space-y-4">
            {list.map((charge) => (
              <div key={charge.id} className="rounded-3xl border border-border p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <div className="font-serif text-lg">{charge.clientName}</div>
                    <div className="mt-1 text-sm text-muted-foreground">{charge.type} • {new Date(charge.dueDate).toLocaleDateString("pt-BR")}</div>
                    <div className="mt-1 text-sm">{charge.notes || "Sem observações."}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-semibold text-foreground">{formatMoney(charge.amount)}</div>
                    <div className="mt-2 text-xs uppercase tracking-[0.18em] text-muted-foreground">{charge.status}</div>
                  </div>
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  <button type="button" onClick={() => sendCharge(charge, "whatsapp")} className="inline-flex items-center gap-2 rounded-full border border-border px-4 py-2 text-xs text-foreground transition hover:border-gold hover:text-gold" disabled={!charge.clientPhone}>
                    <MessageCircle className="h-4 w-4" strokeWidth={1.5} /> WhatsApp
                  </button>
                  <button type="button" onClick={() => sendCharge(charge, "email")} className="inline-flex items-center gap-2 rounded-full border border-border px-4 py-2 text-xs text-foreground transition hover:border-gold hover:text-gold">
                    <Mail className="h-4 w-4" strokeWidth={1.5} /> Gmail
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function AdminProfessionals() {
  const [list, setList] = useState<Professional[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [cro, setCro] = useState("");
  const [specialties, setSpecialties] = useState("");
  const [businessDays, setBusinessDays] = useState<number[]>([1, 2, 3, 4, 5]);
  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("18:00");
  const [intervalMinutes, setIntervalMinutes] = useState("60");

  useEffect(() => {
    const refresh = () => setList(professionalsStore.list());
    refresh();
    window.addEventListener("dcr-store-change", refresh);
    return () => window.removeEventListener("dcr-store-change", refresh);
  }, []);

  const resetForm = () => {
    setEditingId(null);
    setName("");
    setEmail("");
    setPhone("");
    setCro("");
    setSpecialties("");
    setBusinessDays([1, 2, 3, 4, 5]);
    setStartTime("09:00");
    setEndTime("18:00");
    setIntervalMinutes("60");
  };

  const startEditing = (professional: Professional) => {
    setEditingId(professional.id);
    setName(professional.name);
    setEmail(professional.email ?? "");
    setPhone(professional.phone ?? "");
    setCro(professional.cro ?? "");
    setSpecialties(professional.specialties.join(", ") || "");
    setBusinessDays(professional.businessDays);
    setStartTime(professional.startTime);
    setEndTime(professional.endTime);
    setIntervalMinutes(String(professional.intervalMinutes));
  };

  const toggleDay = (day: number) => {
    setBusinessDays((current) =>
      current.includes(day)
        ? current.filter((d) => d !== day)
        : [...current, day].sort((a, b) => a - b),
    );
  };

  const saveProfessional = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return toast.error("Informe o nome do profissional.");

    const payload = {
      name: name.trim(),
      email: email.trim() || undefined,
      phone: phone.trim() || undefined,
      cro: cro.trim() || undefined,
      specialties: specialties
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean),
      businessDays: businessDays.length ? businessDays : [1, 2, 3, 4, 5],
      startTime: startTime || "09:00",
      endTime: endTime || "18:00",
      intervalMinutes: Number(intervalMinutes) || 60,
    };

    if (editingId) {
      professionalsStore.update(editingId, payload);
      toast.success("Profissional atualizado.");
    } else {
      professionalsStore.add(payload);
      toast.success("Profissional adicionado.");
    }
    resetForm();
  };

  const removeProfessional = (id: string) => {
    if (!window.confirm("Remover profissional? Esta ação não pode ser desfeita.")) return;
    professionalsStore.remove(id);
    toast.success("Profissional removido.");
    if (editingId === id) resetForm();
  };

  return (
    <div>
      <SectionTitle
        title="Profissionais"
        action={
          <button type="button" onClick={resetForm} className="btn-gold inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm">
            <Plus className="h-4 w-4" strokeWidth={1.5} /> Novo profissional
          </button>
        }
      />

      <div className="mt-6 grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
        <div className="rounded-3xl border border-border bg-background/80 p-6">
          <div className="text-sm font-medium text-muted-foreground">Cadastro do profissional</div>
          <form onSubmit={saveProfessional} className="mt-6 space-y-4">
            <Field label="Nome">
              <input value={name} onChange={(e) => setName(e.target.value)} className={inputCls} />
            </Field>
            <Field label="E-mail">
              <input value={email} onChange={(e) => setEmail(e.target.value)} className={inputCls} />
            </Field>
            <Field label="Telefone">
              <input value={phone} onChange={(e) => setPhone(e.target.value)} className={inputCls} />
            </Field>
            <Field label="CRO">
              <input value={cro} onChange={(e) => setCro(e.target.value)} className={inputCls} />
            </Field>
            <Field label="Especialidades" full>
              <input
                value={specialties}
                onChange={(e) => setSpecialties(e.target.value)}
                className={inputCls}
                placeholder="Ex.: Ortodontia, Implantes"
              />
            </Field>
            <Field label="Dias de atendimento" full>
              <div className="flex flex-wrap gap-2">
                {([0, 1, 2, 3, 4, 5, 6] as const).map((day) => (
                  <button
                    key={day}
                    type="button"
                    onClick={() => toggleDay(day)}
                    className={`rounded-full border px-3 py-2 text-xs transition ${businessDays.includes(day) ? "border-gold bg-gold/10 text-foreground" : "border-border text-muted-foreground hover:border-gold/60"}`}
                  >
                    {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'][day]}
                  </button>
                ))}
              </div>
            </Field>
            <div className="grid gap-4 sm:grid-cols-3">
              <Field label="Início">
                <input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} className={inputCls} />
              </Field>
              <Field label="Fim">
                <input type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} className={inputCls} />
              </Field>
              <Field label="Intervalo">
                <input type="number" min="15" step="15" value={intervalMinutes} onChange={(e) => setIntervalMinutes(e.target.value)} className={inputCls} />
              </Field>
            </div>
            <div className="flex gap-3">
              <button type="submit" className="btn-gold rounded-full px-5 py-3 text-sm">{editingId ? "Salvar" : "Adicionar"}</button>
              {editingId && (
                <button type="button" onClick={resetForm} className="rounded-full border border-border px-5 py-3 text-sm text-muted-foreground">Cancelar edição</button>
              )}
            </div>
          </form>
        </div>

        <div className="rounded-3xl border border-border bg-background/80 p-6">
          <div className="text-sm font-medium text-muted-foreground">Agenda por profissional</div>
          <div className="mt-4 space-y-4">
            {list.length === 0 ? (
              <Empty text="Nenhum profissional cadastrado." />
            ) : (
              list.map((professional) => (
                <div key={professional.id} className="rounded-3xl border border-border p-4">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <div className="font-serif text-lg">{professional.name}</div>
                      <div className="mt-1 text-xs text-muted-foreground">{professional.cro ? `CRO ${professional.cro}` : "CRO não informado"}</div>
                    </div>
                    <div className="flex gap-2">
                      <button type="button" onClick={() => startEditing(professional)} className="rounded-full border border-border px-3 py-2 text-xs text-foreground hover:border-gold hover:text-gold">Editar</button>
                      <button type="button" onClick={() => removeProfessional(professional.id)} className="rounded-full border border-border px-3 py-2 text-xs text-destructive hover:bg-destructive/10">Remover</button>
                    </div>
                  </div>
                  <div className="mt-3 text-sm text-muted-foreground">
                    <div>{professional.specialties.join(", ") || "Sem especialidades"}</div>
                    <div className="mt-2">
                      Atendimento: {professional.businessDays.map((day) => ['Dom','Seg','Ter','Qua','Qui','Sex','Sáb'][day]).join(" ")} · {professional.startTime}–{professional.endTime} · intervalo {professional.intervalMinutes} min
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function AdminServices() {
  const [list, setList] = useState<ServiceCard[]>([]);
  useEffect(() => {
    const refresh = () => setList(svcStore.list());
    refresh();
    window.addEventListener("dcr-store-change", refresh);
    return () => window.removeEventListener("dcr-store-change", refresh);
  }, []);

  const update = (id: string, patch: Partial<ServiceCard>) => {
    svcStore.save(list.map((s) => (s.id === id ? { ...s, ...patch } : s)));
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

function AdminSchedule() {
  const [businessDays, setBusinessDays] = useState<number[]>([]);
  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("18:00");
  const [intervalMinutes, setIntervalMinutes] = useState(60);

  useEffect(() => {
    const refresh = () => {
      const settings = settingsStore.get();
      setBusinessDays(settings.businessDays ?? [1, 2, 3, 4, 5]);
      setStartTime(settings.startTime ?? "09:00");
      setEndTime(settings.endTime ?? "18:00");
      setIntervalMinutes(settings.intervalMinutes ?? 60);
    };
    refresh();
    window.addEventListener("dcr-store-change", refresh);
    return () => window.removeEventListener("dcr-store-change", refresh);
  }, []);

  const days = [
    { label: "Dom", value: 0 },
    { label: "Seg", value: 1 },
    { label: "Ter", value: 2 },
    { label: "Qua", value: 3 },
    { label: "Qui", value: 4 },
    { label: "Sex", value: 5 },
    { label: "Sáb", value: 6 },
  ];

  const toggleDay = (value: number) => {
    setBusinessDays((current) =>
      current.includes(value)
        ? current.filter((day) => day !== value)
        : [...current, value].sort((a, b) => a - b),
    );
  };

  const save = (e: React.FormEvent) => {
    e.preventDefault();
    if (!businessDays.length) return toast.error("Selecione pelo menos um dia de atendimento.");
    if (startTime >= endTime) return toast.error("O horário de início deve ser anterior ao horário de fim.");
    if (intervalMinutes <= 0) return toast.error("Intervalo deve ser maior que zero.");

    settingsStore.save({
      ...settingsStore.get(),
      businessDays,
      startTime,
      endTime,
      intervalMinutes,
    });
    toast.success("Configuração de horários salva.");
  };

  return (
    <div>
      <SectionTitle title="Horários de atendimento" />
      <form onSubmit={save} className="mt-6 space-y-6">
        <div className="rounded-3xl border border-border bg-background/80 p-6">
          <div className="text-sm font-medium text-muted-foreground">Dias de atendimento</div>
          <div className="mt-4 flex flex-wrap gap-2">
            {days.map((day) => (
              <button
                key={day.value}
                type="button"
                onClick={() => toggleDay(day.value)}
                className={`rounded-full border px-4 py-2 text-sm transition ${businessDays.includes(day.value) ? "border-gold bg-gold/10 text-foreground" : "border-border bg-background text-muted-foreground hover:border-gold/60"}`}
              >
                {day.label}
              </button>
            ))}
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <Field label="Início" full>
            <input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} className={inputCls} />
          </Field>
          <Field label="Fim" full>
            <input type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} className={inputCls} />
          </Field>
          <Field label="Intervalo (min)" full>
            <input type="number" min={15} value={intervalMinutes} onChange={(e) => setIntervalMinutes(Number(e.target.value))} className={inputCls} />
          </Field>
        </div>

        <div className="rounded-3xl border border-border bg-background/80 p-6">
          <div className="text-sm text-muted-foreground">Pré-visualização</div>
          <div className="mt-3 text-sm text-foreground">
            {businessDays.length > 0 ? (
              <>
                Atendimento em <span className="font-medium">{businessDays.map((day) => ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'][day]).join(', ')}</span>
                <span className="block">Das <span className="font-medium">{startTime}</span> às <span className="font-medium">{endTime}</span></span>
                <span className="block">Intervalo de <span className="font-medium">{intervalMinutes} minutos</span></span>
              </>
            ) : (
              <span className="text-muted-foreground">Nenhum dia selecionado.</span>
            )}
          </div>
        </div>

        <button type="submit" className="btn-gold rounded-full px-6 py-3 text-sm font-medium">Salvar horários</button>
      </form>
    </div>
  );
}

function AdminClients() {
  const [list, setList] = useState<User[]>([]);
  const [search, setSearch] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [manager, setManager] = useState("");

  const refresh = () => setList(getUsers().filter((u) => u.role === "cliente"));

  useEffect(() => {
    refresh();
    window.addEventListener("dcr-store-change", refresh);
    return () => window.removeEventListener("dcr-store-change", refresh);
  }, []);

  const resetForm = () => {
    setEditingId(null);
    setName("");
    setEmail("");
    setPhone("");
    setPassword("");
    setManager("");
  };

  const createOrUpdateClient = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) {
      return toast.error("Preencha nome e e-mail.");
    }

    const users = getUsers();
    const emailTaken = users.find((u) => u.email.toLowerCase() === email.toLowerCase() && u.id !== editingId);
    if (emailTaken) {
      return toast.error("E-mail já cadastrado.");
    }

    if (editingId) {
      updateUser(editingId, {
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim(),
        password: password.trim() || users.find((u) => u.id === editingId)?.password || "",
        manager: manager.trim() || undefined,
      });
      toast.success("Cliente atualizado com sucesso.");
      resetForm();
      return;
    }

    if (!password.trim()) {
      return toast.error("Preencha senha para criar um cliente.");
    }

    saveUsers([
      ...users,
      {
        id: uid(),
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim(),
        password: password.trim(),
        role: "cliente",
        manager: manager.trim() || undefined,
      },
    ]);
    toast.success("Cliente criado com sucesso.");
    resetForm();
  };

  const editClient = (client: User) => {
    setEditingId(client.id);
    setName(client.name);
    setEmail(client.email);
    setPhone(client.phone ?? "");
    setPassword("");
    setManager(client.manager ?? "");
  };

  const removeClient = (id: string) => {
    saveUsers(getUsers().filter((u) => u.id !== id));
    toast.success("Cliente removido.");
  };

  const filteredList = list.filter((client) =>
    [client.name, client.email, client.phone ?? "", client.manager ?? ""]
      .join(" ")
      .toLowerCase()
      .includes(search.toLowerCase()),
  );

  return (
    <div>
      <SectionTitle title="Pacientes" />
      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_1fr]">
        <div className="rounded-3xl border border-border p-6">
          <div className="text-sm font-medium text-muted-foreground">Adicionar novo cliente</div>
          <form onSubmit={createOrUpdateClient} className="mt-6 space-y-4">
            <Field label="Nome">
              <input value={name} onChange={(e) => setName(e.target.value)} className={inputCls} />
            </Field>
            <Field label="E-mail">
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className={inputCls} />
            </Field>
            <Field label="Telefone">
              <input value={phone} onChange={(e) => setPhone(e.target.value)} className={inputCls} />
            </Field>
            <Field label="Senha">
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className={inputCls} />
            </Field>
            <Field label="Gestor responsável" full>
              <input value={manager} onChange={(e) => setManager(e.target.value)} className={inputCls} placeholder="Nome do gestor ou responsável" />
            </Field>
            <div className="flex flex-col gap-3 sm:flex-row">
              <button className="btn-gold w-full rounded-full px-6 py-3 text-sm font-medium">
                {editingId ? "Salvar alterações" : "Criar cliente"}
              </button>
              {editingId && (
                <button type="button" onClick={resetForm} className="inline-flex items-center justify-center rounded-full border border-border bg-background px-6 py-3 text-sm font-medium text-muted-foreground hover:bg-secondary">
                  Cancelar edição
                </button>
              )}
            </div>
          </form>
        </div>

        <div className="rounded-3xl border border-border p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="text-sm font-medium text-muted-foreground">Clientes cadastrados</div>
              <div className="text-xs text-muted-foreground">Total: {list.length} · Com telefone: {list.filter((client) => client.phone).length} · Com gestor: {list.filter((client) => client.manager).length}</div>
            </div>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar clientes..."
              className="w-full rounded-full border border-input bg-background px-4 py-2 text-sm sm:w-64"
            />
          </div>
          {filteredList.length === 0 ? (
            <Empty text="Nenhum cliente cadastrado." />
          ) : (
            <div className="mt-4 space-y-3">
              {list.map((client) => (
                <div key={client.id} className="rounded-2xl border border-border p-4">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <div className="font-serif text-lg">{client.name}</div>
                      <div className="text-xs text-muted-foreground">
                        {client.email}
                        {client.phone ? ` · ${client.phone}` : ""}
                      </div>
                      {client.manager && (
                        <div className="mt-1 text-xs text-muted-foreground">Gestor: {client.manager}</div>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => editClient(client)} className="inline-flex items-center gap-2 rounded-full border border-border bg-background px-3 py-1.5 text-xs text-foreground hover:bg-secondary">
                        <Plus className="h-3.5 w-3.5 rotate-45" strokeWidth={1.5} /> Editar
                      </button>
                      <button onClick={() => removeClient(client.id)} className="inline-flex items-center gap-2 rounded-full border border-border px-3 py-1.5 text-xs text-muted-foreground hover:text-destructive">
                        <Trash2 className="h-3.5 w-3.5" strokeWidth={1.5} /> Remover
                      </button>
                    </div>
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

function AdminAppearance() {
  const [heroImage, setHeroImage] = useState<string>(DEFAULT_HERO_IMAGE);
  const [pendingHeroImage, setPendingHeroImage] = useState<string>(DEFAULT_HERO_IMAGE);

  useEffect(() => {
    const refresh = () => {
      const current = settingsStore.get().heroImage || DEFAULT_HERO_IMAGE;
      setHeroImage(current);
      setPendingHeroImage(current);
    };
    refresh();
    window.addEventListener("dcr-store-change", refresh);
    return () => window.removeEventListener("dcr-store-change", refresh);
  }, []);

  const saveChanges = () => {
    settingsStore.save({ ...settingsStore.get(), heroImage: pendingHeroImage });
    setHeroImage(pendingHeroImage);
    toast.success("Imagem do Hero salva.");
  };

  const onFile = async (file?: File) => {
    if (!file) return;
    if (file.size > 2_500_000) return toast.error("Imagem deve ter até 2.5MB.");
    const b64 = await fileToBase64(file);
    setPendingHeroImage(b64);
    toast.success("Arquivo carregado. Clique em salvar para confirmar.");
  };

  const onUrl = (url: string) => {
    setPendingHeroImage(url);
  };

  const reset = () => {
    setPendingHeroImage(DEFAULT_HERO_IMAGE);
  };

  const hasChanges = pendingHeroImage !== heroImage;

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
              onChange={(e) => onUrl(e.target.value)}
              className={inputCls}
              placeholder="https://..."
            />
          </Field>
          <div>
            <label className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-gold/50 px-4 py-2 text-sm text-foreground hover:bg-gold/10">
              <ImageIcon className="h-4 w-4" strokeWidth={1.5} /> Enviar arquivo
              <input type="file" accept="image/*" className="hidden" onChange={(e) => onFile(e.target.files?.[0])} />
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
            <button onClick={reset} className="inline-flex items-center gap-2 rounded-full border border-border px-4 py-2 text-sm text-muted-foreground hover:text-foreground">
              <RotateCcw className="h-4 w-4" strokeWidth={1.5} /> Redefinir
            </button>
          </div>
          <p className="text-xs text-muted-foreground">
            {hasChanges ? "Alterações pendentes. Clique em salvar para confirmar." : "Nenhuma alteração pendente."}
          </p>
          <p className="text-xs text-muted-foreground">
            Dica: use imagens quadradas (1:1) com fundo neutro para o melhor enquadramento.
          </p>
        </div>
      </div>
    </div>
  );
}

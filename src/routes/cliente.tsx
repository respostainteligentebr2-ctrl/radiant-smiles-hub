import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Calendar, FileText, User as UserIcon, LogOut, Plus, ArrowLeft } from "lucide-react";
import logo from "@/assets/logo-square.png";
import { useSession } from "@/lib/use-session";
import {
  appointments as aStore, budgets as bStore, fileToBase64, logout, updateUser,
  type Appointment, type Budget,
} from "@/lib/store";
import { Toaster } from "@/components/ui/sonner";
import { toast } from "sonner";
import { WhatsAppButton } from "@/components/WhatsAppButton";

const CLINIC_LOCATION = "Av. Visconde de Ibituruna, 336 — Sala 107, Barreiro de Baixo, Belo Horizonte, MG";

function getGoogleMapsRouteUrl(destination: string) {
  return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(destination)}`;
}

function getGoogleCalendarLink(appointment: Appointment) {
  const startDateTime = appointment.date.replace(/-/g, "") + "T" + appointment.time.replace(/:/g, "") + "00";
  const end = new Date(`${appointment.date}T${appointment.time}:00`);
  end.setHours(end.getHours() + 1);
  const endDateTime = `${String(end.getFullYear())}${String(end.getMonth() + 1).padStart(2, "0")}${String(end.getDate()).padStart(2, "0")}T${String(end.getHours()).padStart(2, "0")}${String(end.getMinutes()).padStart(2, "0")}00`;

  const details = `Consulta de ${appointment.service} com a Dra. Camila Resende.\n\nObservações: ${appointment.notes ?? "Nenhuma"}`;
  return `https://www.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(appointment.service)}&dates=${startDateTime}/${endDateTime}&details=${encodeURIComponent(details)}&location=${encodeURIComponent(CLINIC_LOCATION)}&ctz=America/Sao_Paulo`;
}

export const Route = createFileRoute("/cliente")({
  component: ClientePanel,
});

type Tab = "agendamentos" | "orcamentos" | "novo-agendamento" | "novo-orcamento" | "perfil";

function ClientePanel() {
  const { user, ready } = useSession();
  const navigate = useNavigate();
  const [tab, setTab] = useState<Tab>("agendamentos");

  useEffect(() => {
    if (ready && !user) navigate({ to: "/" });
    if (ready && user?.role === "admin") navigate({ to: "/admin" });
  }, [ready, user, navigate]);

  if (!user) return null;

  return (
    <div className="min-h-screen bg-background">
      <PanelHeader title="Minha conta" subtitle={`Olá, ${user.name.split(" ")[0]}`} />
      <div className="mx-auto grid max-w-6xl gap-6 px-4 py-8 sm:px-6 lg:grid-cols-[260px_1fr] lg:px-8">
        <aside className="rounded-2xl border border-border bg-card p-3 lg:sticky lg:top-24 lg:self-start">
          <nav className="flex flex-row gap-1 overflow-x-auto lg:flex-col">
            <NavBtn active={tab === "agendamentos"} onClick={() => setTab("agendamentos")} icon={<Calendar className="h-4 w-4" strokeWidth={1.5} />}>Meus agendamentos</NavBtn>
            <NavBtn active={tab === "novo-agendamento"} onClick={() => setTab("novo-agendamento")} icon={<Plus className="h-4 w-4" strokeWidth={1.5} />}>Agendar consulta</NavBtn>
            <NavBtn active={tab === "orcamentos"} onClick={() => setTab("orcamentos")} icon={<FileText className="h-4 w-4" strokeWidth={1.5} />}>Meus orçamentos</NavBtn>
            <NavBtn active={tab === "novo-orcamento"} onClick={() => setTab("novo-orcamento")} icon={<Plus className="h-4 w-4" strokeWidth={1.5} />}>Solicitar orçamento</NavBtn>
            <NavBtn active={tab === "perfil"} onClick={() => setTab("perfil")} icon={<UserIcon className="h-4 w-4" strokeWidth={1.5} />}>Perfil</NavBtn>
            <button
              onClick={() => { logout(); navigate({ to: "/" }); }}
              className="mt-2 flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm text-muted-foreground transition hover:bg-secondary"
            >
              <LogOut className="h-4 w-4" strokeWidth={1.5} /> Sair
            </button>
          </nav>
        </aside>

        <section className="rounded-2xl border border-border bg-card p-6 sm:p-8 shadow-soft">
          {tab === "agendamentos" && <MyAppointments userId={user.id} onNew={() => setTab("novo-agendamento")} />}
          {tab === "novo-agendamento" && <NewAppointment user={user} onDone={() => setTab("agendamentos")} />}
          {tab === "orcamentos" && <MyBudgets userId={user.id} onNew={() => setTab("novo-orcamento")} />}
          {tab === "novo-orcamento" && <NewBudget user={user} onDone={() => setTab("orcamentos")} />}
          {tab === "perfil" && <Profile />}
        </section>
      </div>
      <WhatsAppButton />
      <Toaster position="top-center" />
    </div>
  );
}

export function PanelHeader({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <header className="border-b border-border bg-background/85 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
        <Link to="/" className="flex items-center gap-3">
          <img src={logo} alt="Logo" className="h-10 w-10 rounded-lg object-contain" />
          <span className="hidden font-serif text-base leading-tight sm:block">
            Dra. Camila Resende
            <span className="block text-[10px] uppercase tracking-[0.22em] text-gold">Odontologia</span>
          </span>
        </Link>
        <div className="text-right">
          <div className="text-xs uppercase tracking-widest text-gold">{title}</div>
          <div className="font-serif text-lg">{subtitle}</div>
        </div>
      </div>
      <div className="mx-auto max-w-6xl px-4 pb-3 sm:px-6 lg:px-8">
        <Link to="/" className="inline-flex items-center gap-2 text-xs text-muted-foreground hover:text-gold">
          <ArrowLeft className="h-3.5 w-3.5" strokeWidth={1.5} /> Voltar ao site
        </Link>
      </div>
    </header>
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

/* ----- Appointments ----- */

function MyAppointments({ userId, onNew }: { userId: string; onNew: () => void }) {
  const [list, setList] = useState<Appointment[]>([]);
  useEffect(() => {
    const refresh = () => setList(aStore.list().filter((a) => a.userId === userId));
    refresh();
    window.addEventListener("dcr-store-change", refresh);
    return () => window.removeEventListener("dcr-store-change", refresh);
  }, [userId]);

  return (
    <div>
      <SectionTitle title="Meus agendamentos" action={
        <button onClick={onNew} className="btn-gold rounded-full px-4 py-2 text-sm">Agendar nova</button>
      } />
      {list.length === 0 ? (
        <Empty text="Você ainda não tem agendamentos." />
      ) : (
        <div className="mt-6 space-y-3">
          {list.map((a) => (
            <div key={a.id} className="rounded-xl border border-border p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="font-serif text-lg">{a.service}</div>
                  <div className="text-sm text-muted-foreground">
                    {new Date(a.date).toLocaleDateString("pt-BR")} · {a.time}
                  </div>
                  {a.notes && <div className="mt-1 text-xs text-muted-foreground">{a.notes}</div>}
                </div>
                <StatusBadge status={a.status} />
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                <a
                  href={getGoogleCalendarLink(a)}
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-full border border-gold px-4 py-2 text-xs font-medium text-gold transition hover:bg-gold/10"
                >
                  Adicionar ao Google Agenda
                </a>
                <a
                  href={getGoogleMapsRouteUrl(CLINIC_LOCATION)}
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-full border border-border bg-background px-4 py-2 text-xs font-medium text-foreground transition hover:border-gold hover:text-gold"
                >
                  Ver rota até a clínica
                </a>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function NewAppointment({ user, onDone }: { user: { id: string; name: string; email: string }; onDone: () => void }) {
  const [date, setDate] = useState("");
  const [time, setTime] = useState("09:00");
  const [service, setService] = useState("Avaliação");
  const [notes, setNotes] = useState("");

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!date) return toast.error("Selecione uma data.");
    aStore.add({
      userId: user.id, userName: user.name, userEmail: user.email,
      date, time, service, notes,
    });
    toast.success("Agendamento solicitado. Aguarde confirmação.");
    onDone();
  };

  const today = new Date().toISOString().slice(0, 10);

  return (
    <div>
      <SectionTitle title="Agendar consulta" />
      <form onSubmit={submit} className="mt-6 grid gap-4 sm:grid-cols-2">
        <Field label="Tratamento">
          <select value={service} onChange={(e) => setService(e.target.value)} className={inputCls}>
            <option>Avaliação</option>
            <option>Clareamento</option>
            <option>Lentes / Facetas</option>
            <option>Alinhadores</option>
            <option>Implantes</option>
            <option>Limpeza</option>
          </select>
        </Field>
        <Field label="Data">
          <input type="date" min={today} value={date} onChange={(e) => setDate(e.target.value)} className={inputCls} required />
        </Field>
        <Field label="Horário">
          <select value={time} onChange={(e) => setTime(e.target.value)} className={inputCls}>
            {["09:00","10:00","11:00","14:00","15:00","16:00","17:00","18:00"].map((t) => <option key={t}>{t}</option>)}
          </select>
        </Field>
        <Field label="Observações" full>
          <textarea rows={3} value={notes} onChange={(e) => setNotes(e.target.value)} className={inputCls} />
        </Field>
        <div className="sm:col-span-2">
          <button className="btn-gold w-full rounded-full py-3 font-medium sm:w-auto sm:px-8">Solicitar agendamento</button>
        </div>
      </form>
    </div>
  );
}

/* ----- Budgets ----- */

function MyBudgets({ userId, onNew }: { userId: string; onNew: () => void }) {
  const [list, setList] = useState<Budget[]>([]);
  useEffect(() => {
    const refresh = () => setList(bStore.list().filter((b) => b.userId === userId));
    refresh();
    window.addEventListener("dcr-store-change", refresh);
    return () => window.removeEventListener("dcr-store-change", refresh);
  }, [userId]);

  return (
    <div>
      <SectionTitle title="Meus orçamentos" action={
        <button onClick={onNew} className="btn-gold rounded-full px-4 py-2 text-sm">Solicitar novo</button>
      } />
      {list.length === 0 ? (
        <Empty text="Nenhum orçamento solicitado ainda." />
      ) : (
        <div className="mt-6 space-y-3">
          {list.map((b) => (
            <div key={b.id} className="rounded-xl border border-border p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="text-sm text-muted-foreground">
                  {new Date(b.createdAt).toLocaleDateString("pt-BR")}
                </div>
                <StatusBadge status={b.status} />
              </div>
              <p className="mt-2 text-sm">{b.description}</p>
              {b.attachment && <a href={b.attachment} target="_blank" rel="noreferrer" className="mt-2 inline-block text-xs text-gold underline">Ver anexo</a>}
              {b.reply && (
                <div className="mt-3 rounded-lg border border-gold/30 bg-gold/5 p-3 text-sm">
                  <div className="text-xs uppercase tracking-wider text-gold">Resposta</div>
                  <div className="mt-1">{b.reply}</div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function NewBudget({ user, onDone }: { user: { id: string; name: string; email: string }; onDone: () => void }) {
  const [description, setDescription] = useState("");
  const [attachment, setAttachment] = useState<string | undefined>();

  const onFile = async (f?: File) => {
    if (!f) return;
    if (f.size > 2_000_000) return toast.error("Arquivo deve ter até 2MB.");
    setAttachment(await fileToBase64(f));
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (description.length < 5) return toast.error("Descreva sua solicitação.");
    bStore.add({
      userId: user.id, userName: user.name, userEmail: user.email,
      description, attachment,
    });
    toast.success("Orçamento solicitado. Em breve entraremos em contato.");
    onDone();
  };

  return (
    <div>
      <SectionTitle title="Solicitar orçamento" />
      <form onSubmit={submit} className="mt-6 space-y-4">
        <Field label="Descreva o que deseja">
          <textarea rows={5} value={description} onChange={(e) => setDescription(e.target.value)} className={inputCls} placeholder="Ex: tenho interesse em lentes de contato nos dentes superiores..." />
        </Field>
        <Field label="Anexar imagem (opcional, até 2MB)">
          <input type="file" accept="image/*" onChange={(e) => onFile(e.target.files?.[0])} className="text-sm" />
        </Field>
        {attachment && <img src={attachment} alt="Anexo" className="h-32 w-32 rounded-lg object-cover" />}
        <button className="btn-gold rounded-full px-8 py-3 font-medium">Enviar solicitação</button>
      </form>
    </div>
  );
}

/* ----- Profile ----- */

function Profile() {
  const { user } = useSession();
  const [name, setName] = useState(user?.name ?? "");
  const [phone, setPhone] = useState(user?.phone ?? "");
  const [email, setEmail] = useState(user?.email ?? "");

  if (!user) return null;

  const save = (e: React.FormEvent) => {
    e.preventDefault();
    updateUser(user.id, { name, phone, email });
    toast.success("Perfil atualizado.");
  };

  return (
    <div>
      <SectionTitle title="Meu perfil" />
      <form onSubmit={save} className="mt-6 grid gap-4 sm:grid-cols-2">
        <Field label="Nome"><input value={name} onChange={(e) => setName(e.target.value)} className={inputCls} /></Field>
        <Field label="Telefone"><input value={phone} onChange={(e) => setPhone(e.target.value)} className={inputCls} /></Field>
        <Field label="E-mail" full><input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className={inputCls} /></Field>
        <div className="sm:col-span-2">
          <button className="btn-gold rounded-full px-8 py-3 font-medium">Salvar alterações</button>
        </div>
      </form>
    </div>
  );
}

/* ----- helpers ----- */

export const inputCls = "w-full rounded-lg border border-input bg-background px-4 py-2.5 text-sm focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/20";

export function Field({ label, children, full }: { label: string; children: React.ReactNode; full?: boolean }) {
  return (
    <label className={`block ${full ? "sm:col-span-2" : ""}`}>
      <span className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-muted-foreground">{label}</span>
      {children}
    </label>
  );
}

export function SectionTitle({ title, action }: { title: string; action?: React.ReactNode }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-4">
      <h2 className="font-serif text-2xl">{title}</h2>
      {action}
    </div>
  );
}

export function Empty({ text }: { text: string }) {
  return <div className="mt-6 rounded-xl border border-dashed border-border p-10 text-center text-sm text-muted-foreground">{text}</div>;
}

export function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    agendado: "bg-blue-100 text-blue-700",
    confirmado: "bg-emerald-100 text-emerald-700",
    realizado: "bg-zinc-200 text-zinc-700",
    cancelado: "bg-red-100 text-red-700",
    pendente: "bg-amber-100 text-amber-700",
    respondido: "bg-emerald-100 text-emerald-700",
    enviado: "bg-sky-100 text-sky-700",
    pago: "bg-emerald-100 text-emerald-700",
  };
  return (
    <span className={`rounded-full px-3 py-1 text-xs font-medium capitalize ${map[status] ?? "bg-secondary"}`}>
      {status}
    </span>
  );
}

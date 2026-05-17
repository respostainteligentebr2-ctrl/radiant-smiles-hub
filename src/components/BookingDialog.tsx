import { useEffect, useMemo, useState } from "react";
import { format, isSameDay } from "date-fns";
import { ptBR } from "date-fns/locale";
import { CalendarDays, Clock, Check, ArrowRight, ArrowLeft, Sparkles } from "lucide-react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { appointments as aStore } from "@/lib/store";
import { useSession } from "@/lib/use-session";
import { toast } from "sonner";

const SERVICES = [
  "Avaliação",
  "Clareamento",
  "Lentes / Facetas",
  "Alinhadores",
  "Implantes",
  "Limpeza",
];
const TIMES = ["09:00", "10:00", "11:00", "14:00", "15:00", "16:00", "17:00", "18:00"];

type Props = {
  open: boolean;
  onClose: () => void;
  onRequireAuth: () => void;
  defaultService?: string;
};

export function BookingDialog({ open, onClose, onRequireAuth, defaultService }: Props) {
  const { user } = useSession();
  const [step, setStep] = useState(0);
  const [service, setService] = useState(defaultService ?? "Avaliação");
  const [date, setDate] = useState<Date | undefined>();
  const [time, setTime] = useState<string>("");
  const [notes, setNotes] = useState("");

  useEffect(() => {
    if (open) {
      setStep(0);
      setService(defaultService ?? "Avaliação");
      setDate(undefined);
      setTime("");
      setNotes("");
    }
  }, [open, defaultService]);

  const todayMin = useMemo(() => {
    const d = new Date(); d.setHours(0, 0, 0, 0); return d;
  }, []);

  const canNext =
    (step === 0 && !!service) ||
    (step === 1 && !!date && !!time) ||
    step === 2;

  const confirm = () => {
    if (!user) { onRequireAuth(); return; }
    if (!date || !time) return;
    aStore.add({
      userId: user.id,
      userName: user.name,
      userEmail: user.email,
      date: format(date, "yyyy-MM-dd"),
      time,
      service,
      notes,
    });
    toast.success("Agendamento solicitado. Aguarde confirmação.");
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-3xl gap-0 overflow-hidden p-0 sm:rounded-3xl">
        <DialogTitle className="sr-only">Agendar consulta</DialogTitle>
        <div className="grid md:grid-cols-[1.05fr_1fr]">
          {/* Side panel */}
          <aside className="relative hidden flex-col justify-between bg-gradient-luxury p-8 text-white md:flex">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/10 px-3 py-1 text-[11px] uppercase tracking-[0.18em] backdrop-blur">
                <Sparkles className="h-3.5 w-3.5" strokeWidth={1.5} /> Agendamento
              </div>
              <h2 className="mt-6 font-serif text-3xl leading-tight">
                Reserve seu horário
                <span className="block italic opacity-90">com a Dra. Camila</span>
              </h2>
              <p className="mt-4 max-w-sm text-sm leading-relaxed text-white/85">
                Selecione o tratamento, o melhor dia e horário. Confirmaremos seu
                agendamento por WhatsApp em até 1 dia útil.
              </p>
            </div>

            <ol className="mt-8 space-y-3 text-sm">
              {["Tratamento", "Data e horário", "Confirmação"].map((label, i) => (
                <li key={label} className="flex items-center gap-3">
                  <span className={cn(
                    "flex h-7 w-7 items-center justify-center rounded-full border text-xs font-medium transition",
                    i < step && "border-white bg-white text-foreground",
                    i === step && "border-white bg-white/20",
                    i > step && "border-white/40 text-white/70",
                  )}>
                    {i < step ? <Check className="h-3.5 w-3.5" strokeWidth={2} /> : i + 1}
                  </span>
                  <span className={cn("tracking-wide", i === step ? "font-medium" : "text-white/80")}>
                    {label}
                  </span>
                </li>
              ))}
            </ol>

            <div className="text-[11px] uppercase tracking-[0.2em] text-white/70">
              Atendimento · Seg a Sex · 09h–19h
            </div>
          </aside>

          {/* Step content */}
          <div className="flex max-h-[85vh] flex-col overflow-y-auto p-6 sm:p-8">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <div className="text-[11px] uppercase tracking-[0.18em] text-gold">
                  Passo {step + 1} de 3
                </div>
                <h3 className="mt-1 font-serif text-2xl">
                  {step === 0 && "Escolha o tratamento"}
                  {step === 1 && "Selecione data e horário"}
                  {step === 2 && "Revisar e confirmar"}
                </h3>
              </div>
            </div>

            {step === 0 && (
              <div className="grid gap-3 sm:grid-cols-2">
                {SERVICES.map((s) => (
                  <button
                    key={s}
                    onClick={() => setService(s)}
                    className={cn(
                      "group rounded-xl border p-4 text-left transition",
                      service === s
                        ? "border-gold bg-gold/5 shadow-soft"
                        : "border-border hover:border-gold/50 hover:bg-secondary/40",
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-serif text-base">{s}</span>
                      <span className={cn(
                        "flex h-5 w-5 items-center justify-center rounded-full border",
                        service === s ? "border-gold bg-gold text-white" : "border-border",
                      )}>
                        {service === s && <Check className="h-3 w-3" strokeWidth={2.5} />}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            )}

            {step === 1 && (
              <div className="space-y-6">
                <div className="rounded-2xl border border-border bg-secondary/30 p-2">
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={setDate}
                    locale={ptBR}
                    disabled={(d) => d < todayMin || d.getDay() === 0 || d.getDay() === 6}
                    initialFocus
                    className={cn("pointer-events-auto mx-auto p-3")}
                  />
                </div>

                <div>
                  <div className="mb-3 flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-muted-foreground">
                    <Clock className="h-3.5 w-3.5 text-gold" strokeWidth={1.5} />
                    Horários disponíveis
                    {date && (
                      <span className="ml-auto text-foreground/80 normal-case tracking-normal">
                        {format(date, "EEEE, d 'de' MMMM", { locale: ptBR })}
                      </span>
                    )}
                  </div>
                  <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
                    {TIMES.map((t) => {
                      const disabled = !date;
                      const active = time === t && !!date;
                      return (
                        <button
                          key={t}
                          disabled={disabled}
                          onClick={() => setTime(t)}
                          className={cn(
                            "rounded-lg border py-2.5 text-sm font-medium transition",
                            disabled && "cursor-not-allowed opacity-40",
                            !disabled && !active && "border-border hover:border-gold hover:bg-gold/5",
                            active && "border-gold bg-gradient-luxury text-white shadow-soft",
                          )}
                        >
                          {t}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-5">
                <div className="rounded-2xl border border-gold/30 bg-gold/5 p-5">
                  <div className="grid gap-3 text-sm">
                    <Row label="Tratamento" value={service} />
                    <Row
                      label="Data"
                      value={date ? format(date, "EEEE, d 'de' MMMM 'de' yyyy", { locale: ptBR }) : "—"}
                    />
                    <Row label="Horário" value={time || "—"} />
                  </div>
                </div>
                <label className="block">
                  <span className="mb-1.5 block text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
                    Observações (opcional)
                  </span>
                  <textarea
                    rows={3}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Conte-nos algo importante para o seu atendimento..."
                    className="w-full rounded-lg border border-input bg-background px-4 py-2.5 text-sm focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/20"
                  />
                </label>
                {!user && (
                  <p className="rounded-lg border border-dashed border-gold/40 bg-gold/5 px-4 py-3 text-xs text-muted-foreground">
                    Você precisará entrar ou criar uma conta para concluir o agendamento.
                  </p>
                )}
              </div>
            )}

            <div className="mt-8 flex items-center justify-between gap-3 border-t border-border pt-5">
              <button
                onClick={() => (step === 0 ? onClose() : setStep(step - 1))}
                className="inline-flex items-center gap-2 text-sm text-muted-foreground transition hover:text-foreground"
              >
                <ArrowLeft className="h-4 w-4" strokeWidth={1.5} />
                {step === 0 ? "Cancelar" : "Voltar"}
              </button>

              {step < 2 ? (
                <button
                  disabled={!canNext}
                  onClick={() => setStep(step + 1)}
                  className="btn-gold inline-flex items-center gap-2 rounded-full px-6 py-2.5 text-sm font-medium disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Continuar
                  <ArrowRight className="h-4 w-4" strokeWidth={2} />
                </button>
              ) : (
                <button
                  onClick={confirm}
                  className="btn-gold inline-flex items-center gap-2 rounded-full px-6 py-2.5 text-sm font-medium"
                >
                  <CalendarDays className="h-4 w-4" strokeWidth={2} />
                  Confirmar agendamento
                </button>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between gap-4 border-b border-gold/15 pb-2 last:border-0 last:pb-0">
      <span className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">{label}</span>
      <span className="text-right font-serif text-base">{value}</span>
    </div>
  );
}

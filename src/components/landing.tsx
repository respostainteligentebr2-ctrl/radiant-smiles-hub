import { useEffect, useState } from "react";
import {
  ShieldCheck, Sparkles, HeartHandshake, Clock, ChevronDown,
  MapPin, Phone, Mail, Instagram, Facebook,
} from "lucide-react";
import clinic from "@/assets/clinic-about.jpg";
import logoSquare from "@/assets/logo-square.png";
import { services as svcStore, testimonials as tStore, settings as settingsStore, ensureSeed, type ServiceCard, type Testimonial } from "@/lib/store";
import { toast } from "sonner";

const PHONE_DISPLAY = "(31) 98361-9760";
const ADDRESS = "Av. Visconde de Ibituruna, 336 — Sala 107, Barreiro de Baixo";

export function Hero({ onBook }: { onBook: () => void }) {
  const [heroImage, setHeroImage] = useState<string>(logoSquare);
  useEffect(() => {
    ensureSeed();
    const refresh = () => setHeroImage(settingsStore.get().heroImage || logoSquare);
    refresh();
    window.addEventListener("dcr-store-change", refresh);
    return () => window.removeEventListener("dcr-store-change", refresh);
  }, []);

  return (
    <section className="relative overflow-hidden pt-20 sm:pt-24">
      <div
        className="absolute inset-0 -z-10 opacity-60"
        style={{
          background:
            "radial-gradient(ellipse at top left, oklch(0.85 0.06 80 / 0.4), transparent 60%), radial-gradient(ellipse at bottom right, oklch(0.85 0.008 250 / 0.3), transparent 55%)",
        }}
      />
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:px-6 sm:py-20 lg:grid-cols-2 lg:items-center lg:gap-14 lg:px-8 lg:py-24">
        <div className="fade-up order-2 lg:order-1">
          <span className="divider-gold">Odontologia de Excelência</span>
          <h1 className="mt-5 text-3xl leading-[1.08] tracking-tight sm:text-4xl lg:text-5xl xl:text-6xl">
            Um sorriso que reflete{" "}
            <span className="text-gradient-gold italic">a sua melhor versão</span>.
          </h1>
          <p className="mt-5 max-w-xl text-sm leading-relaxed text-muted-foreground sm:text-base lg:text-lg">
            Atendimento personalizado, tecnologia de ponta e estética minimamente
            invasiva — para que cada detalhe do seu sorriso seja cuidado com
            arte e ciência.
          </p>
          <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <button onClick={onBook} className="btn-gold w-full rounded-full px-7 py-3 text-sm font-medium sm:w-auto">
              Agendar consulta
            </button>
            <button onClick={onBook} className="btn-outline-gold w-full rounded-full px-7 py-3 text-sm font-medium sm:w-auto">
              Solicitar orçamento
            </button>
          </div>
          <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3 text-xs text-muted-foreground">
            <Trust icon={<ShieldCheck strokeWidth={1.5} className="h-4 w-4 text-gold" />} text="CRO‑MG ativo" />
            <Trust icon={<Sparkles strokeWidth={1.5} className="h-4 w-4 text-gold" />} text="Tecnologia digital" />
            <Trust icon={<HeartHandshake strokeWidth={1.5} className="h-4 w-4 text-gold" />} text="Atendimento humanizado" />
          </div>
        </div>

        <div className="fade-up order-1 lg:order-2">
          <div className="relative mx-auto aspect-square w-full max-w-[280px] sm:max-w-xs lg:max-w-sm">
            <div className="absolute -inset-5 -z-10 rounded-[2rem] bg-gradient-luxury opacity-25 blur-3xl" />
            <div className="absolute inset-0 -z-10 rounded-[2rem] bg-gradient-to-br from-gold/10 via-transparent to-silver/10" />
            <div className="flex h-full w-full items-center justify-center overflow-hidden rounded-[2rem] border border-gold/30 bg-card p-6 shadow-soft sm:p-8">
              <img
                src={heroImage}
                alt="Dra. Camila Resende — Odontologia"
                className="h-full w-full object-contain"
              />
            </div>
            <div className="absolute -bottom-5 -left-5 hidden rounded-2xl border border-border bg-card px-4 py-3 shadow-soft sm:block">
              <div className="text-[10px] uppercase tracking-widest text-muted-foreground">Dra. Camila Resende</div>
              <div className="font-serif text-base">Cirurgiã‑Dentista</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Trust({ icon, text }: { icon: React.ReactNode; text: string }) {
  return <span className="inline-flex items-center gap-2">{icon}{text}</span>;
}

export function About() {
  return (
    <section id="sobre" className="py-20 sm:py-28">
      <div className="mx-auto grid max-w-7xl gap-12 px-4 sm:px-6 lg:grid-cols-2 lg:items-center lg:gap-20 lg:px-8">
        <div className="overflow-hidden rounded-3xl border border-border shadow-soft">
          <img src={clinic} alt="Consultório" className="h-full w-full object-cover" loading="lazy" />
        </div>
        <div>
          <span className="divider-gold">Sobre a Dra. Camila</span>
          <h2 className="mt-4 text-3xl sm:text-4xl lg:text-5xl">
            Cuidado, técnica e <span className="italic text-gradient-gold">delicadeza</span> em cada detalhe.
          </h2>
          <div className="mt-6 space-y-4 text-muted-foreground">
            <p>
              Formada pela Universidade Federal de Minas Gerais, a Dra. Camila Resende
              dedica sua carreira à odontologia estética e à reabilitação oral com
              foco em resultados naturais e duradouros.
            </p>
            <p>
              Com mais de 10 anos de experiência clínica e especialização contínua nos
              principais centros do país, alia rigor técnico a um olhar sensível para a
              individualidade de cada paciente.
            </p>
          </div>
          <div className="mt-8 grid grid-cols-3 gap-4 border-t border-border pt-8">
            <Stat n="10+" l="Anos de prática" />
            <Stat n="2k+" l="Sorrisos cuidados" />
            <Stat n="100%" l="Atendimento individual" />
          </div>
        </div>
      </div>
    </section>
  );
}

function Stat({ n, l }: { n: string; l: string }) {
  return (
    <div>
      <div className="font-serif text-2xl text-gold sm:text-3xl">{n}</div>
      <div className="mt-1 text-xs uppercase tracking-wider text-muted-foreground">{l}</div>
    </div>
  );
}

export function Services({ onBook }: { onBook: () => void }) {
  const [list, setList] = useState<ServiceCard[]>([]);
  useEffect(() => {
    const refresh = () => setList(svcStore.list());
    refresh();
    window.addEventListener("dcr-store-change", refresh);
    return () => window.removeEventListener("dcr-store-change", refresh);
  }, []);

  return (
    <section id="servicos" className="bg-secondary/40 py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <span className="divider-gold">Tratamentos</span>
          <h2 className="mt-4 text-3xl sm:text-4xl lg:text-5xl">
            Soluções <span className="italic text-gradient-gold">personalizadas</span> para o seu sorriso
          </h2>
          <p className="mt-4 text-muted-foreground">
            Cada plano é desenhado a partir de uma análise minuciosa do seu sorriso,
            integrando estética, função e bem‑estar.
          </p>
        </div>

        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {list.map((s, i) => (
            <article
              key={s.id}
              className="group fade-up overflow-hidden rounded-2xl border border-border bg-card shadow-soft transition hover:-translate-y-1 hover:border-gold/50"
              style={{ animationDelay: `${i * 80}ms` }}
            >
              <div className="aspect-[4/3] overflow-hidden">
                <img
                  src={s.image}
                  alt={s.title}
                  className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                  loading="lazy"
                />
              </div>
              <div className="p-6">
                <h3 className="font-serif text-xl">{s.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{s.description}</p>
                <button
                  onClick={onBook}
                  className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-gold transition hover:gap-3"
                >
                  Saber mais
                  <span aria-hidden>→</span>
                </button>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

export function Differentials() {
  const items = [
    { icon: ShieldCheck, title: "Segurança clínica", text: "Protocolos rigorosos de biossegurança e materiais premium." },
    { icon: Sparkles, title: "Tecnologia digital", text: "Scanner intraoral, fotografia e planejamento digital do sorriso." },
    { icon: HeartHandshake, title: "Cuidado humano", text: "Escuta atenta e plano feito sob medida para cada paciente." },
    { icon: Clock, title: "Pontualidade", text: "Respeito ao seu tempo, com atendimento sem espera." },
  ];
  return (
    <section className="py-20 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <span className="divider-gold">Diferenciais</span>
          <h2 className="mt-4 text-3xl sm:text-4xl">Por que escolher a nossa clínica</h2>
        </div>
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {items.map((it) => (
            <div
              key={it.title}
              className="rounded-2xl border border-border bg-card p-7 text-center transition hover:border-gold/50 hover:shadow-soft"
            >
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-gradient-luxury">
                <it.icon className="h-6 w-6 text-white" strokeWidth={1.4} />
              </div>
              <h3 className="mt-4 font-serif text-lg">{it.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{it.text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function Testimonials() {
  const [list, setList] = useState<Testimonial[]>([]);
  useEffect(() => {
    const refresh = () => setList(tStore.list());
    refresh();
    window.addEventListener("dcr-store-change", refresh);
    return () => window.removeEventListener("dcr-store-change", refresh);
  }, []);
  return (
    <section id="depoimentos" className="bg-secondary/40 py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <span className="divider-gold">Depoimentos</span>
          <h2 className="mt-4 text-3xl sm:text-4xl">Histórias que nos inspiram</h2>
        </div>
        <div className="mt-12 grid gap-6 lg:grid-cols-3">
          {list.map((t) => (
            <figure key={t.id} className="rounded-2xl border border-border bg-card p-8 shadow-soft">
              <p className="font-serif text-lg italic leading-relaxed text-foreground/90">
                “{t.text}”
              </p>
              <figcaption className="mt-6 flex items-center gap-3 border-t border-border pt-5">
                <img src={t.photo} alt={t.name} className="h-12 w-12 rounded-full object-cover ring-2 ring-gold/40" loading="lazy" />
                <div>
                  <div className="font-medium">{t.name}</div>
                  <div className="text-xs uppercase tracking-wider text-gold">Paciente</div>
                </div>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}

export function FAQ() {
  const items = [
    { q: "Como funciona a primeira consulta?", a: "Realizamos uma avaliação completa do seu sorriso, exames fotográficos e conversa para entender suas expectativas. Em seguida apresentamos o plano de tratamento personalizado." },
    { q: "Atendem convênios?", a: "Trabalhamos com atendimento particular e oferecemos condições facilitadas de pagamento. Solicite seu orçamento sem compromisso." },
    { q: "Quanto tempo dura um tratamento de lentes?", a: "Em média, de 2 a 4 semanas após o planejamento digital, com 2 a 3 sessões clínicas conforme o caso." },
    { q: "O clareamento é seguro?", a: "Sim. Utilizamos protocolos seguros e supervisionados, com produtos de alta qualidade e proteção das estruturas dentárias." },
    { q: "Onde a clínica está localizada?", a: ADDRESS + " — Belo Horizonte/MG." },
  ];
  const [open, setOpen] = useState<number | null>(0);
  return (
    <section className="py-20 sm:py-28">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <span className="divider-gold">Dúvidas Frequentes</span>
          <h2 className="mt-4 text-3xl sm:text-4xl">Perguntas mais comuns</h2>
        </div>
        <div className="mt-10 divide-y divide-border rounded-2xl border border-border bg-card">
          {items.map((it, i) => (
            <div key={i}>
              <button
                onClick={() => setOpen(open === i ? null : i)}
                className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left transition hover:bg-secondary/40"
              >
                <span className="font-serif text-lg">{it.q}</span>
                <ChevronDown
                  className={`h-5 w-5 shrink-0 text-gold transition-transform ${open === i ? "rotate-180" : ""}`}
                  strokeWidth={1.5}
                />
              </button>
              {open === i && (
                <div className="px-6 pb-6 text-sm leading-relaxed text-muted-foreground">{it.a}</div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function Contact() {
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.message) {
      return toast.error("Preencha todos os campos.");
    }
    const text = encodeURIComponent(
      `Olá! Sou ${form.name} (${form.email}). ${form.message}`,
    );
    window.open(`https://wa.me/5531983619760?text=${text}`, "_blank");
    toast.success("Redirecionando para o WhatsApp.");
    setForm({ name: "", email: "", message: "" });
  };

  return (
    <section id="contato" className="bg-secondary/40 py-20 sm:py-28">
      <div className="mx-auto grid max-w-7xl gap-12 px-4 sm:px-6 lg:grid-cols-2 lg:px-8">
        <div>
          <span className="divider-gold">Contato</span>
          <h2 className="mt-4 text-3xl sm:text-4xl">Vamos conversar sobre o seu sorriso</h2>
          <p className="mt-4 text-muted-foreground">
            Agende sua avaliação ou tire suas dúvidas. Atendemos com hora marcada.
          </p>

          <div className="mt-8 space-y-5">
            <Info icon={<MapPin strokeWidth={1.5} />} title="Endereço" text={ADDRESS} />
            <Info icon={<Phone strokeWidth={1.5} />} title="Telefone / WhatsApp" text={PHONE_DISPLAY} />
            <Info icon={<Mail strokeWidth={1.5} />} title="E-mail" text="contato@draresende.com" />
            <Info icon={<Clock strokeWidth={1.5} />} title="Horário" text="Seg a Sex · 09h às 19h" />
          </div>

          <div className="mt-8 overflow-hidden rounded-2xl border border-border">
            <iframe
              title="Mapa"
              src={`https://www.google.com/maps?q=${encodeURIComponent(ADDRESS + ", Belo Horizonte, MG")}&output=embed`}
              className="h-64 w-full"
              loading="lazy"
            />
          </div>
        </div>

        <form onSubmit={submit} className="rounded-3xl border border-border bg-card p-8 shadow-soft">
          <h3 className="font-serif text-2xl">Envie uma mensagem</h3>
          <p className="mt-1 text-sm text-muted-foreground">Resposta rápida via WhatsApp.</p>
          <div className="mt-6 space-y-3">
            <Field label="Nome" value={form.name} onChange={(v) => setForm({ ...form, name: v })} />
            <Field label="E-mail" type="email" value={form.email} onChange={(v) => setForm({ ...form, email: v })} />
            <label className="block">
              <span className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-muted-foreground">Mensagem</span>
              <textarea
                rows={5}
                value={form.message}
                onChange={(e) => setForm({ ...form, message: e.target.value })}
                className="w-full rounded-lg border border-input bg-background px-4 py-2.5 text-sm focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/20"
              />
            </label>
            <button className="btn-gold mt-2 w-full rounded-full py-3 font-medium">Enviar mensagem</button>
          </div>
        </form>
      </div>
    </section>
  );
}

function Info({ icon, title, text }: { icon: React.ReactNode; title: string; text: string }) {
  return (
    <div className="flex items-start gap-4">
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-gold/40 bg-card text-gold">{icon}</div>
      <div>
        <div className="text-xs uppercase tracking-wider text-muted-foreground">{title}</div>
        <div className="mt-0.5 text-sm">{text}</div>
      </div>
    </div>
  );
}

function Field({
  label, value, onChange, type = "text",
}: { label: string; value: string; onChange: (v: string) => void; type?: string }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-muted-foreground">{label}</span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-lg border border-input bg-background px-4 py-2.5 text-sm focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/20"
      />
    </label>
  );
}

export function Footer() {
  return (
    <footer className="border-t border-border bg-background py-12">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 sm:px-6 lg:grid-cols-3 lg:px-8">
        <div>
          <img src={logoSquare} alt="Logo" className="h-20 w-20 rounded-xl object-cover" />
          <p className="mt-4 max-w-xs text-sm text-muted-foreground">
            Odontologia estética e reabilitação oral com excelência e cuidado humano.
          </p>
        </div>
        <div>
          <h4 className="font-serif text-lg">Navegação</h4>
          <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
            <li><a href="#sobre" className="hover:text-gold">Sobre</a></li>
            <li><a href="#servicos" className="hover:text-gold">Serviços</a></li>
            <li><a href="#depoimentos" className="hover:text-gold">Depoimentos</a></li>
            <li><a href="#contato" className="hover:text-gold">Contato</a></li>
          </ul>
        </div>
        <div>
          <h4 className="font-serif text-lg">Siga‑nos</h4>
          <div className="mt-3 flex gap-3">
            <a href="#" aria-label="Instagram" className="flex h-10 w-10 items-center justify-center rounded-full border border-border hover:border-gold hover:text-gold">
              <Instagram className="h-4 w-4" strokeWidth={1.5} />
            </a>
            <a href="#" aria-label="Facebook" className="flex h-10 w-10 items-center justify-center rounded-full border border-border hover:border-gold hover:text-gold">
              <Facebook className="h-4 w-4" strokeWidth={1.5} />
            </a>
          </div>
          <p className="mt-6 text-xs text-muted-foreground">{ADDRESS}</p>
          <p className="mt-1 text-xs text-muted-foreground">CRO‑MG · Responsável Técnica Dra. Camila Resende</p>
        </div>
      </div>
      <div className="mx-auto mt-10 max-w-7xl border-t border-border px-4 pt-6 text-center text-xs text-muted-foreground sm:px-6 lg:px-8">
        © {new Date().getFullYear()} Dra. Camila Resende — Odontologia. Todos os direitos reservados.
      </div>
    </footer>
  );
}

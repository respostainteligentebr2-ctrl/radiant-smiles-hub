import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { login, register } from "@/lib/store";
import { toast } from "sonner";

export function AuthModal({
  open,
  onClose,
  onSuccess,
}: {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}) {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [form, setForm] = useState({ name: "", email: "", phone: "", password: "" });

  useEffect(() => {
    if (open) setForm({ name: "", email: "", phone: "", password: "" });
  }, [open]);

  if (!open) return null;

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (mode === "login") {
      const u = login(form.email.trim(), form.password);
      if (!u) return toast.error("E-mail ou senha inválidos.");
      toast.success(`Bem-vinda, ${u.name.split(" ")[0]}`);
      onSuccess?.();
      onClose();
    } else {
      if (form.name.length < 2 || form.password.length < 4) {
        return toast.error("Preencha nome e senha (mín. 4 caracteres).");
      }
      const res = register({
        name: form.name.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
        password: form.password,
      });
      if ("error" in res) return toast.error(res.error);
      toast.success("Cadastro realizado.");
      onSuccess?.();
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
      <div className="relative w-full max-w-md rounded-2xl border border-border bg-card p-8 shadow-soft">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-muted-foreground hover:text-foreground"
        >
          <X strokeWidth={1.5} />
        </button>
        <div className="mb-6 text-center">
          <span className="divider-gold">Acesso</span>
          <h2 className="mt-3 text-3xl">
            {mode === "login" ? "Entrar" : "Criar conta"}
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {mode === "login"
              ? "Acesse sua área de cliente"
              : "Cadastre-se para agendar e solicitar orçamentos"}
          </p>
        </div>

        <form onSubmit={submit} className="space-y-3">
          {mode === "register" && (
            <>
              <Field
                label="Nome completo"
                value={form.name}
                onChange={(v) => setForm({ ...form, name: v })}
              />
              <Field
                label="Telefone (com DDD)"
                value={form.phone}
                onChange={(v) => setForm({ ...form, phone: v })}
                placeholder="(31) 9 0000-0000"
              />
            </>
          )}
          <Field
            label="E-mail"
            type="email"
            value={form.email}
            onChange={(v) => setForm({ ...form, email: v })}
            required
          />
          <Field
            label="Senha"
            type="password"
            value={form.password}
            onChange={(v) => setForm({ ...form, password: v })}
            required
          />

          <button type="submit" className="btn-gold mt-4 w-full rounded-full py-3 font-medium">
            {mode === "login" ? "Entrar" : "Criar conta"}
          </button>
        </form>

        <div className="mt-4 text-center text-sm text-muted-foreground">
          {mode === "login" ? (
            <>
              Não tem conta?{" "}
              <button
                onClick={() => setMode("register")}
                className="font-medium text-gold underline-offset-4 hover:underline"
              >
                Cadastre-se
              </button>
            </>
          ) : (
            <>
              Já tem conta?{" "}
              <button
                onClick={() => setMode("login")}
                className="font-medium text-gold underline-offset-4 hover:underline"
              >
                Entrar
              </button>
            </>
          )}
        </div>

        <p className="mt-4 rounded-lg bg-secondary/60 p-3 text-center text-xs text-muted-foreground">
          Acesso admin: <code className="font-mono">admin@draresende.com</code> /{" "}
          <code className="font-mono">Admin123</code>
        </p>
      </div>
    </div>
  );
}

function Field({
  label, value, onChange, type = "text", placeholder, required,
}: {
  label: string; value: string; onChange: (v: string) => void;
  type?: string; placeholder?: string; required?: boolean;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-muted-foreground">
        {label}
      </span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        required={required}
        className="w-full rounded-lg border border-input bg-background px-4 py-2.5 text-sm transition focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/20"
      />
    </label>
  );
}

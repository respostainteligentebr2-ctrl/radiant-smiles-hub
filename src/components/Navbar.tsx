import { Link, useLocation } from "@tanstack/react-router";
import { useState } from "react";
import { Menu, X, User as UserIcon } from "lucide-react";
import logo from "@/assets/logo-horizontal.png";
import { useSession } from "@/lib/use-session";
import { logout } from "@/lib/store";

const NAV = [
  { label: "Início", to: "/", hash: "" },
  { label: "Sobre", to: "/", hash: "#sobre" },
  { label: "Serviços", to: "/", hash: "#servicos" },
  { label: "Depoimentos", to: "/", hash: "#depoimentos" },
  { label: "Contato", to: "/", hash: "#contato" },
];

export function Navbar({ onLogin }: { onLogin: () => void }) {
  const [open, setOpen] = useState(false);
  const { user } = useSession();
  const loc = useLocation();

  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-border/60 bg-background/85 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        <Link to="/" className="flex items-center gap-2">
          <img src={logo} alt="Dra. Camila Resende Odontologia" className="h-10 w-auto sm:h-12" />
        </Link>

        <nav className="hidden items-center gap-8 lg:flex">
          {NAV.map((n) => (
            <a
              key={n.label}
              href={n.hash ? n.hash : "/"}
              className="text-sm font-medium tracking-wide text-foreground/80 transition-colors hover:text-gold"
            >
              {n.label}
            </a>
          ))}
        </nav>

        <div className="hidden items-center gap-3 lg:flex">
          {user ? (
            <>
              <Link
                to={user.role === "admin" ? "/admin" : "/cliente"}
                className="inline-flex items-center gap-2 rounded-full border border-gold/60 px-4 py-2 text-sm font-medium text-foreground transition hover:bg-gold/10"
              >
                <UserIcon className="h-4 w-4" strokeWidth={1.5} />
                {user.role === "admin" ? "Painel" : "Minha conta"}
              </Link>
              <button
                onClick={() => { logout(); }}
                className="text-sm text-muted-foreground hover:text-foreground"
              >
                Sair
              </button>
            </>
          ) : (
            <>
              <button
                onClick={onLogin}
                className="text-sm font-medium text-foreground/80 transition hover:text-gold"
              >
                Entrar
              </button>
              <a
                href="#contato"
                className="btn-gold rounded-full px-5 py-2.5 text-sm font-medium"
              >
                Agendar consulta
              </a>
            </>
          )}
        </div>

        <button
          onClick={() => setOpen(!open)}
          className="rounded-md p-2 text-foreground lg:hidden"
          aria-label="Menu"
        >
          {open ? <X strokeWidth={1.5} /> : <Menu strokeWidth={1.5} />}
        </button>
      </div>

      {open && (
        <div className="border-t border-border bg-background lg:hidden">
          <div className="space-y-1 px-4 py-4">
            {NAV.map((n) => (
              <a
                key={n.label}
                href={n.hash || "/"}
                onClick={() => setOpen(false)}
                className="block rounded-md px-3 py-2 text-base text-foreground/80 hover:bg-secondary"
              >
                {n.label}
              </a>
            ))}
            <div className="mt-4 flex flex-col gap-2 border-t border-border pt-4">
              {user ? (
                <>
                  <Link
                    to={user.role === "admin" ? "/admin" : "/cliente"}
                    onClick={() => setOpen(false)}
                    className="rounded-full border border-gold/60 px-4 py-2.5 text-center text-sm font-medium"
                  >
                    {user.role === "admin" ? "Painel" : "Minha conta"}
                  </Link>
                  <button
                    onClick={() => { logout(); setOpen(false); }}
                    className="text-sm text-muted-foreground"
                  >
                    Sair
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => { onLogin(); setOpen(false); }}
                    className="rounded-full border border-border px-4 py-2.5 text-sm font-medium"
                  >
                    Entrar / Cadastrar
                  </button>
                  <a
                    href="#contato"
                    onClick={() => setOpen(false)}
                    className="btn-gold rounded-full px-5 py-2.5 text-center text-sm font-medium"
                  >
                    Agendar consulta
                  </a>
                </>
              )}
            </div>
          </div>
        </div>
      )}
      {loc.pathname !== "/" && <div className="h-0" />}
    </header>
  );
}

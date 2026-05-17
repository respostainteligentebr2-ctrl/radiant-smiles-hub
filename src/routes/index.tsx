import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Navbar } from "@/components/Navbar";
import { Hero, About, Services, Differentials, Testimonials, FAQ, Contact, Footer } from "@/components/landing";
import { WhatsAppButton } from "@/components/WhatsAppButton";
import { AuthModal } from "@/components/AuthModal";
import { Toaster } from "@/components/ui/sonner";
import { useSession } from "@/lib/use-session";
import { useNavigate } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Dra. Camila Resende — Odontologia | Estética e reabilitação oral" },
      { name: "description", content: "Odontologia estética e reabilitação oral em Belo Horizonte. Atendimento humanizado com tecnologia de ponta. Agende sua consulta com a Dra. Camila Resende." },
      { property: "og:title", content: "Dra. Camila Resende — Odontologia" },
      { property: "og:description", content: "Sorrisos cuidados com arte, ciência e delicadeza." },
    ],
  }),
  component: Index,
});

function Index() {
  const [authOpen, setAuthOpen] = useState(false);
  const { user } = useSession();
  const navigate = useNavigate();

  const requireAuth = () => {
    if (user) {
      navigate({ to: user.role === "admin" ? "/admin" : "/cliente" });
    } else {
      setAuthOpen(true);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar onLogin={() => setAuthOpen(true)} />
      <main>
        <Hero onBook={requireAuth} />
        <About />
        <Services onBook={requireAuth} />
        <Differentials />
        <Testimonials />
        <FAQ />
        <Contact />
      </main>
      <Footer />
      <WhatsAppButton />
      <AuthModal
        open={authOpen}
        onClose={() => setAuthOpen(false)}
        onSuccess={() => {
          const u = JSON.parse(localStorage.getItem("dcr_session") || "null");
          if (u) navigate({ to: "/cliente" });
        }}
      />
      <Toaster position="top-center" />
    </div>
  );
}

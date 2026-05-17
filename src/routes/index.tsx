import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Navbar } from "@/components/Navbar";
import { Hero, About, Services, Differentials, Testimonials, FAQ, Contact, Footer } from "@/components/landing";
import { WhatsAppButton } from "@/components/WhatsAppButton";
import { AuthModal } from "@/components/AuthModal";
import { BookingDialog } from "@/components/BookingDialog";
import { Toaster } from "@/components/ui/sonner";

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
  const [bookingOpen, setBookingOpen] = useState(false);

  const openBooking = () => setBookingOpen(true);

  return (
    <div className="min-h-screen bg-background">
      <Navbar onLogin={() => setAuthOpen(true)} onBook={openBooking} />
      <main>
        <Hero onBook={openBooking} />
        <About />
        <Services onBook={openBooking} />
        <Differentials />
        <Testimonials />
        <FAQ />
        <Contact />
      </main>
      <Footer />
      <WhatsAppButton />
      <BookingDialog
        open={bookingOpen}
        onClose={() => setBookingOpen(false)}
        onRequireAuth={() => {
          setBookingOpen(false);
          setAuthOpen(true);
        }}
      />
      <AuthModal
        open={authOpen}
        onClose={() => setAuthOpen(false)}
        onSuccess={() => {
          setAuthOpen(false);
          setBookingOpen(true);
        }}
      />
      <Toaster position="top-center" />
    </div>
  );
}

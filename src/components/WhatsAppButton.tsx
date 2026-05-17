import { MessageCircle } from "lucide-react";

const PHONE = "5531983619760";

export function WhatsAppButton() {
  const msg = encodeURIComponent("Olá! Gostaria de mais informações sobre os tratamentos.");
  return (
    <a
      href={`https://wa.me/${PHONE}?text=${msg}`}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Falar no WhatsApp"
      className="fixed bottom-6 right-6 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-luxury shadow-gold transition-transform hover:scale-110 sm:h-16 sm:w-16"
    >
      <MessageCircle className="h-7 w-7 text-white" strokeWidth={1.5} />
      <span className="absolute -top-1 -right-1 h-3 w-3 animate-ping rounded-full bg-gold opacity-70" />
    </a>
  );
}

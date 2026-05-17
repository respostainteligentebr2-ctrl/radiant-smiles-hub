// Local storage data layer (no backend)
import serviceWhitening from "@/assets/service-whitening.jpg";
import serviceVeneers from "@/assets/service-veneers.jpg";
import serviceAligners from "@/assets/service-aligners.jpg";
import serviceImplants from "@/assets/service-implants.jpg";

export type Role = "cliente" | "admin";

export interface User {
  id: string;
  email: string;
  password: string;
  name: string;
  phone?: string;
  role: Role;
}

export interface ServiceCard {
  id: string;
  image: string;
  title: string;
  description: string;
}

export interface Appointment {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  date: string;
  time: string;
  service: string;
  notes?: string;
  status: "agendado" | "confirmado" | "realizado" | "cancelado";
  createdAt: string;
}

export interface Budget {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  description: string;
  attachment?: string;
  status: "pendente" | "respondido";
  reply?: string;
  createdAt: string;
}

export interface Testimonial {
  id: string;
  name: string;
  photo: string;
  text: string;
}

const KEYS = {
  users: "dcr_users",
  session: "dcr_session",
  services: "dcr_services",
  appointments: "dcr_appointments",
  budgets: "dcr_budgets",
  testimonials: "dcr_testimonials",
  settings: "dcr_settings",
};

export interface SiteSettings {
  heroImage: string;
}

const isBrowser = typeof window !== "undefined";

function read<T>(key: string, fallback: T): T {
  if (!isBrowser) return fallback;
  try {
    const v = localStorage.getItem(key);
    return v ? (JSON.parse(v) as T) : fallback;
  } catch {
    return fallback;
  }
}

function write<T>(key: string, value: T) {
  if (!isBrowser) return;
  localStorage.setItem(key, JSON.stringify(value));
  window.dispatchEvent(new CustomEvent("dcr-store-change", { detail: key }));
}

export const uid = () => Math.random().toString(36).slice(2, 10);

/* ---------- Seed ---------- */

const ADMIN: User = {
  id: "admin-fixed",
  email: "admin@draresende.com",
  password: "Admin123",
  name: "Dra. Camila Resende",
  role: "admin",
};

const DEFAULT_SERVICES: ServiceCard[] = [
  {
    id: "s1",
    image: serviceWhitening,
    title: "Clareamento Dental",
    description:
      "Devolva o brilho natural do seu sorriso com protocolos seguros e resultados duradouros.",
  },
  {
    id: "s2",
    image: serviceVeneers,
    title: "Lentes de Contato e Facetas",
    description:
      "Design de sorriso personalizado com lentes ultrafinas para um resultado natural e harmônico.",
  },
  {
    id: "s3",
    image: serviceAligners,
    title: "Alinhadores Invisíveis",
    description:
      "Ortodontia estética e confortável com alinhadores transparentes feitos sob medida.",
  },
  {
    id: "s4",
    image: serviceImplants,
    title: "Implantes Dentários",
    description:
      "Reabilitação completa com implantes de alta tecnologia e abordagem minimamente invasiva.",
  },
];

const DEFAULT_TESTIMONIALS: Testimonial[] = [
  {
    id: "t1",
    name: "Marina S.",
    photo: "https://i.pravatar.cc/200?img=47",
    text: "Atendimento impecável e resultado que superou minhas expectativas. Recomendo a todos.",
  },
  {
    id: "t2",
    name: "Rafael M.",
    photo: "https://i.pravatar.cc/200?img=12",
    text: "Profissional extremamente atenciosa. Hoje sorrio com confiança graças à Dra. Camila.",
  },
  {
    id: "t3",
    name: "Júlia P.",
    photo: "https://i.pravatar.cc/200?img=32",
    text: "Ambiente acolhedor e tratamento humanizado do início ao fim. Indico de olhos fechados.",
  },
];

export function ensureSeed() {
  if (!isBrowser) return;
  const users = read<User[]>(KEYS.users, []);
  if (!users.find((u) => u.email === ADMIN.email)) {
    write(KEYS.users, [...users, ADMIN]);
  }
  if (!localStorage.getItem(KEYS.services)) write(KEYS.services, DEFAULT_SERVICES);
  if (!localStorage.getItem(KEYS.testimonials)) write(KEYS.testimonials, DEFAULT_TESTIMONIALS);
  if (!localStorage.getItem(KEYS.appointments)) write(KEYS.appointments, []);
  if (!localStorage.getItem(KEYS.budgets)) write(KEYS.budgets, []);
}

/* ---------- Auth ---------- */

export function getUsers() { return read<User[]>(KEYS.users, []); }
export function saveUsers(u: User[]) { write(KEYS.users, u); }

export function getSession(): User | null {
  const id = read<string | null>(KEYS.session, null);
  if (!id) return null;
  return getUsers().find((u) => u.id === id) ?? null;
}
export function setSession(id: string | null) { write(KEYS.session, id); }

export function login(email: string, password: string): User | null {
  const u = getUsers().find(
    (u) => u.email.toLowerCase() === email.toLowerCase() && u.password === password,
  );
  if (u) setSession(u.id);
  return u ?? null;
}

export function register(data: Omit<User, "id" | "role">): User | { error: string } {
  const users = getUsers();
  if (users.find((u) => u.email.toLowerCase() === data.email.toLowerCase())) {
    return { error: "E-mail já cadastrado." };
  }
  const u: User = { ...data, id: uid(), role: "cliente" };
  saveUsers([...users, u]);
  setSession(u.id);
  return u;
}

export function updateUser(id: string, patch: Partial<User>) {
  const users = getUsers().map((u) => (u.id === id ? { ...u, ...patch } : u));
  saveUsers(users);
}

export function logout() { setSession(null); }

/* ---------- CRUD helpers ---------- */

export const services = {
  list: () => read<ServiceCard[]>(KEYS.services, []),
  save: (list: ServiceCard[]) => write(KEYS.services, list),
};

export const testimonials = {
  list: () => read<Testimonial[]>(KEYS.testimonials, []),
  save: (list: Testimonial[]) => write(KEYS.testimonials, list),
};

export const appointments = {
  list: () => read<Appointment[]>(KEYS.appointments, []),
  save: (list: Appointment[]) => write(KEYS.appointments, list),
  add: (a: Omit<Appointment, "id" | "createdAt" | "status">) => {
    const full: Appointment = {
      ...a,
      id: uid(),
      status: "agendado",
      createdAt: new Date().toISOString(),
    };
    write(KEYS.appointments, [full, ...appointments.list()]);
    return full;
  },
};

export const budgets = {
  list: () => read<Budget[]>(KEYS.budgets, []),
  save: (list: Budget[]) => write(KEYS.budgets, list),
  add: (b: Omit<Budget, "id" | "createdAt" | "status">) => {
    const full: Budget = {
      ...b,
      id: uid(),
      status: "pendente",
      createdAt: new Date().toISOString(),
    };
    write(KEYS.budgets, [full, ...budgets.list()]);
    return full;
  },
};

export function fileToBase64(file: File): Promise<string> {
  return new Promise((res, rej) => {
    const r = new FileReader();
    r.onload = () => res(r.result as string);
    r.onerror = rej;
    r.readAsDataURL(file);
  });
}

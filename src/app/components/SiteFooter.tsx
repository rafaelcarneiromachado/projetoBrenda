import Link from "next/link";
import { Mail, MessageCircle, UserRound } from "lucide-react";

const contactItems = [
  {
    icon: UserRound,
    label: "Administrador E Autor",
    value: "Rafael Machado",
  },
  {
    icon: Mail,
    label: "E-Mail",
    value: "contato@projetobrenda.com.br",
    href: "mailto:contato@projetobrenda.com.br",
  },
  {
    icon: MessageCircle,
    label: "WhatsApp",
    value: "+55 41 98852 7539",
    href: "https://wa.me/5541988527539",
  },
];

export function SiteFooter() {
  return (
    <footer className="border-t border-[var(--line)] bg-white">
      <div className="mx-auto max-w-6xl px-6 py-8 md:px-10 lg:px-12">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-lg font-black text-[var(--brand-dark)]">Projeto Brenda</p>
            <p className="mt-2 max-w-xl leading-7 text-[var(--muted)]">
              Acolhimento solidário para aproximar famílias de pessoas dispostas a
              oferecer um lugar seguro para descansar.
            </p>
          </div>
          <p className="text-sm font-bold text-[var(--muted)]">
            © 2026 Projeto Brenda. Todos os direitos reservados.
          </p>
        </div>

        <div className="mt-6 grid gap-3 md:grid-cols-3">
          {contactItems.map((item) => {
            const Icon = item.icon;
            const content = (
              <div className="h-full rounded-[1.25rem] border border-[var(--line)] bg-[var(--surface-soft)] p-4 transition hover:border-[#f4a9bf] hover:bg-white">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-[var(--brand-dark)] shadow-sm">
                  <Icon aria-hidden size={18} />
                </div>
                <p className="mt-4 text-[0.7rem] font-black uppercase tracking-[0.12em] text-[var(--rose-dark)]">
                  {item.label}
                </p>
                <p className="mt-1 overflow-hidden text-ellipsis whitespace-nowrap text-sm font-black text-[var(--brand-dark)]">
                  {item.value}
                </p>
              </div>
            );

            return item.href ? (
              <Link href={item.href} key={item.label}>
                {content}
              </Link>
            ) : (
              <div key={item.label}>{content}</div>
            );
          })}
        </div>
      </div>
    </footer>
  );
}

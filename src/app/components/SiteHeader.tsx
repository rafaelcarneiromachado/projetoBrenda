import Link from "next/link";
import Image from "next/image";

type SiteHeaderProps = {
  current?: "home" | "familias" | "anfitrioes" | "admin";
};

const links = [
  { href: "/", label: "Inicio", key: "home" },
  { href: "/familias", label: "Preciso de hospedagem", key: "familias" },
  { href: "/anfitrioes", label: "Quero acolher", key: "anfitrioes" },
  { href: "/admin", label: "Admin", key: "admin" },
];

export function SiteHeader({ current = "home" }: SiteHeaderProps) {
  return (
    <header className="sticky top-0 z-20 border-b border-[var(--line)] bg-[#fff7ed]/94 backdrop-blur">
      <nav className="mx-auto flex max-w-6xl flex-col gap-4 px-6 py-4 md:flex-row md:items-center md:justify-between md:px-10 lg:px-12">
        <Link className="flex items-center gap-3" href="/">
          <Image
            alt=""
            className="h-11 w-11 rounded-2xl"
            height={44}
            priority
            src="/brand/logo-brenda.svg"
            width={44}
          />
          <span className="leading-tight">
            <span className="block text-lg font-black text-[var(--brand-dark)]">
              Projeto Brenda
            </span>
            <span className="block text-xs font-bold uppercase tracking-[0.12em] text-[var(--rose)]">
              acolhimento solidario
            </span>
          </span>
        </Link>
        <div className="flex flex-wrap gap-2 text-sm font-bold text-[var(--muted)]">
          {links.map((link) => (
            <Link
              className={`rounded-full px-4 py-2 transition hover:bg-white hover:text-[var(--brand-dark)] ${
                current === link.key
                  ? "bg-white text-[var(--brand-dark)] shadow-md shadow-[#173b3420]"
                  : ""
              }`}
              href={link.href}
              key={link.key}
            >
              {link.label}
            </Link>
          ))}
        </div>
      </nav>
    </header>
  );
}

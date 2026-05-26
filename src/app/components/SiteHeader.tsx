import Link from "next/link";

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
    <header className="border-b border-[var(--line)] bg-white">
      <nav className="mx-auto flex max-w-6xl flex-col gap-4 px-6 py-5 md:flex-row md:items-center md:justify-between md:px-10 lg:px-12">
        <Link className="text-lg font-bold text-[var(--brand-dark)]" href="/">
          Projeto Brenda
        </Link>
        <div className="flex flex-wrap gap-2 text-sm text-[var(--muted)]">
          {links.map((link) => (
            <Link
              className={`rounded-md px-3 py-2 transition hover:bg-[#eef7f4] hover:text-[var(--brand-dark)] ${
                current === link.key
                  ? "bg-[#eef7f4] font-bold text-[var(--brand-dark)]"
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

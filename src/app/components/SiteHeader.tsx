"use client";

import Link from "next/link";
import Image from "next/image";
import { ChevronDown, LogOut, ShieldCheck, UserCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

type SiteHeaderProps = {
  current?:
    | "home"
    | "buscar"
    | "familias"
    | "anfitrioes"
    | "missao"
    | "admin"
    | "entrar"
    | "perfil";
};

const links = [
  { href: "/", label: "Início", shortLabel: "Início", key: "home" },
  { href: "/buscar", label: "Buscar hospedagem", shortLabel: "Buscar", key: "buscar" },
  {
    href: "/familias",
    label: "Preciso de hospedagem",
    shortLabel: "Preciso",
    key: "familias",
  },
  { href: "/anfitrioes", label: "Quero acolher", shortLabel: "Acolher", key: "anfitrioes" },
  { href: "/missao", label: "Missão", shortLabel: "Missão", key: "missao" },
];

function getMetadataAvatar(metadata: Record<string, unknown> | undefined) {
  const avatar = metadata?.avatar_url ?? metadata?.picture ?? metadata?.photo;
  return typeof avatar === "string" ? avatar : "";
}

export function SiteHeader({ current = "home" }: SiteHeaderProps) {
  const [email, setEmail] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    if (!supabase) {
      return;
    }

    let mounted = true;
    const client = supabase;

    async function loadUserAvatar(
      user: {
        id: string;
        email?: string | null;
        user_metadata?: Record<string, unknown>;
      } | null,
    ) {
      if (!mounted) {
        return;
      }

      setEmail(user?.email ?? "");

      if (!user) {
        setAvatarUrl("");
        return;
      }

      const metadataAvatar = getMetadataAvatar(user.user_metadata);
      const { data: profile } = await client
        .from("profiles")
        .select("avatar_url")
        .eq("id", user.id)
        .maybeSingle();

      if (mounted) {
        setAvatarUrl(profile?.avatar_url ?? metadataAvatar);
      }
    }

    window.setTimeout(() => {
      client.auth.getUser().then(({ data }) => {
        void loadUserAvatar(data.user);
      });
    }, 0);

    const { data } = client.auth.onAuthStateChange((_event, session) => {
      void loadUserAvatar(session?.user ?? null);
    });

    return () => {
      mounted = false;
      data.subscription.unsubscribe();
    };
  }, []);

  async function handleSignOut() {
    if (!supabase) {
      return;
    }

    await supabase.auth.signOut();
    window.location.href = "/";
  }

  return (
    <header className="sticky top-0 z-20 border-b border-[var(--line)] bg-white/95 backdrop-blur">
      <nav className="mx-auto flex max-w-6xl flex-col gap-3 px-5 py-3 md:px-8 lg:flex-row lg:items-center lg:justify-between lg:px-10">
        <Link className="flex shrink-0 items-center gap-3" href="/">
          <Image
            alt=""
            className="h-10 w-10 rounded-2xl"
            height={40}
            priority
            src="/brand/logo-brenda.svg"
            width={40}
          />
          <span className="leading-tight">
            <span className="block text-lg font-black text-[var(--brand-dark)]">
              Projeto Brenda
            </span>
            <span className="block text-xs font-bold uppercase tracking-[0.12em] text-[var(--rose)]">
              acolhimento solidário
            </span>
          </span>
        </Link>
        <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1 text-sm font-bold text-[var(--muted)] [scrollbar-width:none] lg:mx-0 lg:overflow-visible lg:pb-0">
          {links.map((link) => (
            <Link
              className={`inline-flex min-h-10 shrink-0 items-center justify-center rounded-full px-4 py-2 leading-none transition hover:bg-[var(--surface-soft)] hover:text-[var(--brand-dark)] ${
                current === link.key
                  ? "bg-[var(--brand-dark)] text-white shadow-md shadow-[#19101420] hover:bg-[var(--brand-dark)] hover:text-white"
                  : ""
              }`}
              href={link.href}
              key={link.key}
            >
              <span className="sm:hidden">{link.shortLabel}</span>
              <span className="hidden sm:inline">{link.label}</span>
            </Link>
          ))}
          {email ? (
            <div className="relative shrink-0">
              <button
                className={`inline-flex items-center gap-2 rounded-full bg-white px-3 py-2 shadow-sm ring-1 ring-[var(--line)] transition hover:bg-[var(--surface-soft)] hover:text-[var(--brand-dark)] ${
                  current === "perfil"
                    ? "text-[var(--brand-dark)] shadow-md shadow-[#19101420]"
                    : ""
                }`}
                onClick={() => setMenuOpen((open) => !open)}
                type="button"
              >
                {avatarUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    alt=""
                    className="h-7 w-7 rounded-full object-cover"
                    src={avatarUrl}
                  />
                ) : (
                  <UserCircle aria-hidden size={18} />
                )}
                Minha conta
                <ChevronDown aria-hidden size={16} />
              </button>

              {menuOpen ? (
                <div className="absolute right-0 top-12 z-30 w-56 overflow-hidden rounded-3xl border border-[var(--line)] bg-white p-2 shadow-xl shadow-[#19101420]">
                  <Link
                    className="flex items-center gap-2 rounded-2xl px-4 py-3 text-[var(--brand-dark)] hover:bg-[var(--surface-soft)]"
                    href="/perfil"
                    onClick={() => setMenuOpen(false)}
                  >
                    <UserCircle aria-hidden size={18} />
                    Editar perfil
                  </Link>
                  <Link
                    className="flex items-center gap-2 rounded-2xl px-4 py-3 text-[var(--brand-dark)] hover:bg-[var(--surface-soft)]"
                    href="/admin"
                    onClick={() => setMenuOpen(false)}
                  >
                    <ShieldCheck aria-hidden size={18} />
                    Moderação
                  </Link>
                  <button
                    className="flex w-full items-center gap-2 rounded-2xl px-4 py-3 text-left font-bold text-[var(--brand-dark)] hover:bg-[var(--surface-soft)]"
                    onClick={handleSignOut}
                    type="button"
                  >
                    <LogOut aria-hidden size={17} />
                    Sair
                  </button>
                </div>
              ) : null}
            </div>
          ) : (
            <Link
              className={`inline-flex min-h-10 shrink-0 items-center justify-center rounded-full px-4 py-2 leading-none transition hover:bg-[var(--surface-soft)] hover:text-[var(--brand-dark)] ${
                current === "entrar"
                  ? "bg-[var(--brand-dark)] text-white shadow-md shadow-[#19101420] hover:bg-[var(--brand-dark)] hover:text-white"
                  : ""
              }`}
              href="/entrar"
            >
              Entrar
            </Link>
          )}
        </div>
      </nav>
    </header>
  );
}

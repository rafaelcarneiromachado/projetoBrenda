"use client";

import Link from "next/link";
import { LockKeyhole } from "lucide-react";
import { useSyncExternalStore } from "react";

type AuthGateProps = {
  children: React.ReactNode;
  message: string;
};

export function AuthGate({ children, message }: AuthGateProps) {
  const authStatus = useSyncExternalStore(
    (callback) => {
      window.addEventListener("storage", callback);
      return () => window.removeEventListener("storage", callback);
    },
    () => window.localStorage.getItem("pb-auth") ?? "signed-out",
    () => "signed-out",
  );

  if (authStatus !== "signed-in") {
    return (
      <div className="soft-shell rounded-[2rem] p-7">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--brand-dark)] text-white">
          <LockKeyhole aria-hidden size={22} />
        </div>
        <h2 className="mt-5 text-2xl font-black">Entre para continuar</h2>
        <p className="mt-3 leading-7 text-[var(--muted)]">{message}</p>
        <Link
          className="mt-6 inline-flex min-h-12 items-center justify-center rounded-full bg-[var(--brand-dark)] px-6 font-black text-white shadow-lg shadow-[#19101435] transition hover:bg-[var(--brand)]"
          href="/entrar"
        >
          Fazer login
        </Link>
      </div>
    );
  }

  return children;
}

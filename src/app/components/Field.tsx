import type { InputHTMLAttributes, ReactNode, SelectHTMLAttributes, TextareaHTMLAttributes } from "react";

type BaseProps = {
  label: string;
  hint?: string;
  children: ReactNode;
};

function FieldFrame({ label, hint, children }: BaseProps) {
  return (
    <label className="block">
      <span className="text-sm font-bold text-[var(--foreground)]">{label}</span>
      <span className="mt-2 block">{children}</span>
      {hint ? (
        <span className="mt-2 block text-xs leading-5 text-[var(--muted)]">
          {hint}
        </span>
      ) : null}
    </label>
  );
}

const inputClass =
  "min-h-12 w-full rounded-md border border-[var(--line)] bg-white px-3 text-[var(--foreground)] outline-none transition focus:border-[var(--brand)] focus:ring-2 focus:ring-[#99f6e4]";

export function TextField({
  label,
  hint,
  ...props
}: { label: string; hint?: string } & InputHTMLAttributes<HTMLInputElement>) {
  return (
    <FieldFrame label={label} hint={hint}>
      <input className={inputClass} {...props} />
    </FieldFrame>
  );
}

export function SelectField({
  label,
  hint,
  children,
  ...props
}: { label: string; hint?: string; children: ReactNode } & SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <FieldFrame label={label} hint={hint}>
      <select className={inputClass} {...props}>
        {children}
      </select>
    </FieldFrame>
  );
}

export function TextAreaField({
  label,
  hint,
  ...props
}: { label: string; hint?: string } & TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <FieldFrame label={label} hint={hint}>
      <textarea
        className={`${inputClass} min-h-32 resize-y py-3 leading-7`}
        {...props}
      />
    </FieldFrame>
  );
}

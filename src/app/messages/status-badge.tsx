export function StatusBadge({
  status,
}: {
  status: "draft" | "scheduled" | "sent" | "canceled";
}) {
  const map: Record<typeof status, { label: string; cls: string }> = {
    draft: {
      label: "Черновик",
      cls: "bg-black/[0.05] text-[color:var(--fg)]",
    },
    scheduled: {
      label: "Запланировано",
      cls: "bg-blue-50 text-blue-700 ring-1 ring-blue-200",
    },
    sent: {
      label: "Отправлено",
      cls: "bg-green-50 text-green-700 ring-1 ring-green-200",
    },
    canceled: {
      label: "Отменено",
      cls: "bg-red-50 text-red-700 ring-1 ring-red-200",
    },
  } as const;

  const { label, cls } = map[status];
  return (
    <span
      className={[
        "inline-flex items-center rounded-full px-2.5 py-1 text-xs",
        "border border-black/10",
        cls,
      ].join(" ")}
    >
      {label}
    </span>
  );
}

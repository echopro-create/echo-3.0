// app/components/ErrorFace.tsx
"use client";

type Variant = 401 | 404 | 410 | "error";

export default function ErrorFace(props: {
  variant: Variant;
  title?: string;
  hint?: string;
  className?: string;
}) {
  const { variant, className } = props;

  const preset =
    variant === 404
      ? {
          title: "Ссылка не найдена",
          hint: "Проверьте адрес или попросите отправителя создать новую ссылку.",
          tone: "border-red-200 bg-red-50 text-red-800",
        }
      : variant === 410
      ? {
          title: "Ссылка недоступна",
          hint: "Срок действия истёк, ссылку отозвали или превышен лимит просмотров.",
          tone: "border-amber-200 bg-amber-50 text-amber-900",
        }
      : variant === 401
      ? {
          title: "Нужен пароль",
          hint: "Введите пароль для доступа к посланию.",
          tone: "border-blue-200 bg-blue-50 text-blue-800",
        }
      : {
          title: "Ошибка",
          hint: "Не удалось открыть ссылку. Попробуйте позже.",
          tone: "border-red-200 bg-red-50 text-red-800",
        };

  const title = props.title || preset.title;
  const hint = props.hint ?? preset.hint;
  const tone = preset.tone;

  function handleClose() {
    try {
      window.close();
    } catch {
      /* ignore */
    }
    location.href = "/";
  }

  return (
    <section className={`rounded-xl border p-4 ${tone} ${className || ""}`}>
      <div className="font-medium mb-1">{title}</div>
      {hint ? <div className="text-sm opacity-80">{hint}</div> : null}

      <div className="flex gap-2 mt-3">
        <button className="btn" onClick={handleClose}>Закрыть</button>
        <a className="btn secondary" href="/">На главную</a>
      </div>
    </section>
  );
}

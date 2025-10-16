export const metadata = {
  title: "Войти — Echo",
};

export default function LoginPage() {
  return (
    <main className="mx-auto max-w-md px-4 py-24">
      <h1 className="mb-2 text-2xl font-semibold tracking-tight">Войти</h1>
      <p className="mb-6 opacity-80">
        Введите адрес почты, мы отправим код. Никаких паролей.
      </p>

      <form
        className="space-y-4 rounded-2xl border border-[var(--ring)] bg-[var(--card)] p-5 shadow-sm"
        // обработчик добавим при подключении Supabase Auth
        onSubmit={(e) => {
          e.preventDefault();
          alert("Здесь будет отправка magic link / OTP через Supabase Auth.");
        }}
      >
        <label className="block text-sm">
          Почта
          <input
            type="email"
            required
            placeholder="you@example.com"
            className="mt-1 w-full rounded-xl border border-[var(--ring)] bg-transparent px-3 py-2 outline-none focus:ring-2 focus:ring-[var(--ring)]"
          />
        </label>
        <button
          type="submit"
          className="w-full rounded-xl border border-[var(--ring)] px-4 py-2 text-sm hover:opacity-100 opacity-90"
        >
          Получить код
        </button>
      </form>

      <p className="mt-4 text-xs opacity-70">
        Продолжая, вы соглашаетесь с бережным отношением к вашим данным. Мы не трогаем
        содержимое посланий — оно зашифровано на вашем устройстве.
      </p>
    </main>
  );
}

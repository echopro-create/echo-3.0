export const metadata = {
  title: "ECHO 3.0",
  description: "Next.js 15 + TS + Tailwind. Старт проверен.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru">
      <body>{children}</body>
    </html>
  );
}

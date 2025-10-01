import Link from "next/link";

export default function NotFound(){
  return (
    <div className="wrap py-16 text-center">
      <h1 className="title mb-3">Страница не найдена</h1>
      <p className="subtitle">
        Проверьте адрес или вернитесь на{" "}
        <Link className="underline" href="/">главную</Link>.
      </p>
    </div>
  );
}

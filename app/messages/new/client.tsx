'use client'
import { useState } from 'react'

export default function NewMessageClient() {
  const [tab, setTab] = useState<'text'|'audio'|'video'|'files'>('text')

  return (
    <div className="container py-6" style={{maxWidth: 720}}>
      <h1 className="title text-2xl font-semibold">Создать послание</h1>

      <div className="card mt-4 grid gap-3">
        <strong className="text-sm">Тип послания</strong>
        <div className="flex flex-wrap gap-2">
          {(['text','audio','video','files'] as const).map(t => (
            <button key={t} className={`btn ${tab===t?'primary':'secondary'}`} onClick={()=>setTab(t)}>
              {t==='text'?'Текст':t==='audio'?'Голос':t==='video'?'Видео':'Файлы'}
            </button>
          ))}
        </div>
      </div>

      {tab==='text'  && <div className="card mt-3">Редактор текста (заглушка)</div>}
      {tab==='audio' && <div className="card mt-3">Рекордер аудио (заглушка)</div>}
      {tab==='video' && <div className="card mt-3">Рекордер видео (заглушка)</div>}
      {tab==='files' && <div className="card mt-3">Загрузчик файлов в Supabase Storage (заглушка)</div>}

      <div className="card mt-3 grid gap-3">
        <strong className="text-sm">Доставка</strong>
        <div className="grid gap-2">
          <label className="inline-flex items-center gap-2">
            <input type="radio" name="mode" defaultChecked /> По пульсу (Dead-man switch)
          </label>
          <label className="inline-flex items-center gap-2">
            <input type="radio" name="mode" /> По дате
          </label>
        </div>
        <button className="btn primary mt-2">Сохранить</button>
      </div>
    </div>
  )
}

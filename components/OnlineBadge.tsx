'use client'
import { useEffect, useState } from 'react'

export default function OnlineBadge() {
  const [online, setOnline] = useState<boolean>(typeof navigator !== 'undefined' ? navigator.onLine : true)

  useEffect(() => {
    const on = () => setOnline(true)
    const off = () => setOnline(false)
    window.addEventListener('online', on)
    window.addEventListener('offline', off)
    return () => {
      window.removeEventListener('online', on)
      window.removeEventListener('offline', off)
    }
  }, [])

  return (
    <button
      aria-live="polite"
      aria-label={online ? 'В сети' : 'Офлайн'}
      title={online ? 'В сети' : 'Офлайн'}
      style={{
        position: 'fixed',
        right: 16,
        bottom: 88, // выше таб-бара
        zIndex: 60,
        background: online ? '#16a34a' : '#9ca3af',
        color: '#fff',
        borderRadius: 999,
        padding: '10px 14px',
        fontSize: 14,
        boxShadow: '0 6px 24px rgba(0,0,0,.12)',
        border: 'none',
        cursor: 'default'
      }}
    >
      {online ? 'В сети' : 'Офлайн'}
    </button>
  )
}

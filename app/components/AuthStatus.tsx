'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL as string,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string
)

export default function AuthStatus() {
  const [email, setEmail] = useState<string | null>(null)
  const [ready, setReady] = useState(false)
  const router = useRouter()

  useEffect(() => {
    let mounted = true
    async function init() {
      const { data } = await supabase.auth.getUser()
      if (mounted) { setEmail(data.user?.email ?? null); setReady(true) }
    }
    init()
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => {
      if (!mounted) return
      setEmail(s?.user?.email ?? null)
    })
    return () => { mounted = false; sub.subscription.unsubscribe() }
  }, [])

  async function signOut() {
    await supabase.auth.signOut()
    router.replace('/')   // домой
  }

  if (!ready) return <span className="inline-block w-24 h-7 rounded-xl bg-black/5" aria-hidden />

  if (!email) {
    return (
      <Link href="/login" className="inline-flex items-center gap-2 rounded-xl border px-3 py-1.5 text-sm hover:bg-black hover:text-white transition">
        Войти
      </Link>
    )
  }

  return (
    <div className="inline-flex items-center gap-2">
      <span className="inline-flex items-center gap-2 rounded-xl border px-3 py-1.5 text-sm bg-white">
        <span className="h-2 w-2 rounded-full bg-emerald-500" aria-hidden />
        {email}
      </span>
      <button onClick={signOut} className="text-sm underline text-neutral-600 hover:text-black">
        Выйти
      </button>
    </div>
  )
}

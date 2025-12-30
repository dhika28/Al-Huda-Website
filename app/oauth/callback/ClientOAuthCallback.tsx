'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function ClientOAuthCallback() {
  const router = useRouter()

  useEffect(() => {
    const fetchMe = async () => {
      try {
        const res = await fetch('http://localhost:8080/me', {
          credentials: 'include',
        })

        if (!res.ok) throw new Error('Not authenticated')

        const data = await res.json()
        localStorage.setItem('user', JSON.stringify(data.user))
        router.replace('/')
      } catch (err) {
        console.error(err)
        router.replace('/login')
      }
    }

    fetchMe()
  }, [router])

  return <div>Memproses login...</div>
}

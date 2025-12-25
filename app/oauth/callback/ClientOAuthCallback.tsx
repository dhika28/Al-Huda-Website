'use client'

import { useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

export default function ClientOAuthCallback() {
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    if (!searchParams) return

    const token = searchParams.get('token')
    const email = searchParams.get('email')
    const name = searchParams.get('name') || email?.split('@')[0]
    const role = (searchParams.get('role') as 'user' | 'admin') || 'user'

    if (token && email) {
      localStorage.setItem('token', token)
      const userData = { id: '1', name: name || 'User', email, role, avatar: '/placeholder.svg' }
      localStorage.setItem('user', JSON.stringify(userData))
      router.push('/')
    }
  }, [searchParams, router])

  return <div>Memproses login...</div>
}

'use client'
import { useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

export default function OAuthCallbackPage() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const token = searchParams.get('token')
  const email = searchParams.get('email')
  const name = searchParams.get('name') // <— tambahkan ini
  const role = searchParams.get('role') || 'user'

  useEffect(() => {
    if (token && email) {
      // simpan token
      localStorage.setItem('token', token)

      // simpan user
      const userData = {
        id: '1',
        // gunakan nama dari query kalau ada, fallback ke email
        name: name || email.split('@')[0],
        email,
        role: role as 'user' | 'admin',
        avatar: '/placeholder.svg',
      }

      localStorage.setItem('user', JSON.stringify(userData))

      // redirect setelah simpan
      router.push('/') // ubah sesuai kebutuhan
    }
  }, [token, email, name, role, router])

  return <div>Memproses login...</div>
}

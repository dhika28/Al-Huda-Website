'use client'

import dynamic from 'next/dynamic'

const ClientOAuthCallback = dynamic(() => import('./ClientOAuthCallback'), { ssr: false })

export default function Page() {
  return <ClientOAuthCallback />
}

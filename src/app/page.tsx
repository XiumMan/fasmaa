// src/app/page.tsx
'use client'

import MainDashboard from '@/components/dashboard/MainDashboard'
import SimpleAuthWrapper from '@/components/auth/SimpleAuthWrapper'

export default function HomePage() {
  return (
    <SimpleAuthWrapper>
      <MainDashboard />
    </SimpleAuthWrapper>
  )
}
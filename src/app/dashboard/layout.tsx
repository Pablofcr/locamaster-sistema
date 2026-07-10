'use client'

import DashboardLayout from '@/components/layout/DashboardLayout'
import { ToastProvider } from '@/components/ui/Toast'
import { EmpresaProvider } from '@/contexts/EmpresaContext'

export default function Layout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ToastProvider>
      <EmpresaProvider>
        <DashboardLayout>
          {children}
        </DashboardLayout>
      </EmpresaProvider>
    </ToastProvider>
  )
}

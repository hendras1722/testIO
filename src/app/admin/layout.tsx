import AdminLayout from '@/components/templates/AdminLayout'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Dashboard',
  description: 'Dashboard Admin',
}

export default function RootLayoutAdmin({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return <AdminLayout>{children}</AdminLayout>
}

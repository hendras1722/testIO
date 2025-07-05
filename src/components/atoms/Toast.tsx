import { Alert } from '@mui/material'

interface BaseToastProps {
  children: React.ReactNode
  variant: 'filled' | 'outlined' | 'standard'
  severity: 'success' | 'info' | 'warning' | 'error'
}

export default function BaseToast({
  children,
  variant,
  severity,
}: Readonly<BaseToastProps>) {
  return (
    <Alert variant={variant} severity={severity}>
      {children}
    </Alert>
  )
}

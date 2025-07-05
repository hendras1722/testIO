import { useEffect } from 'react'
import BaseToast from '../atoms/Toast'

export default function Toast({
  toast,
  setToast,
}: {
  readonly toast: {
    open: boolean
    message: string
    severity: 'success' | 'info' | 'warning' | 'error'
  }
  readonly setToast: React.Dispatch<
    React.SetStateAction<{
      open: boolean
      message: string
      severity: 'success' | 'info' | 'warning' | 'error'
    }>
  >
}) {
  useEffect(() => {
    if (toast.open)
      setTimeout(() => {
        setToast({
          open: false,
          message: '',
          severity: 'error',
        })
      }, 3000)
  }, [toast.open])
  return (
    <div
      className={
        'w-[280px] absolute right-2 top-5 transition-transform duration-300 ease-in-out' +
        (toast.open ? ' translate-x-0' : ' !opacity-0 ')
      }
    >
      <BaseToast variant="filled" severity={toast.severity}>
        {toast.message}
      </BaseToast>
    </div>
  )
}

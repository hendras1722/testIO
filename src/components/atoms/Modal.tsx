import * as React from 'react'
import Dialog from '@mui/material/Dialog'
import DialogContent from '@mui/material/DialogContent'
import DialogTitle from '@mui/material/DialogTitle'
import { DialogContentText } from '@mui/material'

export default function Modal({
  children,
  title,
  open,
  setOpen,
  contentText,
}: Readonly<{
  children: React.ReactNode
  title: string
  open: boolean
  setOpen: React.Dispatch<React.SetStateAction<boolean>>
  contentText: string
}>) {
  const handleClose = () => {
    setOpen(false)
  }

  return (
    <Dialog open={open} onClose={handleClose}>
      <DialogTitle>{title}</DialogTitle>
      <DialogContent sx={{ paddingBottom: 0 }}>
        <DialogContentText>{contentText}</DialogContentText>
        {children}
      </DialogContent>
    </Dialog>
  )
}

'use client'

import Toast from '@/components/molecules/Toast'
import RouteLeaveHandler from '@/composable/onBeforeLeave'
import { useApi } from '@/composable/useApi'
import { BaseResponse } from '@/type/baseResponse'
import { zodResolver } from '@hookform/resolvers/zod'
import { Box, Button, InputAdornment, TextField } from '@mui/material'
import { Eye, EyeOff, Plus } from 'lucide-react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { Suspense, useEffect, useMemo, useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import z from 'zod'

const MAX_FILE_SIZE = 2_000_000
const ACCEPTED_IMAGE_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
]

const formSchema = z.object({
  name: z.string().min(2, 'Name is required'),
  email: z.string().email('Format email tidak valid'),
  password: z.string().min(2, 'Password is required'),
  image: z
    .any()
    .refine(
      (file) => file?.[0]?.size <= MAX_FILE_SIZE,
      `Max image size is 2MB.`
    )
    .refine(
      (file) => ACCEPTED_IMAGE_TYPES.includes(file?.[0]?.type),
      'Only .jpg, .jpeg, .png and .webp formats are supported.'
    ),
})

type UsersSchema = z.infer<typeof formSchema>

export default function LayoutCreateUser() {
  const imageInputRef = useRef<HTMLInputElement | null>(null)
  const [isDirty, setIsDirty] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showToast, setShowToast] = useState<{
    open: boolean
    message: string
    severity: 'success' | 'info' | 'warning' | 'error'
  }>({
    open: false,
    message: 'Created Success',
    severity: 'success',
  })

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<UsersSchema>({
    resolver: zodResolver(formSchema),
  })

  const watchedImage = watch('image')
  const watchedName = watch('name')
  const watchedPassword = watch('password')

  const guardCallback = (to, from, next) => {
    if (isDirty) {
      const userConfirmed = window.confirm(
        `You have unsaved changes. Do you want to navigate to ${to.path}?`
      )
      next(userConfirmed)
    } else {
      next()
    }
  }

  useEffect(() => {
    if (watchedPassword || watchedName) {
      setIsDirty(true)
    } else {
      setIsDirty(false)
    }
  }, [watchedName])

  const imageUrl = useMemo(() => {
    if (
      !watchedImage ||
      typeof watchedImage !== 'object' ||
      !watchedImage.length
    )
      return ''
    return URL.createObjectURL(watchedImage[0])
  }, [watchedImage])

  useEffect(() => {
    return () => {
      if (imageUrl) URL.revokeObjectURL(imageUrl)
    }
  }, [imageUrl])

  const router = useRouter()

  const { mutate, isPending } = useApi<BaseResponse<UsersSchema>, FormData>({
    url: '/v1/api/users',
    method: 'POST',
    onSuccess: () => {
      setShowToast({
        open: true,
        message: 'Created Success',
        severity: 'success',
      })
      router.push('/admin/users')
    },
  })

  const onSubmit = (data: UsersSchema) => {
    const formData = new FormData()

    for (let item of Object.keys(data)) {
      if (item === 'image') {
        const file = data.image?.[0]
        if (file) {
          formData.append('image', file)
        }
      } else {
        formData.append(item, String(data[item]))
      }
    }
    mutate(formData)
  }

  return (
    <Suspense>
      <RouteLeaveHandler guardCallback={guardCallback} />
      <Toast toast={showToast} setToast={setShowToast} />
      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <h1>Create Users</h1>

        <Box mb={2} mt={2}>
          <div
            className="h-[130px] w-[130px] mb-2 bg-gray-100 flex items-center justify-center border border-dashed border-gray-300 rounded cursor-pointer"
            onClick={() => imageInputRef.current?.click()}
          >
            {imageUrl ? (
              <Image src={imageUrl} alt="Preview" width={130} height={130} />
            ) : (
              <Plus />
            )}
          </div>

          <input
            type="file"
            accept={ACCEPTED_IMAGE_TYPES.join(',')}
            style={{ display: 'none' }}
            {...register('image')}
            ref={(e) => {
              register('image').ref(e)
              imageInputRef.current = e
            }}
          />
          {errors.image && (
            <p className="text-red-500 text-sm mt-1">
              {errors.image.message as string}
            </p>
          )}
        </Box>

        <Box mb={2}>
          <TextField
            fullWidth
            label="Name"
            error={!!errors.name}
            helperText={errors.name?.message}
            {...register('name')}
          />
        </Box>

        <Box mb={2}>
          <TextField
            fullWidth
            label="Password"
            type={showPassword ? 'text' : 'password'}
            slotProps={{
              input: {
                endAdornment: (
                  <InputAdornment position="start">
                    <button onClick={() => setShowPassword(!showPassword)}>
                      {showPassword ? <EyeOff /> : <Eye />}
                    </button>
                  </InputAdornment>
                ),
              },
            }}
            error={!!errors.password}
            helperText={errors.password?.message}
            {...register('password')}
          />
        </Box>

        <Box mb={2}>
          <TextField
            fullWidth
            label="Email"
            error={!!errors.email}
            helperText={errors.email?.message}
            {...register('email')}
          />
        </Box>

        <Box mt={2} className="flex gap-2 justify-center">
          <Button
            variant="text"
            color="secondary"
            href="/admin/users"
            disabled={isPending}
          >
            Cancel
          </Button>

          <Button
            variant="contained"
            color="primary"
            type="submit"
            disabled={isPending}
          >
            Submit
          </Button>
        </Box>
      </form>
    </Suspense>
  )
}

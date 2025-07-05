'use client'

import Toast from '@/components/molecules/Toast'
import RouteLeaveHandler from '@/composable/onBeforeLeave'
import { useApi } from '@/composable/useApi'
import { BaseResponse } from '@/type/baseResponse'
import { zodResolver } from '@hookform/resolvers/zod'
import { Box, Button, InputAdornment, TextField } from '@mui/material'
import { Eye, EyeOff, Plus } from 'lucide-react'
import Image from 'next/image'
import { useParams, useRouter } from 'next/navigation'
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
  password: z.string().optional(),
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

type UserSchema = z.infer<typeof formSchema>

export default function CreateInventory() {
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
    setValue,
    getValues,
    formState: { errors },
  } = useForm<UserSchema>({
    resolver: zodResolver(formSchema),
  })

  const watchedImage = watch('image')
  const watchedName = watch('name')
  const watchedPassword = watch('password')

  const searchParams = useParams()

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

  const { data: detailData, isPending: loadingGetDetail } = useApi<
    BaseResponse<UserSchema>
  >({
    url: '/v1/api/users/' + searchParams.slug,
  })

  useEffect(() => {
    if (detailData) {
      setValue('name', detailData.result.name)
      setValue('password', detailData.result.password)
      setValue('email', detailData.result.email)
      if (detailData.result.image) {
        fetch('/v1/storage/' + detailData.result.image).then((res) =>
          res.blob().then((blob) => {
            const file = new File(
              [blob],
              '/v1/storage/' + detailData.result.image,
              {
                type: 'image/' + detailData.result.image.split('.').pop(),
              }
            )

            const dt = new DataTransfer()
            dt.items.add(file)

            setValue('image', dt.files, { shouldValidate: true })
          })
        )
      }
      setIsDirty(true)
    }
  }, [detailData])

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

  const { mutate: UpdatePassword, isPending: loadingUpdatePassword } = useApi<
    BaseResponse<UserSchema>,
    { password: string }
  >({
    url: '/v1/api/users/' + searchParams.slug + '/change-password',
    method: 'POST',
    onSuccess: () => {
      setShowToast({
        open: true,
        message: 'Update Password Success',
        severity: 'success',
      })
      router.push('/admin/users')
    },
    onError: (error) => {
      setShowToast({
        open: true,
        message: 'Update Password Failed' + error.message,
        severity: 'error',
      })
    },
  })
  const { mutate, isPending } = useApi<BaseResponse<UserSchema>, FormData>({
    url: '/v1/api/users/' + searchParams.slug + '/change-info',
    method: 'POST',
    onSuccess: () => {
      setShowToast({
        open: true,
        message: 'Update Info Success',
        severity: 'success',
      })
      if (!getValues('password')) {
        router.push('/admin/users')
      }
    },
    onError: (error) => {
      setShowToast({
        open: true,
        message: 'Update Info Failed' + error.message,
        severity: 'error',
      })
    },
  })

  const onSubmit = async (data: UserSchema) => {
    const formData = new FormData()

    for (let item of Object.keys(data)) {
      if (item !== 'password') {
        if (item === 'image') {
          const file = data.image?.[0]
          if (file) {
            formData.append('image', file)
          }
        } else {
          formData.append(item, String(data[item]))
        }
      }
    }
    mutate(formData)
    if (data.password) {
      UpdatePassword({
        password: data.password,
      })
    }
  }

  return (
    <Suspense>
      <RouteLeaveHandler guardCallback={guardCallback} />
      <Toast toast={showToast} setToast={setShowToast} />
      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <h1>Edit Users</h1>

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
            focused={getValues('name') !== ''}
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
            focused={getValues('password') !== ''}
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
            focused={getValues('email') !== ''}
          />
        </Box>

        <Box mt={2} className="flex gap-2 justify-center">
          <Button
            variant="text"
            color="secondary"
            href="/admin/users"
            disabled={isPending || loadingGetDetail || loadingUpdatePassword}
          >
            Cancel
          </Button>

          <Button
            variant="contained"
            color="primary"
            type="submit"
            disabled={isPending || loadingGetDetail || loadingUpdatePassword}
          >
            Submit
          </Button>
        </Box>
      </form>
    </Suspense>
  )
}

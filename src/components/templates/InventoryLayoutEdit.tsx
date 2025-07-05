'use client'

import RouteLeaveHandler from '@/composable/onBeforeLeave'
import { useApi } from '@/composable/useApi'
import { BaseResponse } from '@/type/baseResponse'
import { zodResolver } from '@hookform/resolvers/zod'
import { Box, Button, TextField } from '@mui/material'
import { Plus } from 'lucide-react'
import Image from 'next/image'
import { useRouter, useParams } from 'next/navigation'
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
  code: z.string().min(2, 'Code is required'),
  description: z.string().min(2, 'Description is required'),
  stockQuantity: z
    .number({ invalid_type_error: 'Must be a number' })
    .min(1, 'Min 1'),
  image: z
    .any()
    .refine((fileList) => fileList instanceof FileList && fileList.length > 0, {
      message: 'Image is required',
    })
    .refine((fileList) => fileList?.[0]?.size <= MAX_FILE_SIZE, {
      message: 'Max image size is 2MB.',
    })
    .refine(
      (fileList) => {
        return ACCEPTED_IMAGE_TYPES.includes(fileList?.[0]?.type)
      },
      {
        message: 'Only .jpg, .jpeg, .png and .webp formats are supported.',
      }
    ),
})

type InventorySchema = z.infer<typeof formSchema>

export default function LayoutEditInventory() {
  const imageInputRef = useRef<HTMLInputElement | null>(null)
  const [isDirty, setIsDirty] = useState(false)

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    getValues,
    formState: { errors },
  } = useForm<InventorySchema>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      stockQuantity: 1,
    },
  })

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
    BaseResponse<InventorySchema>
  >({
    url: '/v1/api/inventories/' + searchParams.slug,
  })

  const watchedImage = watch('image')

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
    if (detailData) {
      setValue('name', detailData.result.name)
      setValue('code', detailData.result.code)
      setValue('description', detailData.result.description)
      setValue('stockQuantity', detailData.result.stockQuantity)
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
    return () => {
      if (imageUrl) URL.revokeObjectURL(imageUrl)
    }
  }, [imageUrl])

  const router = useRouter()

  const { mutate, isPending } = useApi<BaseResponse<InventorySchema>, FormData>(
    {
      url: '/v1/api/inventories/' + searchParams.slug,
      method: 'POST',
      onSuccess: () => {
        router.push('/admin/inventory')
      },
    }
  )

  const onSubmit = (data: InventorySchema) => {
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
      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <h1>Edit Inventory</h1>

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
            label="Code"
            error={!!errors.code}
            helperText={errors.code?.message}
            {...register('code')}
            focused={getValues('code') !== ''}
          />
        </Box>

        <Box mb={2}>
          <TextField
            fullWidth
            label="Description"
            multiline
            rows={3}
            error={!!errors.description}
            helperText={errors.description?.message}
            {...register('description')}
            focused={getValues('description') !== ''}
          />
        </Box>

        <Box mb={2}>
          <TextField
            fullWidth
            label="Stock Quantity"
            type="number"
            error={!!errors.stockQuantity}
            helperText={errors.stockQuantity?.message}
            {...register('stockQuantity', { valueAsNumber: true })}
          />
        </Box>

        <Box mt={2} className="flex gap-2 justify-center">
          <Button
            variant="text"
            color="secondary"
            href="/admin/inventory"
            disabled={isPending || loadingGetDetail}
          >
            Cancel
          </Button>

          <Button
            variant="contained"
            color="primary"
            type="submit"
            disabled={isPending || loadingGetDetail}
          >
            Submit
          </Button>
        </Box>
      </form>
    </Suspense>
  )
}

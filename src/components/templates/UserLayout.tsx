'use client'

import DataTable from '@/components/molecules/DataTable'
import { useApi } from '@/composable/useApi'
import { BaseResponse } from '@/type/baseResponse'
import { Badge, Button, Grid, InputAdornment, TextField } from '@mui/material'
import { Search } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { debounce } from 'radash'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import Modal from '@/components/atoms/Modal'
import Toast from '@/components/molecules/Toast'
import type { User } from '@/type/Users'

export default function UserLayout() {
  const [open, setOpen] = useState(false)
  const [params, setParams] = useState({
    page: 0,
    limit: 10,
    search: '',
  })
  const [selectId, setSelectId] = useState('')
  const [toast, setToast] = useState<{
    open: boolean
    message: string
    severity: 'success' | 'info' | 'warning' | 'error'
  }>({
    open: false,
    message: '',
    severity: 'error',
  })

  const columns: {
    accessor?: keyof User
    label: string
    render?: (row: User) => React.ReactNode
  }[] = [
    {
      accessor: 'name',
      label: 'Name',
    },
    {
      accessor: 'email',
      label: 'Email',
    },
    {
      accessor: 'image',
      label: 'Image',
      render: (row) => (
        <div>
          {(row.image && (
            <Image
              src={'/v1/storage/' + row.image}
              alt="picture"
              width={0}
              height={0}
              className="w-[80px] h-[80px] object-cover"
              priority
              unoptimized
            />
          )) ||
            'No Picture'}
        </div>
      ),
    },
    {
      accessor: 'isImmutable',
      label: 'Active',
      render: (row) => (
        <Badge
          color={row.isImmutable ? 'success' : 'error'}
          badgeContent={row.isImmutable ? 'Active' : 'Inactive'}
        ></Badge>
      ),
    },
    {
      label: 'Action',
      render: (row) => {
        return (
          <>
            <Button
              href={`/admin/users/edit/${row.id}`}
              variant="text"
              color="success"
              className="text-nowrap"
            >
              Edit
            </Button>
            <Button
              variant="text"
              color="error"
              className="text-nowrap"
              onClick={() => {
                setSelectId(row.id)
                setOpen(true)
              }}
            >
              Delete
            </Button>
          </>
        )
      },
    },
  ] as const

  const router = useRouter()
  const filterParams = useMemo(() => {
    const query = new URLSearchParams()

    query.append('page', String(params.page))
    query.append('limit', String(params.limit))

    if (params.search) {
      query.append('search', params.search)
    }

    return `?${query.toString()}`
  }, [params])

  const getSelectId = useMemo(() => {
    return selectId
  }, [selectId])

  const { data, isPending } = useApi<BaseResponse<User[]>>({
    url: '/v1/api/users' + filterParams,
  })

  const { mutate, isPending: isPendingDelete } = useApi({
    url: '/v1/api/users/' + getSelectId,
    method: 'DELETE',
    queryKey: ['/v1/api/users', filterParams.slice(1)],
    onSuccess: () => {
      setToast({
        open: true,
        message: 'Delete Success',
        severity: 'success',
      })
      setOpen(false)
    },
  })

  const search = debounce(
    { delay: 1000 },
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setParams({
        ...params,
        search: e.target.value,
      })
    }
  )

  useEffect(() => {
    const query = new URLSearchParams()

    if (query.get('page')) {
      router.push(`/admin/users` + filterParams)
      setParams({
        ...params,
        page: Number(query.get('page')),
      })
    }
  }, [filterParams])

  return (
    <>
      <h5>Users</h5>
      <Toast toast={toast} setToast={setToast} />
      <Modal
        open={open}
        setOpen={setOpen}
        title="Delete User"
        contentText="Item ini akan dihapus selamanya. Apakah anda yakin?"
      >
        <div className="my-5 flex justify-end gap-2">
          <Button
            variant="text"
            color="inherit"
            onClick={() => setOpen(false)}
            disabled={isPendingDelete}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            color="error"
            onClick={() => mutate(getSelectId)}
            disabled={isPendingDelete}
          >
            Delete
          </Button>
        </div>
      </Modal>
      <Grid container spacing={2} marginTop={2}>
        <Grid size={{ lg: 10, md: 10, sm: 12, xs: 12 }}>
          <TextField
            onChange={search}
            id="outlined-basic"
            variant="outlined"
            size="small"
            fullWidth
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <Search />
                  </InputAdornment>
                ),
              },
            }}
          />
        </Grid>
        <Grid size={{ lg: 2, md: 2, sm: 12, xs: 12 }}>
          <Button
            variant="contained"
            color="success"
            className="text-nowrap"
            href="/admin/users/create"
            fullWidth
          >
            Add User
          </Button>
        </Grid>
      </Grid>

      <div className="mt-5">
        <DataTable
          key="datatable"
          totalItems={data?.meta.totalItems ?? 0}
          rowsPerPage={params.limit}
          items={data?.result ?? []}
          loading={isPending}
          fields={columns}
          page={params.page}
          onPageChange={(e) =>
            setParams((prevState) => ({ ...prevState, page: e }))
          }
          onRowsPerPageChange={(e) =>
            setParams((prevState) => ({ ...prevState, limit: e }))
          }
        />
      </div>
    </>
  )
}

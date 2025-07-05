import React from 'react'
import {
  LinearProgress,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
} from '@mui/material'

export interface Column<T> {
  label: string
  minWidth?: number
  align?: 'right' | 'left' | 'center'
  render?: (row: T, index: number) => React.ReactNode
  accessor?: keyof T
}

interface ReusableTableProps<T> {
  fields: Column<T>[]
  items: T[]
  page: number
  rowsPerPage: number
  onPageChange: (newPage: number) => void
  onRowsPerPageChange: (newRowsPerPage: number) => void
  totalItems: number
  loading?: boolean
}

export default function DataTable<T extends { [key: string]: any }>({
  fields,
  items,
  page,
  rowsPerPage,
  onPageChange,
  onRowsPerPageChange,
  totalItems,
  loading = false,
}: Readonly<ReusableTableProps<T>>) {
  const handleChangePage = (_event: unknown, newPage: number) => {
    onPageChange(newPage)
  }

  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    onRowsPerPageChange(+event.target.value)
    onPageChange(0) // Reset to first page
  }

  return (
    <Paper sx={{ width: '100%', overflow: 'hidden', boxShadow: 'none' }}>
      <TableContainer sx={{ maxHeight: 440 }}>
        {loading && <LinearProgress />}
        <Table stickyHeader>
          <TableHead>
            <TableRow>
              {fields.map((column, index) => (
                <TableCell
                  key={`${column.label}-${index}`}
                  align={column.align}
                  style={{ minWidth: column.minWidth }}
                >
                  {column.label}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {items
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((row, index) => {
                const rowKey = row.id ?? `${page}-${index}`
                return (
                  <TableRow hover role="checkbox" tabIndex={-1} key={rowKey}>
                    {fields.map((column, colIndex) => {
                      let value: any

                      if (column.render) {
                        value = column.render(row, index)
                      } else if (column.accessor) {
                        value = row[column.accessor]
                      }

                      const cellKey = `${rowKey}-${
                        column.accessor ? String(column.accessor) : colIndex
                      }`

                      return (
                        <TableCell key={cellKey} align={column.align}>
                          {value}
                        </TableCell>
                      )
                    })}
                  </TableRow>
                )
              })}
          </TableBody>
        </Table>
      </TableContainer>

      <TablePagination
        rowsPerPageOptions={[10, 25, 100]}
        component="div"
        count={totalItems}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
      />
    </Paper>
  )
}

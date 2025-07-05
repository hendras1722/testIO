export interface BaseResponse<T> {
  timestamp?: Date
  status: number
  message: string
  meta: Meta
  result: T
}

export interface Meta {
  itemsPerPage: number
  totalItems: number
  currentPage: number
  totalPages: number
}

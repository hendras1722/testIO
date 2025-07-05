import { BaseResponse } from '@/type/baseResponse'
import { LoginResult } from '@/type/login'
import axios from 'axios'
import Cookies from 'js-cookie'

const api = axios.create({
  baseURL: '/',
  withCredentials: true,
})

api.interceptors.request.use((config) => {
  const token = Cookies.get('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const originalRequest = error.config

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true

      try {
        const res = await api.post<BaseResponse<LoginResult>>(
          '/v1/api/auth/refresh-token'
        )
        const newAccessToken = res.data.result.token.accessToken
        // setAccessToken(newAccessToken)

        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`
        return api(originalRequest)
      } catch (refreshError) {
        return Promise.reject(refreshError)
      }
    }

    return Promise.reject(error)
  }
)

export default api

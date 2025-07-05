// app/api/login/route.ts
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { LoginRequest, LoginResult } from '@/type/login'
import { BaseResponse } from '@/type/baseResponse'

export async function POST(request: NextRequest) {
  const body: LoginRequest = await request.json()

  const res = await fetch('https://api.nanspace.top/api/auth/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  })

  if (!res.ok) {
    return NextResponse.json({ error: 'Login failed' }, { status: res.status })
  }

  const data: BaseResponse<LoginResult> = await res.json()

  // Set cookie httpOnly
  const response = NextResponse.json(data)

  response.cookies.set('token', data.result.token.accessToken, {
    secure: true,
    path: '/',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7,
  })

  response.cookies.set('refreshToken', data.result.token.refreshToken, {
    secure: true,
    path: '/',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7,
  })

  return response
}

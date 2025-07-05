'use client'

import React, { useState, useEffect, useCallback, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import Navbar from '../organism/Navbar'
import ListMenuSidebar from '../organism/ListMenuSidebar'
import { Container } from '@mui/material'
import Cookies from 'js-cookie'

const AdminLayout = ({ children }: { readonly children: React.ReactNode }) => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [sidebarWidth, setSidebarWidth] = useState(256)
  const [isResizing, setIsResizing] = useState(false)

  const router = useRouter()

  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed)
  }

  const handleResize = useCallback(
    (e: MouseEvent) => {
      if (!isResizing) return

      const newWidth = e.clientX
      if (newWidth >= 200 && newWidth <= 400) {
        setSidebarWidth(newWidth)
      }
    },
    [isResizing]
  )

  const stopResize = useCallback(() => {
    setIsResizing(false)
    document.removeEventListener('mousemove', handleResize)
    document.removeEventListener('mouseup', stopResize)
    document.body.style.cursor = ''
    document.body.style.userSelect = ''
  }, [handleResize])

  const startResize = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault()
      setIsResizing(true)
      document.addEventListener('mousemove', handleResize)
      document.addEventListener('mouseup', stopResize)
      document.body.style.cursor = 'ew-resize'
      document.body.style.userSelect = 'none'
    },
    [handleResize, stopResize]
  )

  useEffect(() => {
    const handleWindowResize = () => {
      if (window.innerWidth < 1024) {
        setSidebarCollapsed(true)
      }
    }

    window.addEventListener('resize', handleWindowResize)
    handleWindowResize()

    return () => {
      window.removeEventListener('resize', handleWindowResize)
    }
  }, [])

  const getMe = useMemo(() => {
    return JSON.parse(Cookies.get('me') ?? '{}')
  }, [Cookies.get('me')])

  // Cleanup effect for resize events
  useEffect(() => {
    return () => {
      document.removeEventListener('mousemove', handleResize)
      document.removeEventListener('mouseup', stopResize)
      document.body.style.cursor = ''
      document.body.style.userSelect = ''
    }
  }, [handleResize, stopResize])

  async function handleLogout() {
    Cookies.remove('token')
    Cookies.remove('refreshToken')
    router.push('/login')
  }

  return (
    <div className="h-screen !bg-gray-50 overflow-hidden">
      <div
        className={`fixed h-full left-0 z-50 bg-white shadow-lg transition-all duration-300 ${
          sidebarCollapsed
            ? 'transform -translate-x-full lg:translate-x-0 lg:w-16'
            : 'w-64'
        }`}
        style={
          !sidebarCollapsed && sidebarWidth
            ? { width: `${sidebarWidth}px` }
            : {}
        }
      >
        <div className="flex items-center justify-between h-16 !px-4 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">D</span>
            </div>
          </div>
        </div>
        <ListMenuSidebar
          sidebarCollapsed={sidebarCollapsed}
          handleLogout={handleLogout}
        />
        {!sidebarCollapsed && (
          <div
            className="absolute right-0 top-0 bottom-0 w-1 bg-transparent hover:bg-blue-500 cursor-col-resize transition-colors duration-150 group"
            onMouseDown={startResize}
          >
            <div className="w-full h-full group-hover:bg-blue-500 transition-colors duration-150"></div>
          </div>
        )}{' '}
      </div>

      {!sidebarCollapsed && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden transition-opacity duration-300"
          onClick={toggleSidebar}
        ></div>
      )}

      <div
        className={`flex flex-col transition-all duration-300 min-h-screen ${
          sidebarCollapsed ? 'lg:!ml-[65px]' : 'lg:ml-64'
        }`}
        style={
          !sidebarCollapsed && sidebarWidth
            ? { marginLeft: `${sidebarWidth}px` }
            : {}
        }
      >
        <Navbar toggleSidebar={toggleSidebar} getMe={getMe} />

        <main className="flex-1 !p-6 overflow-auto">
          <div className="mx-auto">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
              <Container className="p-6">
                {children || (
                  <div className="text-center py-12">
                    <h1 className="text-2xl font-bold text-gray-900 mb-4">
                      Welcome to Dashboard
                    </h1>
                    <p className="text-gray-600">
                      This is your main content area. Replace this with your
                      actual content.
                    </p>
                  </div>
                )}
              </Container>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}

export default AdminLayout

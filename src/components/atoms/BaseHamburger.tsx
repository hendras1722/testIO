'use client'

import { Menu } from 'lucide-react'
import React from 'react'

export default function BaseHamburger(
  props: Readonly<React.HTMLAttributes<HTMLButtonElement>>
) {
  return (
    <button
      {...props}
      className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-150"
    >
      <Menu className="w-5 h-5 text-black" />
    </button>
  )
}

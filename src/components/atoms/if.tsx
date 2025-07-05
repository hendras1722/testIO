'use client'

import React, { ReactNode, createContext, useContext } from 'react'

// Create a context to track parent If conditions
interface IfContextType {
  parentId: string | null
  result: boolean
}

const IfContext = createContext<IfContextType>({
  parentId: null,
  result: false,
})

/**
 * If Component - evaluates a condition and manages rendering
 */
export const If: React.FC<{
  condition: boolean
  children: ReactNode
  id?: string
}> = ({
  condition,
  children,
  id = `if-${Math.random().toString(36).substring(2, 9)}`, // Generate random ID if not provided
}) => {
  // Determine this component's result
  const result = condition

  // Find Else and ElseIf components that belong to this If
  const elseChildren: React.ReactNode[] = []
  const regularChildren: React.ReactNode[] = []

  React.Children.forEach(children, (child) => {
    if (React.isValidElement(child)) {
      if (child.type === Else) {
        // Clone Else with our ID
        elseChildren.push(
          React.cloneElement(child, {
            ...(typeof child.props === 'object' && child.props
              ? child.props
              : {}),
            ifParentId: id,
          } as any)
        )
      } else if (child.type === ElseIf) {
        // Clone ElseIf with our ID
        elseChildren.push(
          React.cloneElement(child, {
            ...(typeof child.props === 'object' && child.props
              ? child.props
              : {}),
            ifParentId: id,
          } as any)
        )
      } else {
        regularChildren.push(child)
      }
    } else {
      regularChildren.push(child)
    }
  })

  return (
    <IfContext.Provider value={{ parentId: id, result }}>
      {result ? (
        // If condition is true, render regular children
        <>{regularChildren}</>
      ) : (
        // If condition is false, render Else/ElseIf children
        <>{elseChildren}</>
      )}
    </IfContext.Provider>
  )
}

/**
 * ElseIf Component - conditional rendering when parent If is false
 */
export const ElseIf: React.FC<{
  condition: boolean
  children: ReactNode
  ifParentId?: string
}> = ({ condition, children, ifParentId }) => {
  const { parentId } = useContext(IfContext)

  // Only process if this ElseIf belongs to the current If context
  if (ifParentId && ifParentId === parentId) {
    return condition ? <>{children}</> : null
  }

  return null
}

/**
 * Else Component - renders when parent If and all ElseIf are false
 */
export const Else: React.FC<{
  children: ReactNode
  ifParentId?: string
}> = ({ children, ifParentId }) => {
  const { parentId } = useContext(IfContext)

  // Only render if this Else belongs to the current If context
  if (ifParentId && ifParentId === parentId) {
    return <>{children}</>
  }

  return null
}

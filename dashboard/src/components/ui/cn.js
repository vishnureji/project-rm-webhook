import React from 'react'

export function cn(...classes) {
  return classes.filter(Boolean).join(' ')
}

export default cn

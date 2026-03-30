import { useState, useCallback } from 'react'

export interface Industry {
  id: string
  name: string
  code: string
  description?: string
}

export function useIndustry() {
  const [selectedIndustry, setSelectedIndustry] = useState<string>(() => {
    return localStorage.getItem('selectedIndustry') || 'all'
  })

  const selectIndustry = useCallback((id: string) => {
    setSelectedIndustry(id)
    localStorage.setItem('selectedIndustry', id)
  }, [])

  return { selectedIndustry, selectIndustry }
}

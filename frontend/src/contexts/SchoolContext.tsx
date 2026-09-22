import { createContext, useContext, useState, type ReactNode } from 'react'
import type { School } from '../types'

const CURRENT_SCHOOL_KEY = 'scale-engine:current-school'

interface SchoolContextValue {
  currentSchool: School | null
  setCurrentSchool: (school: School) => void
  clearCurrentSchool: () => void
}

const SchoolContext = createContext<SchoolContextValue | undefined>(undefined)

export function SchoolProvider({ children }: { children: ReactNode }) {
  const [currentSchool, setCurrentSchoolState] = useState<School | null>(() => {
    const stored = sessionStorage.getItem(CURRENT_SCHOOL_KEY)
    return stored ? JSON.parse(stored) : null
  })

  function setCurrentSchool(school: School) {
    sessionStorage.setItem(CURRENT_SCHOOL_KEY, JSON.stringify(school))
    setCurrentSchoolState(school)
  }

  function clearCurrentSchool() {
    sessionStorage.removeItem(CURRENT_SCHOOL_KEY)
    setCurrentSchoolState(null)
  }

  return (
    <SchoolContext.Provider value={{ currentSchool, setCurrentSchool, clearCurrentSchool }}>
      {children}
    </SchoolContext.Provider>
  )
}

export function useSchool() {
  const context = useContext(SchoolContext)
  if (!context) {
    throw new Error('useSchool deve ser utilizado dentro de um SchoolProvider')
  }
  return context
}

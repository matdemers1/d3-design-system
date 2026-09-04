import { createContext, useContext } from 'react'

export interface FormFieldContextValue {
  id: string
  describedBy: string | undefined
  invalid: boolean
  required: boolean
}

export const FormFieldContext = createContext<FormFieldContextValue | null>(null)

/**
 * Controls call this to receive their wiring. Returns `null` outside a
 * FormField, which is legal only inside a table cell or toolbar where a column
 * header or an `aria-label` is the name.
 */
export const useFormField = () => useContext(FormFieldContext)

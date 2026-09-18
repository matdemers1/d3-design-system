// Component base — must load before any component stylesheet.
import './styles/components.css'

// @d3cloud/ui — the D3 Cloud component library.
// Components land batch by batch in the order the Phase 4 specs were approved.

// Batch 1 — T0 primitives
export * from './components/Avatar'
export * from './components/Badge'
export * from './components/Button'
export * from './components/IconButton'
export * from './components/Link'
export * from './components/Skeleton'
export * from './components/Spinner'

// Batch 4 — page patterns
export * from './components/EmptyState'
export * from './components/PageHeader'

// Batch 3 — layers and containers
export * from './components/Alert'
export * from './components/Card'
export * from './components/Modal'
export * from './components/Tabs'
export * from './components/SegmentedControl'
export * from './components/Tooltip'

// Batch 2 — the form layer
export * from './components/Checkbox'
export * from './components/CodeInput'
export * from './components/FormField'
export * from './components/Input'
export * from './components/Label'
export * from './components/PasswordInput'
export * from './components/Select'
export * from './components/Textarea'

// v1.1 L1 — the frame: shell, navigation, menus, theme (D-065, D-066)
export * from './components/AppShell'
export * from './components/SideNav'
export * from './components/Menu'
export * from './components/AccountMenu'
export * from './components/Theme'

// v1.1 — page primitives (D-068)
export * from './components/Page'
export * from './components/Stack'
export * from './components/Grid'
export * from './components/Section'
export * from './components/AuthLayout'

// v1.1 — lists and forms (D-067, D-069, D-070)
export * from './components/DescriptionList'
export * from './components/DataList'
export * from './components/FormActions'
export * from './components/FilterBar'

// v1.2 — records (D-067's other half: DataList is for like things, Table for records)
export * from './components/Table'

// Strict CSP: the nonce for the styles Radix injects while a layer is open (D-072)
export { setStyleNonce, readStyleNonce } from './lib/styleNonce'

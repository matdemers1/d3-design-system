import { getNonce, setNonce } from 'get-nonce'

/**
 * Strict CSP support for the styles the library injects at runtime (D-072).
 *
 * `Modal`, the `AppShell` drawer, `Select` and `Menu` lock page scroll through
 * Radix, which uses `react-remove-scroll`. That injects one `<style>` element
 * while a layer is open (`react-style-singleton`). Under a `style-src` with no
 * `'unsafe-inline'` the browser refuses it: a console error, and the page
 * behind the dialog still scrolls. The singleton reads its nonce from the
 * `get-nonce` package, and this sets it — the same module instance, because
 * `get-nonce` is a dependency of this package at the version the singleton
 * resolves, not a bundled copy (`scripts/check-dist.mjs` holds that).
 *
 * Call once, before the first render, with the nonce the server put in the
 * page's `style-src 'nonce-…'`:
 *
 * ```ts
 * const nonce = readStyleNonce()
 * if (nonce) setStyleNonce(nonce)
 * createRoot(el).render(<App />)
 * ```
 */
export function setStyleNonce(nonce: string): void {
  setNonce(nonce)
}

/**
 * Reads the nonce from `<meta name="d3-style-nonce" content="…">`, which the
 * server emits beside its `Content-Security-Policy` header. `undefined` when
 * there is no document, no meta, or an empty value.
 *
 * A meta rather than the `nonce` of an existing element: browsers hide a
 * `nonce` attribute from `getAttribute` once parsed, and a page is not
 * guaranteed to have a nonced element for the app to find.
 */
export function readStyleNonce(): string | undefined {
  if (typeof document === 'undefined') return undefined
  const meta = document.querySelector<HTMLMetaElement>('meta[name="d3-style-nonce"]')
  const value = meta?.content.trim()
  return value ? value : undefined
}

/** The nonce set with `setStyleNonce`, for `<style>` elements the library renders itself. @internal */
export function currentStyleNonce(): string | undefined {
  return getNonce()
}

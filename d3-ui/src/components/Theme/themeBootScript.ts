/** The key ThemeProvider and the boot script share unless told otherwise. */
export const DEFAULT_THEME_STORAGE_KEY = 'd3.theme'

/**
 * A small script, as a string, for an app to inline in `<head>` ahead of its
 * stylesheet and bundle:
 *
 * ```html
 * <script>/* output of themeBootScript() *\/</script>
 * ```
 *
 * It sets `data-theme` on `<html>` from the stored preference before first
 * paint, so a light-mode user never sees a dark frame while React loads (or the
 * reverse). React cannot do this: by the time any component runs, the browser
 * has already painted the page once. `ThemeProvider` takes over from the same
 * attribute and the same key.
 *
 * Every step is wrapped: storage can throw (Safari private mode, a blocked
 * cookie policy), and when it does the script falls back to the OS setting.
 * Under a CSP that blocks inline script, allow it by hash — the output is
 * deterministic for a given key.
 */
export function themeBootScript(storageKey: string = DEFAULT_THEME_STORAGE_KEY): string {
  // JSON-encoded so any key is a valid string literal, and `<` escaped so a key
  // can never close the <script> element it is inlined into.
  const key = JSON.stringify(String(storageKey)).replace(/</g, '\\u003c')
  return (
    '(function(){var p;' +
    `try{p=window.localStorage.getItem(${key})}catch(e){}` +
    'if(p!=="light"&&p!=="dark"){' +
    'try{p=window.matchMedia("(prefers-color-scheme: light)").matches?"light":"dark"}catch(e){p=null}}' +
    'if(p)document.documentElement.setAttribute("data-theme",p)})();'
  )
}

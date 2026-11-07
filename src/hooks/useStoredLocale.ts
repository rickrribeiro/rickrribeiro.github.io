const KEY = 'rr.locale';

export function readStoredLocale(): string | null {
  try {
    return localStorage.getItem(KEY);
  } catch {
    return null;
  }
}

export function storeLocale(code: string) {
  try {
    localStorage.setItem(KEY, code);
  } catch {
    /* private mode — ignore */
  }
}

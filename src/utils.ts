import type { QueryParams } from './types.js';

export function joinUrl(baseUrl: string, path: string): string {
  const cleanBase = baseUrl.replace(/\/+$/, '');
  const cleanPath = path.replace(/^\/+/, '');
  return `${cleanBase}/${cleanPath}`;
}

export function appendQuery(url: URL, query?: QueryParams): URL {
  if (!query) {
    return url;
  }

  for (const [key, value] of Object.entries(query)) {
    if (value === undefined || value === null) {
      continue;
    }

    const values = Array.isArray(value) ? value : [value];
    for (const item of values) {
      if (item !== undefined && item !== null) {
        url.searchParams.append(key, String(item));
      }
    }
  }

  return url;
}

export function mergeHeaders(...headers: Array<HeadersInit | undefined>): Headers {
  const merged = new Headers();

  for (const headerInit of headers) {
    if (!headerInit) {
      continue;
    }

    new Headers(headerInit).forEach((value, key) => {
      merged.set(key, value);
    });
  }

  return merged;
}

export function interpolatePath(path: string, params: Record<string, string | number>): string {
  return Object.entries(params).reduce(
    (current, [key, value]) => current.replaceAll(`{${key}}`, encodeURIComponent(String(value))),
    path,
  );
}

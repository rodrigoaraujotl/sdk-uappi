import { UappiApiError, type UappiApiErrorPayload } from './errors.js';
import { FrontApi } from './resources/front.js';
import type { UappiClientConfig, UappiHttpMethod, UappiRequestOptions, UappiResult } from './types.js';
import { appendQuery, joinUrl, mergeHeaders } from './utils.js';

export class UappiClient {
  readonly baseUrl: string;
  readonly appToken: string;
  readonly front: FrontApi;

  private readonly defaultHeaders?: HeadersInit;
  private readonly fetcher: typeof fetch;
  private session?: string;
  private readonly userAgent?: string;

  constructor(config: UappiClientConfig) {
    if (!config.baseUrl) {
      throw new Error('UappiClient requires a baseUrl.');
    }

    this.baseUrl = config.baseUrl;
    this.appToken = config.appToken ?? 'wapstore';
    this.session = config.session;
    this.defaultHeaders = config.headers;
    this.userAgent = config.userAgent;

    const fetcher = config.fetch ?? globalThis.fetch;
    if (!fetcher) {
      throw new Error('No fetch implementation was found. Provide config.fetch or use a runtime with fetch support.');
    }
    this.fetcher = fetcher.bind(globalThis) as typeof fetch;
    this.front = new FrontApi(this);
  }

  setSession(session?: string): void {
    this.session = session;
  }

  getSession(): string | undefined {
    return this.session;
  }

  get<TData = unknown>(path: string, options?: UappiRequestOptions): Promise<UappiResult<TData>> {
    return this.request<TData>('GET', path, options);
  }

  post<TData = unknown, TBody = unknown>(path: string, options?: UappiRequestOptions<TBody>): Promise<UappiResult<TData>> {
    return this.request<TData, TBody>('POST', path, options);
  }

  put<TData = unknown, TBody = unknown>(path: string, options?: UappiRequestOptions<TBody>): Promise<UappiResult<TData>> {
    return this.request<TData, TBody>('PUT', path, options);
  }

  patch<TData = unknown, TBody = unknown>(path: string, options?: UappiRequestOptions<TBody>): Promise<UappiResult<TData>> {
    return this.request<TData, TBody>('PATCH', path, options);
  }

  delete<TData = void>(path: string, options?: UappiRequestOptions): Promise<UappiResult<TData>> {
    return this.request<TData>('DELETE', path, options);
  }

  async request<TData = unknown, TBody = unknown>(
    method: UappiHttpMethod,
    path: string,
    options: UappiRequestOptions<TBody> = {},
  ): Promise<UappiResult<TData>> {
    const url = appendQuery(new URL(joinUrl(this.baseUrl, path)), options.query);
    const headers = mergeHeaders(
      {
        Accept: 'application/json',
        'App-Token': this.appToken,
        'Cache-Control': 'no-cache',
      },
      this.defaultHeaders,
      this.session ? { Session: this.session } : undefined,
      this.userAgent ? { 'User-Agent': this.userAgent } : undefined,
      options.headers,
    );

    const init: RequestInit & { next?: UappiRequestOptions['next'] } = {
      method,
      headers,
      signal: options.signal,
      cache: options.cache,
      next: options.next,
    };

    if (options.body !== undefined && method !== 'GET') {
      headers.set('Content-Type', headers.get('Content-Type') ?? 'application/json');
      init.body = serializeBody(options.body, headers);
    }

    const response = await this.fetcher(url, init);
    const meta = {
      status: response.status,
      headers: response.headers,
      requestId: response.headers.get('Request-Id'),
      rateLimit: {
        limit: response.headers.get('X-RateLimit-Limit'),
        remaining: response.headers.get('X-RateLimit-Remaining'),
      },
    };

    if (!response.ok) {
      throw new UappiApiError({
        status: response.status,
        statusText: response.statusText,
        requestId: meta.requestId,
        payload: await parseResponse<UappiApiErrorPayload | string>(response),
        headers: response.headers,
      });
    }

    return {
      data: response.status === 204 ? (undefined as TData) : await parseResponse<TData>(response),
      meta,
    };
  }
}

function serializeBody(body: unknown, headers: Headers): BodyInit {
  if (body instanceof FormData || body instanceof Blob || body instanceof URLSearchParams || typeof body === 'string') {
    return body;
  }

  const contentType = headers.get('Content-Type');
  if (contentType?.includes('application/x-www-form-urlencoded') && typeof body === 'object' && body !== null) {
    return new URLSearchParams(body as Record<string, string>).toString();
  }

  return JSON.stringify(body);
}

async function parseResponse<T>(response: Response): Promise<T> {
  const text = await response.text();
  if (!text) {
    return undefined as T;
  }

  const contentType = response.headers.get('Content-Type');
  if (contentType?.includes('application/json')) {
    return JSON.parse(text) as T;
  }

  try {
    return JSON.parse(text) as T;
  } catch {
    return text as T;
  }
}

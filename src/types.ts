export type Primitive = string | number | boolean | null | undefined;

export type QueryValue = Primitive | Primitive[];

export type QueryParams = Record<string, QueryValue>;

export type UappiHttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

export type FetchLike = (input: RequestInfo | URL, init?: RequestInit) => Promise<Response>;

export interface UappiClientConfig {
  /**
   * URL base fornecida pela Uappi, normalmente no formato https://sua-loja.com.br/api.
   */
  baseUrl: string;
  /**
   * Token público das APIs front. A documentação oficial usa "wapstore" como padrão.
   */
  appToken?: string;
  /**
   * Identificador da sessão do comprador, quando existir.
   */
  session?: string;
  /**
   * Headers extras enviados em todas as requisições.
   */
  headers?: HeadersInit;
  /**
   * Implementação customizada de fetch para testes, SSR ou instrumentação.
   */
  fetch?: FetchLike;
  /**
   * User-Agent opcional para chamadas server-side. Navegadores não permitem definir este header.
   */
  userAgent?: string;
}

export interface UappiRequestOptions<TBody = unknown> {
  query?: QueryParams;
  body?: TBody;
  headers?: HeadersInit;
  signal?: AbortSignal;
  cache?: RequestCache;
  next?: {
    revalidate?: false | 0 | number;
    tags?: string[];
  };
}

export interface UappiResponseMeta {
  status: number;
  headers: Headers;
  requestId?: string | null;
  rateLimit?: {
    limit?: string | null;
    remaining?: string | null;
  };
}

export interface UappiResult<TData> {
  data: TData;
  meta: UappiResponseMeta;
}

export interface RouteInfo {
  name?: string;
  route?: string;
  path?: string;
  params?: unknown[] | Record<string, unknown>;
  query?: unknown[] | Record<string, unknown>;
}

export interface UappiBrand {
  id: number;
  nome: string;
  imagem: string;
  imagemOriginal: string;
  ativo: boolean;
  url: string;
  rota: RouteInfo;
}

export interface UappiBrandsResponse {
  marcas: UappiBrand[];
}

export interface PaginationParams extends QueryParams {
  offset?: number;
  limit?: number;
}

export interface UappiCartResponse {
  quantidadeItens: number;
  quantidadeTotal: number;
  quantidadePontos?: number;
  mensagens?: Array<{ tipo: string; mensagem: string }>;
  itens: unknown[];
  subtotal?: unknown;
  promocoes?: unknown[];
  [key: string]: unknown;
}

export interface UappiStoreEvaluationsParams extends PaginationParams {
  codigoPais?: string;
}

export interface UappiOperationResponse {
  sucesso?: boolean;
  mensagem?: string;
  [key: string]: unknown;
}

export interface UappiRepresentativeResponse {
  representante?: unknown;
  [key: string]: unknown;
}

export interface UappiTrackingParameters {
  utm_source?: string;
  utm_campaign?: string;
  utm_medium?: string;
  [key: string]: unknown;
}

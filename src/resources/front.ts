import type { UappiClient } from '../client.js';
import type {
  PaginationParams,
  QueryParams,
  UappiBrandsResponse,
  UappiCartResponse,
  UappiOperationResponse,
  UappiRepresentativeResponse,
  UappiRequestOptions,
  UappiResult,
  UappiStoreEvaluationsParams,
  UappiTrackingParameters,
} from '../types.js';
import { interpolatePath } from '../utils.js';

const FRONT_PREFIX = '/v2/front';

export class FrontApi {
  readonly brands: BrandsResource;
  readonly checkout: CheckoutResource;
  readonly evaluations: EvaluationsResource;
  readonly categories: CategoriesResource;
  readonly questions: QuestionsResource;
  readonly giftsList: GiftsListResource;
  readonly representative: RepresentativeResource;
  readonly trackingParameters: TrackingParametersResource;

  constructor(private readonly client: UappiClient) {
    this.brands = new BrandsResource(client);
    this.checkout = new CheckoutResource(client);
    this.evaluations = new EvaluationsResource(client);
    this.categories = new CategoriesResource(client);
    this.questions = new QuestionsResource(client);
    this.giftsList = new GiftsListResource(client);
    this.representative = new RepresentativeResource(client);
    this.trackingParameters = new TrackingParametersResource(client);
  }

  request<TData = unknown, TBody = unknown>(
    method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE',
    path: string,
    options?: UappiRequestOptions<TBody>,
  ): Promise<UappiResult<TData>> {
    const resolvedPath = path.startsWith('/v2/front') ? path : `${FRONT_PREFIX}/${path.replace(/^\/+/, '')}`;
    return this.client.request<TData, TBody>(method, resolvedPath, options);
  }
}

export class BrandsResource {
  constructor(private readonly client: UappiClient) {}

  list(query?: QueryParams, options?: Omit<UappiRequestOptions, 'query'>): Promise<UappiResult<UappiBrandsResponse>> {
    return this.client.get<UappiBrandsResponse>(`${FRONT_PREFIX}/brands`, { ...options, query });
  }
}

export class CheckoutResource {
  constructor(private readonly client: UappiClient) {}

  getCart(options?: UappiRequestOptions): Promise<UappiResult<UappiCartResponse>> {
    return this.client.get<UappiCartResponse>(`${FRONT_PREFIX}/checkout/cart`, options);
  }
}

export class EvaluationsResource {
  readonly store: StoreEvaluationsResource;

  constructor(client: UappiClient) {
    this.store = new StoreEvaluationsResource(client);
  }
}

export class StoreEvaluationsResource {
  constructor(private readonly client: UappiClient) {}

  validateAddKey(key: string, options?: UappiRequestOptions): Promise<UappiResult<UappiOperationResponse>> {
    return this.client.get<UappiOperationResponse>(
      interpolatePath(`${FRONT_PREFIX}/evaluations/store/add/{key}`, { key }),
      options,
    );
  }

  list(
    query: UappiStoreEvaluationsParams,
    options?: Omit<UappiRequestOptions, 'query'>,
  ): Promise<UappiResult<Record<string, unknown>>> {
    return this.client.get<Record<string, unknown>>(`${FRONT_PREFIX}/evaluations/store`, { ...options, query });
  }
}

export class CategoriesResource {
  readonly compatibility: CategoriesCompatibilityResource;

  constructor(client: UappiClient) {
    this.compatibility = new CategoriesCompatibilityResource(client);
  }
}

export class CategoriesCompatibilityResource {
  constructor(private readonly client: UappiClient) {}

  removeActual(options?: UappiRequestOptions): Promise<UappiResult<void>> {
    return this.client.delete<void>(`${FRONT_PREFIX}/categories/compatibility/actual`, options);
  }
}

export class QuestionsResource {
  constructor(private readonly client: UappiClient) {}

  create<TBody extends Record<string, unknown> = Record<string, unknown>>(
    body: TBody,
    options?: Omit<UappiRequestOptions<TBody>, 'body'>,
  ): Promise<UappiResult<UappiOperationResponse>> {
    return this.client.post<UappiOperationResponse, TBody>(`${FRONT_PREFIX}/question`, { ...options, body });
  }
}

export class GiftsListResource {
  constructor(private readonly client: UappiClient) {}

  getTypes(query?: PaginationParams & { tipo?: 'presenteado' | 'noivo' | 'noiva' }, options?: Omit<UappiRequestOptions, 'query'>) {
    return this.client.get<Record<string, unknown>>(`${FRONT_PREFIX}/gifts-list/type`, { ...options, query });
  }

  removeActual(options?: UappiRequestOptions): Promise<UappiResult<UappiOperationResponse>> {
    return this.client.delete<UappiOperationResponse>(`${FRONT_PREFIX}/gifts-list/actual`, options);
  }
}

export class RepresentativeResource {
  constructor(private readonly client: UappiClient) {}

  get(options?: UappiRequestOptions): Promise<UappiResult<UappiRepresentativeResponse>> {
    return this.client.get<UappiRepresentativeResponse>(`${FRONT_PREFIX}/representative`, options);
  }

  set(hash: string, options?: UappiRequestOptions): Promise<UappiResult<UappiOperationResponse>> {
    return this.client.put<UappiOperationResponse>(interpolatePath(`${FRONT_PREFIX}/representative/{hash}`, { hash }), options);
  }
}

export class TrackingParametersResource {
  constructor(private readonly client: UappiClient) {}

  set(
    body: UappiTrackingParameters = {},
    options?: Omit<UappiRequestOptions<UappiTrackingParameters>, 'body'>,
  ): Promise<UappiResult<UappiOperationResponse>> {
    return this.client.post<UappiOperationResponse, UappiTrackingParameters>(`${FRONT_PREFIX}/tracking-parameters`, {
      ...options,
      body,
    });
  }
}

export interface UappiApiErrorPayload {
  message?: string;
  mensagem?: string;
  error?: string;
  erro?: string;
  [key: string]: unknown;
}

export class UappiApiError extends Error {
  readonly name = 'UappiApiError';
  readonly status: number;
  readonly statusText: string;
  readonly requestId?: string | null;
  readonly payload?: UappiApiErrorPayload | string;
  readonly headers: Headers;

  constructor(args: {
    status: number;
    statusText: string;
    requestId?: string | null;
    payload?: UappiApiErrorPayload | string;
    headers: Headers;
  }) {
    super(buildErrorMessage(args));
    this.status = args.status;
    this.statusText = args.statusText;
    this.requestId = args.requestId;
    this.payload = args.payload;
    this.headers = args.headers;
  }
}

function buildErrorMessage(args: {
  status: number;
  statusText: string;
  requestId?: string | null;
  payload?: UappiApiErrorPayload | string;
}): string {
  const payloadMessage =
    typeof args.payload === 'string'
      ? args.payload
      : args.payload?.message ?? args.payload?.mensagem ?? args.payload?.error ?? args.payload?.erro;

  const request = args.requestId ? ` Request-Id: ${args.requestId}.` : '';
  return `Uappi API error ${args.status} ${args.statusText}${payloadMessage ? `: ${payloadMessage}` : ''}.${request}`;
}

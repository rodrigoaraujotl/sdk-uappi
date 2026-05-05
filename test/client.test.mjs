import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { UappiClient } from '../.test-build/src/index.js';

function createJsonResponse(body, init = {}) {
  return new Response(JSON.stringify(body), {
    status: 200,
    headers: { 'Content-Type': 'application/json', ...init.headers },
    ...init,
  });
}

describe('UappiClient', () => {
  it('sends default Uappi headers and resolves typed front helpers', async () => {
    const calls = [];
    const client = new UappiClient({
      baseUrl: 'https://loja.test/api/',
      session: 'session-123',
      fetch: async (input, init) => {
        calls.push({ input, init });
        return createJsonResponse({ marcas: [] }, { headers: { 'Request-Id': 'req-1', 'X-RateLimit-Remaining': '59' } });
      },
    });

    const response = await client.front.brands.list({ ativo: true });

    assert.deepEqual(response.data, { marcas: [] });
    assert.equal(response.meta.requestId, 'req-1');
    assert.equal(String(calls[0]?.input), 'https://loja.test/api/v2/front/brands?ativo=true');
    assert.equal(calls[0]?.init?.headers.get('App-Token'), 'wapstore');
    assert.equal(calls[0]?.init?.headers.get('Session'), 'session-123');
  });

  it('serializes JSON request bodies and custom front paths', async () => {
    const calls = [];
    const client = new UappiClient({
      baseUrl: 'https://loja.test/api',
      fetch: async (input, init) => {
        calls.push({ input, init });
        return createJsonResponse({ sucesso: true });
      },
    });

    await client.front.request('POST', 'tracking-parameters', { body: { utm_source: 'google' } });

    assert.equal(String(calls[0]?.input), 'https://loja.test/api/v2/front/tracking-parameters');
    assert.equal(calls[0]?.init?.body, JSON.stringify({ utm_source: 'google' }));
    assert.equal(calls[0]?.init?.headers.get('Content-Type'), 'application/json');
  });

  it('throws enriched errors for non successful responses', async () => {
    const client = new UappiClient({
      baseUrl: 'https://loja.test/api',
      fetch: async () =>
        createJsonResponse(
          { mensagem: 'Limite de requisições atingido' },
          { status: 429, statusText: 'Too Many Requests', headers: { 'Request-Id': 'req-429' } },
        ),
    });

    await assert.rejects(() => client.front.checkout.getCart(), {
      status: 429,
      requestId: 'req-429',
    });
  });
});

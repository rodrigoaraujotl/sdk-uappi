# SDK Uappi Front v2

SDK TypeScript para facilitar o consumo das APIs **Front v2** da Uappi/Wapstore em projetos Next.js.

A documentação oficial informa que as APIs front são públicas, exigem o header `App-Token` com valor padrão `wapstore`, podem usar o header `Session` para operações associadas ao comprador e retornam headers úteis como `Request-Id`, `X-RateLimit-Limit` e `X-RateLimit-Remaining`: https://developers.uappi.com.br/docs/uappi/api/v2/front

## Instalação

```bash
npm install @uappi/sdk-front
```

> Enquanto o pacote não estiver publicado, use este repositório como workspace/package local no projeto Next.js.

## Compatibilidade com Next.js

- Não depende de APIs exclusivas do Node.js em runtime.
- Usa `fetch`, disponível no Next.js em Server Components, Route Handlers, Server Actions e no browser.
- Aceita opções do `fetch` do Next.js, como `next: { revalidate, tags }`.
- Permite injetar uma implementação de `fetch` para testes, observabilidade ou wrappers internos.

## Uso básico

```ts
import { UappiClient } from '@uappi/sdk-front';

export const uappi = new UappiClient({
  baseUrl: process.env.UAPPI_API_URL!, // Ex.: https://sua-loja.com.br/api
  appToken: process.env.UAPPI_APP_TOKEN ?? 'wapstore',
  userAgent: 'MinhaLoja/1.0', // recomendado para chamadas server-side em produção
});
```

## Exemplo em Server Component

```tsx
import { uappi } from '@/lib/uappi';

export default async function BrandsPage() {
  const { data } = await uappi.front.brands.list(undefined, {
    next: { revalidate: 300, tags: ['uappi-brands'] },
  });

  return (
    <ul>
      {data.marcas.map((marca) => (
        <li key={marca.id}>{marca.nome}</li>
      ))}
    </ul>
  );
}
```

## Exemplo com sessão do comprador

```ts
import { cookies } from 'next/headers';
import { UappiClient } from '@uappi/sdk-front';

export async function getCart() {
  const session = cookies().get('uappi-session')?.value;

  const client = new UappiClient({
    baseUrl: process.env.UAPPI_API_URL!,
    session,
  });

  return client.front.checkout.getCart({ cache: 'no-store' });
}
```

Também é possível atualizar a sessão em uma instância existente:

```ts
uappi.setSession('session-id');
```

## Recursos tipados disponíveis

```ts
await uappi.front.brands.list({ ativo: true });
await uappi.front.checkout.getCart();
await uappi.front.evaluations.store.validateAddKey('chave');
await uappi.front.evaluations.store.list({ offset: 0, limit: 100, codigoPais: 'bra|usa' });
await uappi.front.categories.compatibility.removeActual();
await uappi.front.questions.create({ idProduto: 123, pergunta: 'Esse produto tem garantia?' });
await uappi.front.giftsList.getTypes({ tipo: 'presenteado', offset: 0, limit: 100 });
await uappi.front.giftsList.removeActual();
await uappi.front.representative.get();
await uappi.front.representative.set('hash-do-representante');
await uappi.front.trackingParameters.set({
  utm_source: 'google',
  utm_campaign: 'campanha',
  utm_medium: 'cpc',
});
```

## Chamadas para endpoints ainda não mapeados

A documentação da Uappi possui muitos endpoints. Para permitir evolução incremental sem bloquear o projeto, o SDK expõe um método genérico com os mesmos headers, tratamento de erro e metadados:

```ts
const { data, meta } = await uappi.front.request('GET', 'products', {
  query: { offset: 0, limit: 24 },
  next: { revalidate: 60 },
});
```

Se preferir informar o path completo, também funciona:

```ts
await uappi.get('/v2/front/brands');
```

## Tratamento de erros

Respostas HTTP fora da faixa 2xx lançam `UappiApiError` com status, payload e `Request-Id` quando retornado pela API.

```ts
import { UappiApiError } from '@uappi/sdk-front';

try {
  await uappi.front.checkout.getCart();
} catch (error) {
  if (error instanceof UappiApiError) {
    console.error(error.status, error.requestId, error.payload);
  }
}
```

## Build e validação

```bash
npm run typecheck
npm test
npm run build
```

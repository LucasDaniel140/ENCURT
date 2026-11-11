# ENCURT

Encurtador de links simples, sem dependências externas (só Node.js).

Ao criar o link, você escolhe se o visitante:

- é redirecionado **direto** para o destino, ou
- vê uma tela com **timer de 5 segundos** antes de ser enviado.

## Deploy na Vercel

A Vercel não tem disco persistente, então os links ficam em um banco Redis (Upstash, plano gratuito).

1. No painel do projeto na Vercel, abra a aba **Storage**.
2. Clique em **Create Database**, escolha **Upstash** (Redis) e crie o banco.
3. Conecte o banco ao projeto. Isso cria as variáveis `KV_REST_API_URL` e `KV_REST_API_TOKEN`.
4. Faça um novo deploy (**Deployments > Redeploy**) para as variáveis entrarem em vigor.

Sem o banco conectado, a página abre, mas a criação de links retorna um aviso de armazenamento não configurado.

## Rodar localmente

Requer Node.js 18 ou superior.

```bash
npm start
```

Acesse `http://localhost:3000`. Localmente, sem as variáveis do Redis, os links são salvos em `data/links.json`.

## Variáveis de ambiente

| Variável                                 | Função                                                      |
|------------------------------------------|-------------------------------------------------------------|
| `KV_REST_API_URL` / `KV_REST_API_TOKEN`  | Credenciais do Upstash Redis (criadas pela Vercel)          |
| `BASE_URL`                               | Domínio usado no link curto, ex.: `https://meudominio.com`  |
| `PORT`                                   | Porta do servidor local (padrão `3000`)                     |
| `DATA_DIR`                               | Pasta do `links.json` no modo local (padrão `./data`)       |

Também são aceitos os nomes `UPSTASH_REDIS_REST_URL` e `UPSTASH_REDIS_REST_TOKEN`.

## Como funciona

- `POST /api/shorten` com `{ "url": "...", "timer": true|false }` cria o link.
- `GET /:codigo` redireciona (302) ou mostra a tela de contagem, conforme a opção.
- Cada acesso incrementa um contador de cliques (`clicks:<codigo>` no Redis).

## Estrutura

- `app.js`: rotas e páginas.
- `store.js`: armazenamento (Redis ou arquivo local).
- `api/index.js` e `vercel.json`: entrada da função serverless na Vercel.
- `public/index.html`: tela inicial.

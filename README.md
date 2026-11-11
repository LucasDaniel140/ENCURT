# ENCURT

Encurtador de links simples, sem dependências externas (só Node.js).

Ao criar o link, você escolhe se o visitante:

- é redirecionado **direto** para o destino, ou
- vê uma tela com **timer de 5 segundos** antes de ser enviado.

## Como rodar

Requer Node.js 18 ou superior.

```bash
npm start
```

Acesse `http://localhost:3000`.

## Configuração (variáveis de ambiente)

| Variável   | Padrão   | Função                                                        |
|------------|----------|---------------------------------------------------------------|
| `PORT`     | `3000`   | Porta do servidor                                             |
| `BASE_URL` | (auto)   | Domínio usado no link curto, ex.: `https://meudominio.com`    |
| `DATA_DIR` | `./data` | Pasta onde o arquivo `links.json` é salvo                     |

## Como funciona

- `POST /api/shorten` com `{ "url": "...", "timer": true|false }` cria o link.
- `GET /:codigo` redireciona (302) ou mostra a tela de contagem, conforme a opção.
- Os links ficam em `data/links.json`, com contador de cliques por link.

## Atenção em produção

Os dados ficam em arquivo local. Em hospedagens com disco efêmero (ex.: Render free,
Heroku), os links somem a cada deploy/restart. Use um disco persistente apontando
`DATA_DIR` para ele, ou troque o armazenamento por um banco de dados.

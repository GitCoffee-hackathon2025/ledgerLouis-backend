## 🚧 Desenvolvimento

Como a API ainda está em desenvolvimento, acesse a branch `dev`:

```bash
# vá para dev
git checkout dev
# Para usar uma versão mais estável:
git checkout faf6676b62d0b0a6793ead00309f7eae106afa85
npm i
```
No backend, é necessário ter um servidor MySQL rodando.

```bash
touch .env
# Em caso de dúvida sobre as variáveis de ambiente, consulte: src/schemas/env.schema.ts
```

Váriaveis de ambiente:

- PORT=3000
- NODE_ENV="development"
- ALLOWED_ORIGINS="http://localhost"
- DB_HOST="127.0.0.1"
- DB_PORT=3306
- DB_USER="admin"
- DB_PASS="senha"
- DATABASE="legder"

Envie os schemas do Drizzle para o banco:

```bash
npm run db:migrate
```

E só rodar o servidor agora
```bash
npm run dev
```

# VCar Belém

Site de venda de carros com painel administrativo e banco de dados real, pronto
pra rodar na Vercel.

- **Landing page**: estoque de carros, seção de contato, logo da loja — tudo
  puxado do banco de dados, então atualiza pra qualquer visitante, de
  qualquer dispositivo.
- **Painel admin** (`/admin`): protegido por senha. Dá pra adicionar, editar
  e excluir carros (com foto), trocar a logo e o nome da loja, e editar os
  contatos (telefone, WhatsApp, e-mail, endereço, horário, redes sociais).
- **Stack**: Next.js (App Router) + Postgres (via integração da Vercel, que
  hoje roda em cima do Neon) + Vercel Blob para as fotos.

---

## 1. Colocar o código no GitHub

```bash
cd vcar-belem
git init
git add .
git commit -m "VCar Belém - primeira versão"
```

Crie um repositório vazio no GitHub e suba o projeto:

```bash
git remote add origin https://github.com/SEU-USUARIO/vcar-belem.git
git branch -M main
git push -u origin main
```

## 2. Importar o projeto na Vercel

1. Entre em [vercel.com/new](https://vercel.com/new) e importe o repositório
   que você acabou de criar.
2. Pode deixar tudo no padrão (a Vercel detecta que é Next.js sozinha) e
   clicar em **Deploy**. Ele vai falhar de propósito na primeira vez, porque
   ainda faltam o banco de dados e as variáveis de ambiente — sem problema,
   os próximos passos resolvem isso.

## 3. Conectar o banco de dados (Postgres)

1. No projeto, vá em **Storage** → **Create Database** → escolha **Postgres**
   (hoje provisionado via Neon).
2. Depois de criado, clique em **Connect** para linkar ao seu projeto. Isso
   já injeta as variáveis `DATABASE_URL` / `POSTGRES_URL` automaticamente —
   você não precisa copiar nada na mão.
3. As tabelas (`cars`, `settings`) são criadas sozinhas na primeira
   requisição — não precisa rodar nenhum script de migração.

## 4. Conectar o armazenamento de fotos (Vercel Blob)

1. Ainda em **Storage** → **Create Database** → escolha **Blob**.
2. Clique em **Connect** para linkar ao projeto. Isso injeta a variável
   `BLOB_READ_WRITE_TOKEN` automaticamente.

## 5. Configurar a senha do admin

Vá em **Settings → Environment Variables** e adicione:

| Nome              | Valor                                              |
|-------------------|-----------------------------------------------------|
| `ADMIN_PASSWORD`  | a senha que vocês vão usar pra entrar em `/admin`   |
| `SESSION_SECRET`  | qualquer string longa e aleatória (ex: gere em <https://generate-secret.vercel.app/32>) |

## 6. Redeploy

Depois de conectar o banco, o Blob e adicionar as variáveis, vá em
**Deployments** → nos três pontinhos do último deploy → **Redeploy**.
A partir daqui o site já sobe funcionando, com 4 carros de exemplo no
estoque (pode editar ou apagar tudo pelo painel).

---

## Usando o painel administrativo

Acesse `seusite.vercel.app/admin`, entre com a senha que você definiu em
`ADMIN_PASSWORD` e você terá três abas:

- **Estoque** — adicionar/editar/excluir carros, com upload de foto.
- **Logo & loja** — subir a logo da loja (fica salva pra sempre, aparece
  no cabeçalho pra todo mundo) e o nome exibido caso não haja logo.
- **Contatos** — telefone, WhatsApp, e-mail, endereço, horário, Instagram e
  Facebook, que aparecem na seção de contato da página inicial.

Para trocar a senha do admin mais tarde, é só atualizar a variável
`ADMIN_PASSWORD` em **Settings → Environment Variables** na Vercel e fazer
um redeploy.

## Rodando localmente (opcional)

```bash
npm install
cp .env.example .env.local
# preencha DATABASE_URL/POSTGRES_URL e BLOB_READ_WRITE_TOKEN com os valores
# que aparecem em Storage > (seu banco/blob) > .env.local na Vercel
npm run dev
```

## Observações técnicas

- Sem banco conectado, a página inicial responde com erro (esperado — ela
  depende do banco). O painel `/admin` carrega normalmente mesmo sem banco,
  mas as chamadas de API vão falhar até você conectar o Postgres.
- Rodei `npm audit` no projeto: sobraram 2 avisos ligados à versão do
  Next.js (RCE na otimização de imagem AVIF, que não é usada aqui — o site
  usa `<img>` simples, não `next/image`) e a uma dependência interna
  (PostCSS) usada só durante o build. Antes de operar com dados reais de
  clientes, vale rodar `npm audit` de novo e atualizar as dependências.

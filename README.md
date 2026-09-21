# Cartas do Clash Royale — Frontend

Frontend simples em HTML, CSS e JavaScript puro (sem framework) para
consumir a API de cartas (CRUD).

## Rodar localmente

Basta abrir `index.html` no navegador (ou usar uma extensão tipo
"Live Server"), com o backend rodando em `http://localhost:3000`.

## Antes do deploy

No arquivo `app.js`, troque a constante `API_URL` pela URL pública do seu
backend já publicado no Render, por exemplo:

```js
const API_URL = "https://seu-backend.onrender.com/cartas";
```

## Deploy no Netlify

1. Suba esta pasta (`front`) para um repositório no GitHub.
2. No Netlify: "Add new site" → "Import an existing project" → selecione o
   repositório.
3. Build command: (deixe em branco) — Publish directory: `.`
4. Deploy. Depois de publicado, teste o CRUD completo (criar, listar,
   editar e excluir uma carta) na aplicação já em nuvem.

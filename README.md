# Premium Gás - App

Frontend do sistema **Premium Gás** (revenda de Gás GLP e Água com vasilhame retornável).

## Stack

- React + TypeScript
- Vite (dev server na porta 5173, proxy `/api` → `localhost:8080`)
- Oxlint + build otimizado

## Como rodar localmente

```bash
npm install
npm run dev
```

Abra **http://localhost:5173**. Requer a API rodando (veja o README de
`gerenciador_estoque_api` ou o JAR pronto no repo `gerenciador_estoque_jar`).

## Telas

- **Dashboard** - faturamento do dia, formas de pagamento e alertas de estoque baixo
- **Vendas** - lançamento de venda (dinheiro, Pix, fiado), venda com vasilhame novo
- **Estoque** - pátio em tempo real (cheios, vazios, em rua) com **limite mínimo editável**
- **Clientes** - cadastro com telefone (máscara automática) e comodato de vasilhames
- **Fornecedores** - cadastro de fornecedores
- **Carregamento** - chegada de caminhão (entrada de cheios)
- **Produtos** - cadastro de carga + vasilhame (ao selecionar **Gas** o vasilhame
  **P13** é preenchido automaticamente; **Agua** → **Galão 20L**)
- **Relatórios** - vendas em CSV e PDF

## Comandos úteis

```bash
npm run lint   # oxlint
npm run build  # gera dist/ (usado no deploy Vercel)
```

## Deploy

- **Vercel** com `vercel.json`: build de `dist/` e rewrite de `/api/*` para a API no Render
  (o deployment atual está **protegido** - exige login).
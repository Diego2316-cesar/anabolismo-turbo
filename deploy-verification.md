# Verificação do deployment — 2026-08-28

- A variável `SUPABASE_SERVICE_ROLE_KEY` foi atualizada na Vercel e o formulário confirmou `Updated Environment Variable successfully`.
- A nova chave usada começa com `sb_secret_` e foi salva em `Production`.
- O redeploy `9M332vbXsZJSrcM6hvYYBkjVkhb8` foi criado e ficou **Ready**, com o commit `b47d262`.
- O domínio público `https://anabolismo-turbo-blush.vercel.app/` abre com o título `Catálogo Medicamentos`, mas ainda mostra `0 produtos` e informa que as categorias aparecerão após o primeiro cadastro.
- A home pública não registrou saída no console do navegador durante a verificação.
- Próximo passo: investigar a resposta da chamada tRPC/runtime logs para separar erro de leitura Supabase de problema de procedimento ou dados.


## Nova verificação

- A Vercel criou o deployment `dpl_8fwPxWuyUv1JknkubXMx1NxoZY6T` a partir do commit `22a9b0bab41657525fde24a31584eba66252c9ce` (`fix: resolve serverless esm imports on vercel`) e marcou-o como **READY**.
- A URL única `https://anabolismo-turbo-77yafmlqy-diego2316-cesars-projects.vercel.app/` abre a aplicação, mas o conteúdo extraído ainda mostra `0 produtos`.
- O endpoint público `/api/trpc/catalog.list` no deployment anterior retornou 500 por `ERR_MODULE_NOT_FOUND` para `server/_core/oauth`; os imports `.js` foram enviados no novo deployment, mas o endpoint corrigido ainda precisa ser testado diretamente.

# Verificação do deployment — 2026-08-28

- A variável `SUPABASE_SERVICE_ROLE_KEY` foi atualizada na Vercel e o formulário confirmou `Updated Environment Variable successfully`.
- A nova chave usada começa com `sb_secret_` e foi salva em `Production`.
- O redeploy `9M332vbXsZJSrcM6hvYYBkjVkhb8` foi criado e ficou **Ready**, com o commit `b47d262`.
- O domínio público `https://anabolismo-turbo-blush.vercel.app/` abre com o título `Catálogo Medicamentos`, mas ainda mostra `0 produtos` e informa que as categorias aparecerão após o primeiro cadastro.
- A home pública não registrou saída no console do navegador durante a verificação.
- Próximo passo: investigar a resposta da chamada tRPC/runtime logs para separar erro de leitura Supabase de problema de procedimento ou dados.

# Catálogo Medicamentos

Aplicação web do catálogo **Anabolismo Turbo**, com estrutura inspirada em catálogos digitais: busca, categorias, ordenação, visualização em grade ou lista, cards com foto e preço e contato rápido pelo WhatsApp.

## Rotas

- `/` — catálogo público.
- `/admin` — visão geral do painel administrativo.
- `/admin/produtos` — cadastro, edição, upload, publicação/ocultação e exclusão de produtos.
- `/admin/categorias` — criação e organização das categorias.

## Dados e segurança

As tabelas `catalog_categories` e `catalog_products` ficam no Supabase. A leitura pública usa RLS para exibir somente categorias e produtos ativos. As operações administrativas passam por procedimentos protegidos por autenticação e utilizam `SUPABASE_SERVICE_ROLE_KEY` somente no backend. Nenhuma chave administrativa deve ser adicionada ao frontend ou ao Git.

O armazenamento de fotos usa o storage seguro do projeto. O banco registra somente a URL da imagem, o nome, o preço, a categoria e o estado de publicação.

## Configuração

Configure `SUPABASE_URL` e `SUPABASE_SERVICE_ROLE_KEY` nas Secrets do projeto. A URL possui fallback apenas para o projeto Supabase conectado; a chave de serviço precisa permanecer como segredo. Depois, reinicie o servidor ou publique uma nova versão para carregar as alterações.

## Desenvolvimento

```bash
pnpm dev
pnpm check
pnpm test
pnpm build
```

O projeto não inclui produtos fictícios. O catálogo inicia vazio e deve ser preenchido pelo painel administrativo após a configuração das credenciais.

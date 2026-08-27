# Referência visual — catálogo

Fonte analisada: https://medical-brasil.catalog.kyte.site/

A estrutura observada tem um cabeçalho branco com campo de busca à esquerda e nome da loja centralizado. A área principal usa uma coluna lateral com o título Categories e uma lista extensa de marcas/categorias, seguida por controles Sort by e Layout. No conteúdo, o título da categoria aparece no topo e os produtos são exibidos em uma lista vertical ampla, com imagem do produto, nome, marca e preço. A navegação também apresenta modos Instaview e List, além de ordenação por categorias, menor preço, maior preço, A-Z e Z-A.

Para o novo catálogo, a estrutura será preservada, mas a identidade visual será adaptada ao logotipo enviado, com preto, dourado e prata. O catálogo inicialmente não terá produtos fictícios: será exibida uma mensagem de catálogo vazio até o usuário cadastrar os produtos pelo painel. O contato flutuante será WhatsApp +55 19 99469-9667.

## Verificação visual local

A primeira captura local confirmou a estrutura desejada: busca no cabeçalho, logo central, botão de painel, barra lateral de categorias/ordenação, controles de grade/lista, área principal de produtos e botão flutuante verde do WhatsApp. A paleta preto, dourado e branco está legível e o logotipo foi carregado pelo armazenamento do projeto. A captura ocorreu enquanto a consulta inicial ainda estava em carregamento; será feita nova validação após a resposta estabilizar.

## Validação visual final

A loja pública renderizou corretamente sem produtos: a interface mantém a composição da referência, com estado vazio claro, busca, filtros, controles de layout e WhatsApp flutuante. O painel renderizou com sidebar escura, navegação Visão geral/Produtos/Categorias, identidade do catálogo e CTA para iniciar o cadastro. O estado de produtos vazios é intencional e não usa dados fictícios.

## Supabase configurado

Após a configuração da credencial administrativa, a loja carregou o estado vazio real do banco: nenhum produto foi inserido artificialmente. O layout público permanece íntegro e o contador exibe zero produtos. A página está pronta para receber os cadastros pelo painel.

## Painel conectado

A tela `/admin/produtos` carregou com a lista real vazia e exibiu formulário para nome interno, preço, categoria e foto. A tela `/admin/categorias` também carregou com formulário para criar categorias e lista vazia. O usuário autenticado foi reconhecido e o painel manteve a identidade visual escura com dourado.

## Validação responsiva

Em 390 px, a loja mantém busca, logotipo, menu de filtros, estado vazio e botão WhatsApp sem overflow. O painel mantém a navegação móvel, os campos do formulário e o CTA de cadastro em coluna única. A estrutura está pronta para receber as fotos reais posteriormente.

## Validação oficial das variáveis

Após configurar `SUPABASE_URL` e `SUPABASE_SERVICE_ROLE_KEY` como variáveis do projeto, a loja pública e o painel administrativo carregaram o estado real vazio do Supabase sem erro de configuração. O teste de conexão da chave administrativa passou, e a tela administrativa permanece pronta para cadastro.

## Painel administrativo e segurança

A validação visual confirmou que o painel carrega com a identidade Catálogo Medicamentos, navegação separada para Produtos, Categorias e Segurança, logotipo transparente e formulário de troca de senha. O painel usa sessão administrativa própria quando autenticado; o catálogo público permanece separado na rota `/`.

## Diagnóstico do domínio Vercel

Acessando `https://anabolismo-turbo-blush.vercel.app/`, a resposta pública exibiu texto iniciado por `// server/_core/index.ts`, ou seja, o bundle do servidor foi servido como conteúdo da página em vez do frontend. Isso indica configuração incorreta de build/saída na Vercel. A correção adiciona `vercel.json` com saída `dist/public`, rewrites de SPA e função `api/index.ts` para o Express.

## Diagnóstico após publicação

Em 27/08/2026, o domínio `anabolismo-turbo-blush.vercel.app` continuou retornando `content-type: application/javascript` e conteúdo iniciado por `server/_core/index.ts`. A integração Vercel da tarefa reportou a equipe Hobby `diego2316-cesars-projects` sem projetos Git vinculados e `list_projects` retornou zero projetos; consultar esse hostname retornou `Deployment not found`. Portanto, o domínio informado está em outra conta/equipe/projeto Vercel, ou não está vinculado à conta atualmente conectada, e publicar o checkpoint no projeto Manus não atualiza esse hostname.

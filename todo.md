# Project TODO

- [x] Catálogo público com estrutura visual inspirada no site de referência
- [x] Identidade visual Catálogo Medicamentos / Anabolismo Turbo
- [x] Aplicar logotipo fornecido no cabeçalho e favicon quando apropriado
- [x] Grade responsiva de produtos exibindo apenas foto e preço
- [x] Busca, categorias e ordenação no catálogo
- [x] Botão flutuante do WhatsApp para +55 19 99469-9667
- [x] Banco de produtos no Supabase
- [x] Categorias de produtos no Supabase
- [x] Armazenamento de imagens dos produtos
- [x] Autenticação protegida para o painel administrativo
- [x] Painel administrativo para adicionar, editar, ocultar e excluir produtos
- [x] Upload e troca de fotos no painel administrativo
- [x] Validações de preço, nome, categoria e imagem
- [x] Testes Vitest para regras e procedimentos do catálogo
- [x] Validação visual responsiva do catálogo e do painel
- [x] Commit e push da primeira versão para o Git
- [ ] Configuração e validação da publicação na Vercel

## Histórico de limpeza

- Código anterior removido do repositório original.
- Repositório renomeado para catalogo-medicamentos.
- Projeto Vercel anterior pausado.
- Supabase autorizado para criação do zero nesta etapa.
- [x] Avaliar variáveis VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY; a aplicação usa proxy server-side e não expõe essas chaves no frontend
- [x] Substituir o README mínimo pela aplicação inicial do catálogo
- [x] Configurar SUPABASE_URL via projeto Supabase conectado e SUPABASE_SERVICE_ROLE_KEY como Secret; SUPABASE_ANON_KEY não é necessária porque o acesso público usa o proxy server-side
- [x] Configurar as variáveis do Supabase para habilitar dados reais e operações do painel
- [x] Validar o sistema funcionando com catálogo e painel conectados
- [ ] Entregar o link público da Vercel ou deixar a publicação pronta para a ação final na conta
- [x] Adicionar a credencial administrativa do Supabase no ambiente seguro para habilitar gravação pelo painel
- [x] Separar o painel administrativo em rota própria `/admin`; subdomínio Vercel permanece dependente da publicação
- [x] Configurar autenticação administrativa com login e senha próprios
- [ ] Configurar domínio/subdomínio Vercel sem identificador pessoal, após a publicação
- [x] Disponibilizar logotipo com fundo transparente e aplicar na interface
- [x] Revisar a estrutura pública contra a referência enviada
- [x] Remover “Diego Cesar” e variações da identidade pública, metadados e documentação exibida
- [x] Consolidar “Catálogo Medicamentos” como nome exibido
- [x] Remover “Diego Cesar” e variações da identidade pública, metadados e documentação exibida
- [x] Consolidar “Catálogo Medicamentos” como nome exibido
- [x] Adicionar opção de alterar a senha do ADM dentro do painel
- [ ] Preparar publicação Vercel gratuita e confirmar implantação real antes de entregar o link
- [ ] Alinhar o nome do repositório Git para anabolismo-turbo e usar esse slug na Vercel
- [ ] Investigar e corrigir domínio Vercel implantado sem conteúdo visível
- [ ] Confirmar build, variáveis e status da implantação pública após a correção

- [ ] Diagnosticar publicação concluída sem atualização no domínio Vercel informado pelo usuário

- [x] Ativar o logotipo Anabolismo Turbo com fundo visível no catálogo e no painel

- [x] Remover o botão visível do painel administrativo da página inicial, mantendo a rota `/admin` protegida

- [x] Usar as imagens do ZIP somente como referência e deixar as imagens finais sem preço sobreposto

- [x] Corrigir entrada do painel para exigir a sessão própria do ADM, mesmo quando houver sessão de usuário Manus

- [x] Importar 27 produtos com preços conferidos do PDF e categorias no Supabase
- [x] Armazenar 28 imagens finais do catálogo em URLs permanentes
- [x] Substituir os cinco assets de referência por recortes finais sem preço sobreposto
- [x] Validar a API pública local retornando os produtos e preços cadastrados

- [ ] Configurar as variáveis SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, JWT_SECRET, ADMIN_USERNAME e ADMIN_PASSWORD no projeto Vercel correto e redeployar
- [ ] Validar catálogo e login ADM no domínio Vercel após o redeploy

- [x] Corrigir erro de build TypeScript em `server/_core/storageProxy.ts`: `Property 'get' does not exist on type 'Express'` observado no deployment da Vercel.
- [ ] Redeployar após a correção e validar catálogo público e login administrativo em produção.

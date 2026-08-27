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

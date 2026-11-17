# Painel da Siqueira

## Uso diário

Acesse https://siqueiraminiaturas.vercel.app/admin/ e entre com a conta pessoal `viniciusadrian1` no GitHub. O painel próprio substitui o Decap, mantendo o mesmo aplicativo de login, repositório e catálogo. O token fica somente na memória da aba; ao recarregar ou encerrar a sessão, entre novamente.

- **Produtos:** veja fotos, preços e visibilidade. Busque uma peça ou filtre as ocultas.
- **Adicionar produto:** escolha foto, nome e categoria. Preço, detalhes, descrição e selo são opcionais. O código é gerado automaticamente.
- **Mostrar no site:** desative para guardar a peça sem exibi-la. Categorias ocultas também ocultam seus produtos.
- **Salvar produto:** grava foto e catálogo juntos. O aviso diferencia “salvo” de “já está no site”, após a atualização da Vercel.
- **Categorias:** área separada para criar, renomear e ocultar. Renomear preserva a associação com os produtos.
- Fotos aceitas: JPG, PNG e WebP, até 5 MB. A prévia aparece antes de salvar.

## Arquitetura

`content/catalog.json` guarda o catálogo; `assets/uploads` recebe fotos. A interface em `admin/` usa módulos JavaScript e CSS próprios, sem dependências externas de CMS. O GitHub App instalado somente no repositório `viniciusadrian1/SiqueiraMiniaturas` permite Contents write e Metadata read. Nenhum projeto empresarial ou Supabase é utilizado.

`api/auth.js` e `api/callback.js` preservam PKCE, validação de estado, conta administradora e permissão de escrita. O popup entrega o token apenas à mesma origem e janela que iniciou o login. As variáveis `SITE_ORIGIN`, `CMS_REPO`, `CMS_ADMIN_LOGIN`, `GITHUB_CLIENT_ID` e `GITHUB_CLIENT_SECRET` continuam na Vercel pessoal.

`admin/store.js` lê o catálogo em um commit específico. Antes de salvar, compara seu SHA com a versão atual. Se outra aba alterou o catálogo, bloqueia a gravação. Usa a árvore atual como base, cria um único commit com imagem e catálogo e atualiza a referência com `force:false`. Uma alteração concorrente nunca causa sobrescrita forçada. Falhas mantêm o formulário preenchido.

O build filtra produtos e categorias ocultos. O repositório é público por decisão do proprietário: ocultar no mostruário não torna o conteúdo privado no GitHub.

## Desenvolvimento e verificação

`npm run check`, `npm test` e `npm run build`. `npm start` abre http://127.0.0.1:4173. Para verificar a interface sem gravar remotamente, use `/admin/?preview` apenas em localhost. Esse modo trabalha em memória e mostra um aviso permanente.

Testes cobrem autenticação, publicação conjunta de foto e catálogo, preservação da árvore de arquivos, conflitos entre edições, categorias e conteúdo oculto. A prévia visual cobre a edição de produto e criação de categoria. O usuário confirmou login e cadastro no painel anterior; a nova interface precisa de confirmação do primeiro salvamento real após a publicação.

## Mobile

A capa usa uma cena vertical de altura de tela, com enquadramento do carro, gradientes de contraste e textos sobre a imagem. A sequência continua ligada à rolagem. Desktop mantém sua composição. Reduced motion mantém a imagem estática.

## Páginas de produto e importação

Cada produto visível ganha uma página em `/produto/ID/`, gerada no build com foto, etiqueta, descrição, preço e disponibilidade. Foto e título no catálogo abrem essa página; não há pop-up. Produtos ocultos e categorias ocultas não geram páginas. Os links podem ser compartilhados diretamente.

No editor, **Etiqueta de destaque** está sempre visível. **Disponibilidade** oferece consultar, pronta entrega, a caminho ou sob encomenda. Para importados, escolher prazo de 1 a 365 dias, data prevista válida ou ainda sem previsão. A observação é opcional. Produtos antigos continuam sob consulta.

A caminho exibe **Quero reservar**, que abre o WhatsApp com o nome e link da peça. Isso registra interesse no atendimento, sem confirmar uma reserva automaticamente. O prazo em dias é uma estimativa informada, não uma contagem regressiva. Datas vencidas são apresentadas como previsão em atualização quando a página é gerada novamente. Atualizar a previsão e salvar quando necessário.

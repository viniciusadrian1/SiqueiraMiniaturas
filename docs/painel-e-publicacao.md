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

## Galeria de fotos

Adicionar até 10 fotos JPG, PNG ou WebP por produto, com até 5 MB cada. A seleção aceita múltiplos arquivos e novas seleções acrescentam fotos. “Usar como capa” coloca a foto primeiro; “Remover” retira a imagem da galeria sem apagar o arquivo histórico do repositório. Todas as fotos novas e o cadastro são publicados no mesmo commit. O campo `image` guarda a capa, e `images` guarda a sequência completa. Cadastros antigos continuam funcionando sem alteração.

A página permite deslizar horizontalmente pelo celular, usar miniaturas, setas ou as teclas esquerda/direita com a galeria focada. O indicador acompanha a foto selecionada.

### Ordem das fotos

Arraste pela alça “Arrastar” para mover uma foto até outra posição. Funciona com mouse e toque; ao chegar perto da borda da tela, a página rola durante o arraste. A primeira foto vira a capa. Pelo teclado, focar a alça e usar as setas. A ordem só é publicada ao salvar o produto. Cancelar o arraste não altera a sequência.

### Ordem dos produtos no mostruário

Na lista completa de Produtos, arrastar pela alça “Arrastar produto” até a posição desejada. A ordem é salva automaticamente no catálogo e refletida no site após o deploy. Busca ou filtro ativo bloqueiam o arraste para evitar mover itens em uma lista incompleta. Produtos ocultos preservam sua posição na sequência; o site apenas os exclui da exibição. O mesmo controle aceita mouse, toque e setas do teclado. Se a gravação falhar ou houver conflito com outra janela, a ordem anterior é preservada e o painel informa o erro.

### Ordem das categorias

Em Categorias, arrastar pela alça para escolher a sequência dos filtros. A ordem é salva automaticamente e aparece após o deploy. Limpar a busca antes de reorganizar. “Todas as peças” permanece primeiro; categorias ocultas não aparecem nos filtros, preservando suas posições no cadastro. O mesmo controle aceita toque, mouse e teclado.

### Excluir produtos e categorias

O botão “Excluir” abre uma confirmação com o nome do item e a ação “Cancelar” focada inicialmente. Somente “Sim, excluir” grava a remoção. Categorias com produtos vinculados, inclusive ocultos, ficam bloqueadas até os produtos serem movidos ou excluídos. A gravação mantém a proteção contra alterações simultâneas; se falhar, o item permanece e a confirmação mostra o erro. A exclusão retira o cadastro e a página gerada na próxima publicação; arquivos de fotos e histórico Git permanecem preservados.

### Lixeira e recuperação

As novas exclusões enviam os cadastros para `trash` no catálogo, guardando nome, campos completos, fotos, posição e data da exclusão. “Lixeira” no menu permite buscar e restaurar. A recuperação preserva o código, a visibilidade anterior e a posição, dentro do limite da lista atual. Se a categoria original também estiver na lixeira, restaurar o produto recupera essa categoria junto. Conflitos de código bloqueiam a operação sem perder o item. Categorias com produtos ativos continuam protegidas contra exclusão.

O catálogo público e as páginas não incluem o conteúdo da lixeira. O repositório continua público por escolha do proprietário. Os itens não expiram automaticamente. A exclusão permanente pelo painel está descrita abaixo. Exclusões realizadas antes da introdução da lixeira não entram automaticamente nela e continuam disponíveis apenas no histórico Git.


### Exclusão definitiva e esvaziamento

Na lixeira, “Excluir definitivamente” remove o cadastro selecionado após confirmação com seu nome. “Esvaziar lixeira” remove todos os itens, mesmo com busca ativa, após confirmação mostrando a quantidade total. Cancelar fica focado inicialmente. Categorias necessárias para restaurar produtos ainda na lixeira não podem ser apagadas individualmente; restaurar a categoria ou apagar esses produtos primeiro. Esvaziar remove todos juntos. Produtos e categorias ativos permanecem intactos. A gravação mantém proteção contra conflitos e preserva os itens em caso de falha.

Essas ações impedem recuperação pela lixeira do painel. Não apagam histórico Git nem arquivos de fotos, que podem ser compartilhados com outros cadastros.


### Compra pelo Mercado Livre

O editor do produto tem o campo opcional “Link do anúncio no Mercado Livre”. Cole o endereço HTTPS completo em mercadolivre.com.br (incluindo subdomínios de anúncios). Salvar publica o botão “Comprar no Mercado Livre” na página e no card da peça, mantendo o WhatsApp. Deixar vazio remove essa opção. O botão abre em nova aba; os valores, prazos e condições seguem o anúncio externo. Nenhum anúncio ou pagamento é criado pelo painel.


### Busca, disponibilidade, relacionados e estampas

O cadastro possui Piloto, Equipe e Escala opcionais. O catálogo busca nesses campos e também em nome, descrição e detalhes antigos, ignorando acentos e aceitando 1/43 ou 1:43. “Refinar busca” oferece seletores combináveis; os atalhos Todas, Pronta entrega e A caminho permitem acesso direto. Limpar filtros reinicia todos os seletores. Produtos sem disponibilidade cadastrada continuam sob consulta.

As páginas sugerem até três produtos publicados, priorizando piloto, equipe, categoria e escala em comum. A lista pública é filtrada antes da seleção, excluindo produtos e categorias ocultos. Empates seguem a ordem manual do catálogo.

Para cadastrar uma estampa, adicionar um produto com foto/arte, nome e categoria e marcar “Mostrar na galeria de estampas”. Publicar normalmente. A seção Estampas mostra somente os itens publicados e inclui contato de personalização pelo WhatsApp. Sem artes cadastradas, aparece um convite para conversar, sem imagens fictícias. O conteúdo continua no mesmo catálogo, com fotos, edição, ordenação e lixeira existentes.

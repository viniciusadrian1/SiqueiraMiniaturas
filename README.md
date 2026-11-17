# Siqueira Miniaturas

Mostruário responsivo de automobilismo com atendimento pelo WhatsApp **(11) 98795-1099**. Sem carrinho, checkout ou gateway. Painel Decap CMS com catálogo em arquivos e login GitHub preparado; sem Supabase.

## Abrir localmente

Com Node.js instalado, execute `npm run dev` e acesse `http://localhost:4173`. O servidor é de desenvolvimento e só aceita conexões locais. Se a execução isolada bloquear o navegador no Windows, inicie o comando pelo terminal normal do projeto.

Verificação de sintaxe: `npm run check`.

## Atualização do mostruário

- `catalog.js`: nome e WhatsApp. `content/catalog.json`: produtos, categorias e fotos editáveis pelo painel.
- `index.html`: conteúdo institucional e navegação. O telefone também aparece no rodapé e nos links de fallback sem JavaScript.
- `motion.css`: estilos e adaptação a telas pequenas.
- `assets/`: imagens locais; não dependem de serviços externos. As fontes Archivo, Barlow Condensed e IBM Plex Mono vêm do Google Fonts, com fontes alternativas locais.
- `branding/`: trabalho independente da conversa de criação do logo. A identidade aprovada está em `branding/final/`. Os SVGs e ícones utilizados no site foram copiados para `assets/brand/`. A escrita da segunda versão está guardada em `branding/site-wordmark-reference/`.

**O catálogo é demonstrativo.** As quatro miniaturas são imagens geradas para apresentação visual, e roupas/presentes são conceitos em SVG. Nomes, opções de produtos, fotos, valores, escalas, disponibilidade e prazos reais precisam ser fornecidos antes de divulgar o site. As etiquetas e mensagens do site explicitam esse caráter ilustrativo. Nenhum preço ou estoque foi inventado.

Para uma foto individual real, configure `image` com o caminho local e remova `imagePosition`. Para os modelos demonstrativos, `imagePosition` seleciona um dos quatro quadrantes de `assets/collection.png`.

Cada botão de interesse abre `wa.me` com o telefone e uma mensagem sobre a peça. Nenhuma mensagem é enviada automaticamente; o visitante confirma o envio no WhatsApp.

## Publicação

Execute `npm ci` e `npm run build`. A pasta `dist/` contém o site público e o painel. A configuração `vercel.json` prepara o build e as funções de login. O painel ainda precisa de repositório próprio, domínio e OAuth. Veja [painel e publicação](docs/painel-e-publicacao.md). Não houve publicação externa.

## Verificação realizada

- JavaScript e servidor passaram pela verificação de sintaxe.
- No navegador: filtros de roupas e personalizados, busca por texto, busca sem resultados, limpeza de filtros, expansão de 4 para 8 peças e retorno a 4.
- Detalhes das peças abrem como diálogo; fechamento por Escape e botão. Links conferidos com o número real e o produto no texto, sem envio de mensagens.
- Layout inspecionado em desktop e celular de 390 px, sem transbordamento horizontal. Nenhum erro de console observado durante os testes.

As imagens de apresentação foram geradas com imagegen. A assinatura do cabeçalho e os conceitos de estampas não representam licenciamento de marcas/equipes.

## Animação da capa

`motion.js` transforma uma imagem recortada conforme a rolagem nativa, sem WebGL ou bloqueio de scroll. A seção fica estática quando a preferência de redução de movimento está ativada. A direção e as decisões estão registradas em `docs/direcao-movimento.md`.

## Corrida controlada pela rolagem — 17/11/2026

O vídeo fornecido `Race_car_driving_on_track_11d30db7.mp4` foi convertido em 192 quadros WebP, 1280×720, 24 fps (8 segundos), em `assets/race-sequence/`, aproximadamente 6 MB. O original em Downloads foi preservado. Não há reprodução automática ou áudio.

`motion.js` mapeia a posição da seção para o quadro 0–191, nos dois sentidos. Carrega até quatro quadros por vez, priorizando a posição atual. Armazena imagens comprimidas e fecha cada bitmap após desenhar no canvas. O primeiro quadro é o fallback estático; com redução de movimento, não inicia o carregamento da sequência e remove a duração extra da seção. Os textos e o acesso ao catálogo continuam disponíveis.

Para publicar, incluir toda a pasta `assets/race-sequence/`. Não é necessário publicar o MP4 original. A capa usa agora a corrida, substituindo o deslocamento da imagem recortada descrito na direção anterior.

## Refinamento da capa

`hero-refinement.css` organiza apenas o cabeçalho e a capa: Barlow Condensed nos títulos, textos de apoio em Archivo/IBM Plex Mono, chamada principal reunida à esquerda, ações sem setas e botões com raio de 6 px. Inclua esse CSS na publicação. O catálogo e as seções seguintes aguardam a próxima etapa.

A corrida conserva o tamanho e os 192 quadros originais. O controle tem amortecimento temporal de 65 ms e cache limitado a 12 bitmaps decodificados para reduzir trancos em mudanças de direção. Não foram inventados quadros intermediários nem alterado o vídeo. Ao parar o scroll, a cena converge rapidamente e repousa no quadro correspondente.

## Mostruário completo — direção da capa

`showcase.css` aplica a direção visual ao restante do site e deve ser publicado junto com os demais CSS. Logo completo centralizado (`assets/brand/logo-full.svg`), navegação Barlow Condensed semibold, botão WhatsApp com ícone e textos de apoio maiores. Catálogo em duas colunas no desktop e uma no celular, filtros e busca agrupados, detalhes e contato sem setas decorativas. Seções de paixão, personalizados e atendimento foram reconstruídas. A foto de personalizados, a corrida e o slogan final foram preservados. Produtos e imagens continuam demonstrativos.



## Revisão mobile e painel

`responsive.css` ajusta a composição para celulares e tablets, reduz o slogan e simplifica o contato. `/admin/` permite conhecer uma demonstração explicitamente sem persistência. O login e a publicação online aguardam a conta/repositório pessoal da Siqueira. Nenhum recurso dos projetos empresariais foi alterado. Leia `docs/painel-e-publicacao.md` para ativação e limites.

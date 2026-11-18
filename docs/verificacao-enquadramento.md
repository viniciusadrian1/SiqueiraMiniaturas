# Verificação do enquadramento — 18/11/2026

Comparação realizada no Chromium 157, em 1440 × 1000 e 390 × 844, usando o código real do painel e do site em servidor local. O catálogo de teste existiu somente em memória; os produtos publicados não foram alterados.

Foram executados 16 cenários: painel em modo de prévia, catálogo e página da peça, com fotos sem ajuste e com ajustes diferentes por contexto (capa: cover, zoom 1,65, posição 27%/68%; galeria: contain, zoom 1,4, posição 62%/33%).

As oito comparações painel/site passaram: mesma proporção (4:3 na capa e 1:1 na galeria), ajuste, zoom, posição e ausência de padding. O desvio de posição normalizado máximo foi inferior a 0,000001, decorrente da precisão de layout do navegador. Nenhum erro JavaScript foi observado nos cenários. A página da peça também foi inspecionada por captura de tela no tamanho de celular.

Correções realizadas:

- Fotos sem configuração passam a usar explicitamente o mesmo enquadramento padrão da prévia, sem herdar padding e proporção antigos da galeria.
- Fundo das áreas de foto unificado em `#eae9e3`, inclusive no painel, nas recomendações e na galeria de estampas.
- A capa no formulário usa o mesmo estilo padrão quando ainda não há ajustes salvos.

Os dados brutos da execução estão em `output/framing-browser-results.json` na máquina local. Testes automatizados: 33 aprovados; verificação sintática e build aprovados.

A visualização ampliada mantém a imagem original para permitir a inspeção completa dos detalhes.

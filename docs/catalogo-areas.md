# Catálogo por área

As páginas `/miniaturas/`, `/vestuario/` e `/personalizados/` exibem apenas os produtos de suas respectivas áreas. A inicial mantém a animação e apresenta os acessos às três páginas. `/roupas/` redireciona para `/vestuario/`.

No painel, o produto continua associado a uma categoria. A categoria define a **Área do site**. As categorias antigas continuam com os mesmos IDs; `roupas` aparece como **Vestuário**. Novas categorias, como Bonés ou Canecas, podem ser associadas à área correta.

O campo **Coleção** é opcional e sugere os nomes já usados. Digitar um novo nome cria uma nova opção de filtro quando o produto é publicado. As nove camisetas já cadastradas com The Eras Tour no nome receberam essa coleção, preservando fotos, enquadramentos, preços, ordem e disponibilidade. Não foram atribuídas equipes às camisetas que estavam sem essa informação.

Os filtros combinam busca, piloto, equipe, coleção e disponibilidade. Miniaturas também têm escala; categorias adicionais aparecem como filtro dentro da área. Opções vêm dos produtos públicos da própria página, sem expor categorias ocultas ou rascunhos. A URL conserva os filtros, permitindo recarregar ou compartilhar uma seleção. Limpar filtros nunca muda de área.

Validação em 18/11/2026: 37 testes automatizados aprovados, sintaxe e build aprovados. Navegador Chromium em desktop (1440 px) e celular (320 e 390 px). Verificados: navegação entre áreas, isolamento de produtos, combinação piloto/coleção, estado vazio, limpeza, abertura de URL filtrada, cadastro de coleção e cadastro de categoria com área. As alterações de teste do painel ocorreram apenas na prévia local, sem publicar cadastros de teste. Não foram observados erros JavaScript nesses fluxos.

# Páginas de catálogo e coleções

**Objetivo:** separar Miniaturas, Vestuário e Personalizados em URLs próprias, com filtros úteis e cadastro simples de coleção no painel.

**Arquitetura:** manter HTML estático, módulos JavaScript e geração de páginas no build existente. Categorias ganham o campo `section`; produtos ganham `collection`. Os três IDs antigos continuam válidos, incluindo `roupas`. Não adicionar serviços ou dependências.

**Decisões:** a inicial conserva a animação e apresenta entradas para as três áreas; cada catálogo mostra exclusivamente produtos da respectiva área, mesmo com parâmetros de URL. Filtros visíveis por piloto, equipe, coleção e disponibilidade; escala apenas em miniaturas. Categorias adicionais são vinculadas a uma área no painel. Coleções são texto com sugestões a partir do catálogo, sem outra tela de administração. Associar a coleção The Eras Tour às camisetas já cadastradas com esse nome.

- [x] Criar classificação de áreas, navegação compartilhada e testes de isolamento e filtragem por coleção.
- [x] Criar páginas estáticas e interface responsiva com busca, filtros combinados, estado na URL, limpeza e vazios claros.
- [x] Atualizar inicial e links das páginas de produto; incluir coleção e destino correto no breadcrumb.
- [x] Acrescentar coleção no editor e área no cadastro de categorias; preservar fotos, ordem, preços e disponibilidade existentes.
- [x] Gerar rotas no build e servidor local; verificar testes, build e fluxos no navegador em desktop e mobile.
- [ ] Publicar no repositório pessoal e conferir o domínio público, preservando cadastros concorrentes.

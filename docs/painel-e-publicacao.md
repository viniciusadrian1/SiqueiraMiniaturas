# Painel da Siqueira

## O que já está implementado

- `/admin/`: painel Decap CMS 3.17.3 em português, com ajustes para celular.
- Produtos: nome, descrição, foto, categoria, preço opcional, selo e visibilidade.
- Categorias: criar, ordenar e ocultar. Ocultar uma categoria oculta suas peças.
- Os dados ficam em `content/catalog.json`; fotos enviadas ficam em `assets/uploads`.
- O site lê esse catálogo. O build exclui peças e categorias ocultas da versão pública.
- Login GitHub com OAuth, estado aleatório, PKCE, cookie HttpOnly e verificação da conta administradora e da permissão no repositório.
- Sem Supabase, sem banco pago e sem checkout. Nenhum projeto empresarial foi alterado.

## Situação atual

O painel online **ainda não está conectado**. O repositório é `viniciusadrian1/SiqueiraMiniaturas`. O usuário o tornou público e autorizou usar o `gh` da máquina; a conta pessoal foi confirmada com acesso de administrador. O projeto usa a branch `main`. Ainda falta definir a hospedagem/domínio, instalar o GitHub App do painel e configurar suas credenciais. O botão de demonstração usa apenas a memória do navegador: não publica nem grava arquivos. As fotos atuais continuam ilustrativas.

## Conectar para produção

1. Usar o repositório `viniciusadrian1/SiqueiraMiniaturas`, atualmente público por escolha do proprietário. O login também suporta repositório privado. Instalar um GitHub App próprio apenas nesse repositório, usando “Only select repositories”. Permissões de repositório: **Contents: Read and write** e **Metadata: Read-only**. Nenhuma permissão de conta ou de organização. Não instalar nos projetos das empresas. A autorização usa permissões da instalação, sem os escopos amplos `repo` ou `public_repo`.
2. Subir os arquivos do projeto, sem `node_modules`, `.env`, `dist` ou backups desnecessários. O `.gitignore` já exclui segredos e arquivos gerados.
3. Confirmar `repo` e `branch` em `admin/settings.js`. Alterar `enabled` para `true` somente depois de configurar o login e a hospedagem.
4. Na hospedagem, configurar `npm run build` e pasta de saída `dist`. A Vercel tem `vercel.json` preparado e executa os endpoints em `api/`.
5. Registrar um GitHub App na conta pessoal (não uma OAuth App) com homepage igual à URL definitiva do site e callback `https://SEU-DOMINIO/api/callback`. Configurar as variáveis de ambiente diretamente na hospedagem, nunca no chat nem no frontend:
   - `SITE_ORIGIN`: origem HTTPS exata, sem barra final.
   - `CMS_REPO`: o mesmo `usuario/repositorio` de `admin/settings.js`.
   - `CMS_ADMIN_LOGIN`: usuário GitHub autorizado.
   - `GITHUB_CLIENT_ID` e `GITHUB_CLIENT_SECRET`: do GitHub App. Não é necessário gerar uma chave privada para este fluxo de login de usuário.
6. Manter a expiração dos tokens ativada. Este painel não faz renovação silenciosa: ao expirar, sair e entrar novamente pelo GitHub. Fazer novo deploy. Entrar em `/admin/`, autorizar o GitHub e testar uma peça inicialmente oculta. Publicar uma peça e conferir o novo deploy antes de divulgar.

A Vercel Hobby restringe uso a projetos pessoais não comerciais. Este mostruário tem finalidade comercial; usar um plano adequado ou outra hospedagem compatível. A estrutura está preparada para Vercel, mas não foi contratado plano nem criada publicação. Em outra hospedagem, o site estático é portátil; os dois endpoints OAuth precisam de adaptação para o runtime escolhido.

## Uso diário

Entrar em **Catálogo → Produtos e categorias**. Adicionar a categoria antes de escolher a categoria de uma nova peça. Enviar JPG, PNG ou WebP até 5 MB, preferencialmente em torno de 1600 px. Para foto real, limpar o campo de recorte demonstrativo. Usar um código único por peça e categoria. O preço é texto opcional; deixar vazio mantém consulta pelo WhatsApp.

Ativar **Mostrar no site** e publicar. A alteração gera um commit no GitHub e dispara o build da hospedagem; só aparece no site após esse build terminar. Para tirar uma peça da vitrine, desativar sua visibilidade. Antes de remover uma categoria, reassociar os produtos; o build bloqueia referências inválidas para preservar a última publicação válida.

Não é necessário editar código para cadastrar produtos e categorias. O histórico do GitHub permite recuperar versões anteriores do conteúdo.

## Verificação e limites

`npm ci`, `npm run build`, `npm run check` e `npm test` preparam e validam a estrutura. `npm start` abre a prévia local em http://127.0.0.1:4173/. O servidor local não executa o OAuth de produção.

Os testes de OAuth usam respostas simuladas e cobrem estado inválido, conta não autorizada e entrega restrita do token. Login, upload e publicação reais precisam ser validados depois de conectar a conta e hospedagem. Nenhuma credencial foi criada ou usada nesta etapa.

O pacote oficial do Decap traz alertas transitivos no npm audit, inclusive ReDoS em `trim` via os editores Markdown não utilizados nesta configuração. A versão está fixada; não executar `npm audit fix --force` automaticamente, pois sugere downgrade. O painel usa o bundle oficial pré-compilado: alterar dependências transitivas isoladas não corrige esse bundle. Reavaliar uma versão corrigida antes da ativação pública. O relatório está em `docs/dependency-audit.json`.

Referências: [Decap GitHub](https://decapcms.org/docs/github-backend/), [OAuth GitHub](https://docs.github.com/en/apps/oauth-apps/building-oauth-apps/authorizing-oauth-apps), [Vercel Hobby](https://vercel.com/docs/plans/hobby).

## Validação visual desta revisão

Site inspecionado em 320, 390 e 768 px: sem overflow horizontal; filtros, busca sem resultados e diálogo testados. A sequência do carro avançou ao rolar. Painel abriu em português, carregou 8 peças/3 categorias demonstrativas e abriu novo produto; largura fixa de 800 px corrigida para 390 px. Uma revisão posterior do editor travou a prévia do navegador, portanto sua validação mobile completa ainda está pendente.

### Acesso do Codex e acesso do painel

São conexões distintas. O acesso de desenvolvimento foi resolvido pelo `gh` autenticado localmente na conta pessoal `viniciusadrian1`. Para o dono administrar produtos depois, configurar o GitHub App do painel como descrito acima. Nunca tornar o repositório público para contornar um erro 404.

O fluxo de GitHub App foi ajustado e testado localmente, mas a compatibilidade de login/publicação real com o backend Decap ainda precisa de teste integrado após a instalação. [Documentação do fluxo GitHub App](https://docs.github.com/en/apps/creating-github-apps/authenticating-with-a-github-app/generating-a-user-access-token-for-a-github-app).

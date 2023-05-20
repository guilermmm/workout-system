# Create T3 App

This is a [T3 Stack](https://create.t3.gg/) project bootstrapped with `create-t3-app`.

## What's next? How do I make an app with this?

We try to keep this project as simple as possible, so you can start with just the scaffolding we set up for you, and add additional things later when they become necessary.

If you are not familiar with the different technologies used in this project, please refer to the respective docs. If you still are in the wind, please join our [Discord](https://t3.gg/discord) and ask for help.

- [Next.js](https://nextjs.org)
- [NextAuth.js](https://next-auth.js.org)
- [Prisma](https://prisma.io)
- [Tailwind CSS](https://tailwindcss.com)
- [tRPC](https://trpc.io)

## Learn More

To learn more about the [T3 Stack](https://create.t3.gg/), take a look at the following resources:

- [Documentation](https://create.t3.gg/)
- [Learn the T3 Stack](https://create.t3.gg/en/faq#what-learning-resources-are-currently-available) — Check out these awesome tutorials

You can check out the [create-t3-app GitHub repository](https://github.com/t3-oss/create-t3-app) — your feedback and contributions are welcome!

## How do I deploy this?

Follow our deployment guides for [Vercel](https://create.t3.gg/en/deployment/vercel), [Netlify](https://create.t3.gg/en/deployment/netlify) and [Docker](https://create.t3.gg/en/deployment/docker) for more information.

## BRAINSTORM

- [x] timer no treino ativo
- [x] quando concluir um treino, recomendar o próximo com base em ordem que o professor definiu
- [x] arrumar a tela de manage q ta quebrando
- [x] diminuir o tamanho do JS da pagina /manage/edit/\[id\] (remover cuid)
- [x] ficha pessoal do aluno
  - [x] tela index mostrando as ultimas medidas e os botoes pras funcoes abaixo
  - [x] atualizar medidas
  - [x] mostrar historico de medidas
  - [x] mostrar historico de treinos finalizados
- [x] admin criar os exercicios
- [x] dialog pra confirmar todos os delete

- [x] validacao de usuario
- [x] permitir que o professor faça o treino do aluno mesmo antes dele logar a primeira vez, e quando logar já tiver tudo bonitin
- [x] nao permitir q usuario q nao foi registrado pelo professor logar

- [x] botar dias da semana na tela de treinos do aluno
- [x] permitir apenas um timer ativo por vez

- [x] ajustar a lógica dos sets
- [x] permitir ao instrutor reorganizar a ordem dos exercícios de um treino
- [x] arrumar as categorias dos treinos
- [x] usuario contar as series

- [x] página de editar treino
- [x] fazer validação de form

- [x] max-width em todas as listas verticais pra melhorar o visual no desktop
- [x] embelezar histórico de treinos
- [x] embelezar páginas de perfil
  - [x] usuário
  - [x] admin
- [x] embelezar histórico de medidas
  - [x] usuário
  - [x] admin
- [x] tela de treino
  - [x] card collapse
  - [x] auto collapsar card quanto terminar todas as series
  - [x] não mostrar método quando normal
- [x] páginas de criar exercise
- [x] página de editar exercise
- [x] transitar entre /home e /profile tocando pela foto no header
- [x] botao de adicionar aluno no /dashboard
- [x] ajeitar os input number

- [x] alerta para confirmar cada mutation
- [ ] botar o carregamento nos botao q ta faltando
- [x] modal por cima de modal pra confirmar mutation em form de modal
- [x] modal pra cadastrar usuario

- [x] poder salvar as medidas sem preencher tudo
- [x] marcar os dois exercicios do bi-set ao msm tempo ou colocar só um check pros dois exercicios
- [ ] poder clicar no exercicio no calendario p saber quais foram completos e quais nao foram
- [ ] aluno colocar o peso no exercicio
- [ ] poder colocar uma imagem no cadastro do exercicio
- [x] poder adicionar mais emails como adm, manter o email superuser no .env, pq só ele que vai poder adicionar e remover novos adm

- [ ] pensar em opção para quem nao usa celular (conferir com ela a questao do pdf dps q fazer tudo)

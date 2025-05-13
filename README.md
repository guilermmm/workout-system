# Workout System

This is a [T3 Stack](https://create.t3.gg/) project bootstrapped with `create-t3-app`.

## Descrição

- Sistema de gerenciamento de treinos para professores e alunos, onde o professor pode criar treinos personalizados para seus alunos, acompanhar o progresso deles e fornecer feedback. Os alunos podem visualizar seus treinos, registrar seu progresso e se comunicar com o professor.

- O sistema é dividido em duas áreas principais: a área do professor e a área do aluno. Na área do professor, o instrutor pode criar treinos, gerenciar alunos e acompanhar o progresso deles. Na área do aluno, o aluno pode visualizar seus treinos, registrar seu progresso e se comunicar com o professor.

- O sistema é responsivo e pode ser acessado de qualquer dispositivo, incluindo smartphones e tablets. O design é moderno e intuitivo, facilitando a navegação e o uso do sistema.

## Stack

- [Next.js](https://nextjs.org)
- [NextAuth.js](https://next-auth.js.org)
- [Prisma](https://prisma.io)
- [Tailwind CSS](https://tailwindcss.com)
- [tRPC](https://trpc.io)

## Screenshots

### Área do aluno

Login             |  Página principal
:-------------------------:|:-------------------------:
![Login](/img/login.png)  |  ![Área do aluno](/img/treinos-aluno.png)

Treino ativo             |  Treino Finalizado
:-------------------------:|:-------------------------:
![Treino Ativo](/img/treino-aluno.png)  |  ![Treino Finalizado](/img/treino-finalizado.png)

Dashboard             |  Medidas
:-------------------------:|:-------------------------:
![Treino Ativo](/img/medidas-aluno.png)  |  ![Treino Finalizado](/img/medidas-professor.png)

Histórico de treinos            |  Medidas
:-------------------------:|:-------------------------:
![Treino Ativo](/img/historico-treino.png)  |  ![Treino Finalizado](/img/medidas-professor.png)

### Área do professor

Página do aluno           |  Edição do treino
:-------------------------:|:-------------------------:
![Treino Ativo](/img/aluno-professor.png)  |  ![Treino Finalizado](/img/treino-professor.png)

Alunos         |  Edição de exercícios
:-------------------------:|:-------------------------:
![Treino Ativo](/img/menu-professor.png)  |  ![Treino Finalizado](/img/exercicios-professor.png)

Edição de exercício         |  Histórico de treinos do aluno
:-------------------------:|:-------------------------:
![Treino Ativo](/img/exercicio-professor.png)  |  ![Treino Finalizado](/img/historico-treino-professor.png)

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
- [x] botar o carregamento nos botao q ta faltando
- [x] modal por cima de modal pra confirmar mutation em form de modal
- [x] modal pra cadastrar usuario

- [x] poder salvar as medidas sem preencher tudo
- [x] marcar os dois exercicios do bi-set ao msm tempo ou colocar só um check pros dois exercicios
- [x] poder clicar no exercicio no calendario p saber quais foram completos e quais nao foram
- [x] aluno colocar o peso no exercicio
- [x] poder colocar uma imagem no cadastro do exercicio
- [x] poder adicionar mais emails como adm, manter o email superuser no .env, pq só ele que vai poder adicionar e remover novos adm

- [x] pensar em opção para quem nao usa celular (conferir com ela a questao do pdf dps q fazer tudo)

- [x] pagina de perfil na view do user:
  - [x] se tiver credentialsId:
    - [x] botao p altera senha:
    - [x] senha atual
    - [x] senha nova
    - [x] confirma senha nova

confirmacao de senha so serve pro front validar se é igual, pro back so manda 1

- [x] modal nas pagina de perfil tao bugando

- [x] copiar os treino
- [x] foto do exercicio na pagina de cadastrar/editar treino
- [x] atualizar o componente modal p aceitar ReactNode
- [x] mensagem de finalizacao de treino bem hippie
- [x] pagina de autenticacao fudida

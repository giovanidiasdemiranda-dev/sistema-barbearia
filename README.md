# The Latin Barber's Club

Aplicação de agendamento para as unidades Costa e Silva e Mário Quintana. O navegador acessa os dados pela API do servidor. Depois de salvar a reserva, o site abre uma mensagem pronta no WhatsApp da unidade; o cliente toca em **Enviar**.

## Rodar no computador

1. Instale Node.js 20 ou superior e execute `npm install` nesta pasta.
2. Copie `.env.example` para `.env` e preencha as credenciais do Firebase Admin, `ADMIN_PASSWORD` e `APP_ORIGIN=http://localhost:5173`.
3. Execute `npm run dev` e abra `http://localhost:5173`.

O primeiro acesso ao painel é `/admin/login`, usando a senha inicial `ADMIN_PASSWORD`. Depois, entre em **Trocar Senha** no painel e defina uma senha exclusiva com pelo menos 12 caracteres. A nova senha é guardada como hash no Firestore e invalida as sessões anteriores.

## Colocar em produção

### Firebase

Crie um projeto Firebase com Firestore Native em modo produção. Gere uma credencial de conta de serviço e cadastre no ambiente do servidor:

- `FIREBASE_PROJECT_ID`
- `FIREBASE_CLIENT_EMAIL`
- `FIREBASE_PRIVATE_KEY` (mantenha as quebras de linha ou substitua-as por `\\n`)
- `ADMIN_PASSWORD` (senha inicial exclusiva, longa e aleatória)
- `APP_ORIGIN` (origem pública exata, como `https://agenda.exemplo.com`)

As variáveis nunca devem usar o prefixo `VITE_` e devem ser cadastradas apenas como segredos de servidor. Publique as regras restritivas com `firebase deploy --only firestore:rules` e depois implante a aplicação. Faça primeiro em um projeto Firebase separado se houver dados em produção: o formato de dados desta versão usa um documento de agendamentos transacionado.

### Mensagem de WhatsApp

Após salvar o agendamento, o navegador abre uma conversa com texto pronto para a unidade selecionada: Mário Quintana `+55 51 98226-6759`; Costa e Silva `+55 51 98138-0060`. O cliente precisa tocar em **Enviar** no WhatsApp. O site não verifica se a mensagem foi enviada ou entregue. Este fluxo não usa API do WhatsApp nem gera cobrança de mensagens pela Plataforma do WhatsApp Business.

## Como navegar

### Cliente

Na página inicial, escolha **Agendar Agora** ou a unidade desejada. Selecione barbeiro, serviço, data e horário, informe nome e celular e toque em **Confirmar e abrir WhatsApp**. Depois que a reserva for salva, toque em **Enviar** na conversa aberta. O link privado para consultar ou cancelar fica salvo em **Ver meus agendamentos** no mesmo navegador e também pode ser copiado na tela de confirmação. Não é necessário criar conta.

### Painel do barbeiro

Abra **Área do Barbeiro / Painel** no rodapé ou `/admin/login` e entre com sua senha.

- **Dia / Semana:** confira a agenda; marque atendimentos como concluídos ou atualize os estados disponíveis.
- **Financeiro:** consulte os totais calculados pelo preço salvo em cada agendamento.
- **Barbeiros / Serviços:** cadastre e edite itens ativos. Para preservar o histórico de agendamentos, registros já utilizados devem ser desativados em vez de excluídos.
- **Horários:** ajuste jornadas e bloqueios de horário.
- **Clientes / Avaliações:** consulte os dados no painel protegido e modere avaliações.
- **Trocar Senha:** exige a senha atual e uma nova senha com no mínimo 12 caracteres.

## Verificações

`npm run lint`, `npm run build` e `npm test` validam o código local. `tests/preview.mjs` fornece uma API temporária apenas em memória para conferir a interface; ela usa credenciais e dados exclusivos de teste, não envia mensagens e não deve ser publicada.

## Limites operacionais conhecidos

O armazenamento atual mantém os agendamentos em um único documento do Firestore para serializar a reserva de horários. Esse documento tem limite de tamanho do Firestore; uma operação com muitos agendamentos históricos exige uma migração para documentos individuais antes de atingir o limite. Faça backup e valide regras e variáveis antes de conectar dados reais.

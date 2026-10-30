# Nexus: Gestão do Cuidado

Refatoração do app Nexus (projeto ESAMC Uberlândia 2026), com duas funções novas:

- **Psicólogos**: agendamento de sessões conforme a agenda semanal e a disponibilidade do dia.
- **Eventos e ingressos**: catálogo de palestras online e presenciais, compra, QR Code, transmissão e check-in.

Mantém as telas originais: Início, Consultas, Medicações, Profissionais, Tarefas, Chat, Apoio Psicológico e Configurações (perfil, planos, notificações, privacidade).

## Stack

React 19, TypeScript, Vite e React Router (HashRouter). Sem backend: os dados ficam em `localStorage`
(chave `nexus:db`) a partir de um seed gerado com datas relativas a hoje. Pagamento (Pix e cartão) é simulado.

## Rodar

```bash
pnpm install
pnpm dev        # http://localhost:5173
pnpm test       # regras de agenda, ingressos e cartão
pnpm build      # saída estática em dist/
```

O `dist/` é estático e funciona em qualquer hospedagem (Netlify, Vercel, GitHub Pages), sem regra de rewrite.

## Estrutura

```
src/
  domain/types.ts      tipos e entidades
  services/            regras puras e testadas (agenda, ingressos, pagamento, planos, datas)
  data/                seed, store (localStorage + useSyncExternalStore) e actions (mutações)
  components/          Layout, Modal, formulários, Payment
  pages/               uma tela por rota
```

## Regras principais

| Tema | Regra |
|---|---|
| Sessão de psicologia | Só horários livres, com 1h de antecedência mínima e janela de 60 dias. Revalida ao confirmar (sem reserva dupla). Cancelar até 2h antes libera o horário. |
| Ingressos | Estoque por tipo, máx. 5 por pedido, nome por participante. Cancelar devolve a vaga. Gratuito não passa por pagamento. |
| Transmissão online | Liberada 15 min antes do início até o fim. |
| Check-in | `/checkin` valida o código uma única vez. |
| Planos | Basic: 5 medicações, 3 consultas, 10 msgs/dia, preço cheio. Plus: ilimitado, 20% em sessões, 10% em ingressos. Família: 30% e 20%. |

Para apagar tudo e voltar aos dados de exemplo: Configurações > Privacidade e Segurança.

## Acessibilidade (pensado em adultos)

- Texto grande por padrão, com 3 tamanhos (botão "Texto" no topo, ou Configurações > Aparência e leitura).
- Tema claro, escuro ou automático, e modo de alto contraste.
- Alvos de toque de pelo menos 48 px, rótulos em texto (sem botões só de ícone), foco visível e navegação por teclado.
- Datas em linguagem natural ("Hoje", "Amanhã"), telas de confirmação com resumo e "Adicionar ao calendário" (.ics).
- Respeita `prefers-reduced-motion`.

## Cenários prontos no mock

Os dados de exemplo cobrem os estados de borda, todos relativos ao momento em que o app abre:

| Situação | Onde ver |
|---|---|
| Sessão online acontecendo agora, com botão "Entrar na sessão" | Consultas |
| Sessão que começa em 1h30: link ainda fechado e cancelamento bloqueado (menos de 2h) | Consultas |
| Sessão realizada, sessão cancelada, e consulta médica nos 3 status | Consultas |
| Psicóloga de férias (próxima vaga só em 3 semanas) | Psicólogos |
| Psicólogo com agenda lotada por duas semanas | Psicólogos |
| Psicóloga só presencial (sem escolha de modalidade) | Psicólogos |
| Evento ao vivo com transmissão aberta | Eventos, Meus ingressos |
| Evento encerrado, ingresso utilizado e ingresso cancelado | Meus ingressos > Encerrados |
| Evento esgotado, evento com poucas vagas ("Restam 2"), gratuito e com 2 tipos de ingresso | Eventos |
| Remédio com estoque baixo e remédio com estoque zerado | Medicações |
| Limite do plano Basic (3 consultas, 5 medicações, 10 mensagens/dia) com atalho para os planos | Consultas, Medicações, Chat |

## Demonstração sugerida

1. Psicólogos > escolher um > data > horário > Pix > ver em Consultas.
2. Eventos > evento presencial > comprar 2 ingressos com cartão `4242 4242 4242 4242` > Meus ingressos (QR).
3. Copiar o código e validar em `/#/checkin`.
4. Configurações > trocar para Plus e ver os descontos.

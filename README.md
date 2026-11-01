# Nexus: Gestão do Cuidado

Refatoração do app Nexus (projeto ESAMC Uberlândia 2026): organiza o cuidado de uma pessoa idosa e cuida de quem cuida.

- **Hoje**: a agenda do dia reúne consultas, doses de remédio, sessões e eventos numa linha do tempo, com o que está acontecendo agora em destaque.
- **Cuidado**: consultas, remédios (com estoque), tarefas e a rede de apoio.
- **Apoio**: agendamento de sessões com os psicólogos da plataforma, chat de orientação e autocuidado (respiração guiada, sinais de sobrecarga, CVV).
- **Eventos**: palestras online e presenciais, compra de ingresso, QR Code, transmissão ao vivo e check-in.
- **Perfil**: dados, planos (Basic, Plus, Família), texto e tema, notificações, privacidade.

## Stack

React 19, TypeScript, Vite, React Router (HashRouter), `lucide-react` (ícones) e Figtree (fonte). Sem backend: os dados
ficam em `localStorage` (chave `nexus:db`) a partir de um seed gerado com datas relativas a hoje. Pagamento (Pix e cartão) é simulado.

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
  services/            regras puras e testadas (agenda do dia, sessões, ingressos, pagamento, planos, datas)
  data/                seed, store (localStorage + useSyncExternalStore), actions (mutações) e preferências
  components/          Layout (barra de abas e menu lateral), kit de UI, Payment, Appearance
  pages/               uma tela por rota; formulários em páginas próprias
DESIGN.md              o sistema visual ("Agenda viva")
PRODUCT.md             usuários, propósito e princípios do produto
```

## Navegação

Uma coisa principal por tela e o resto a um toque de distância. Cinco abas no celular (menu lateral no desktop): **Hoje**, **Cuidado**, **Apoio**, **Eventos** e **Perfil**. Cada aba tem
seções internas (por exemplo, Cuidado: Consultas, Remédios, Tarefas, Rede). Formulários abrem em tela cheia; a janela
sobreposta aparece só para confirmar uma exclusão e para pagar.

## Regras principais

| Tema | Regra |
|---|---|
| Sessão de psicologia | Só horários livres, com 1h de antecedência mínima e janela de 60 dias. Revalida ao confirmar (sem reserva dupla). Cancelar até 2h antes libera o horário. |
| Ingressos | Estoque por tipo, máx. 5 por pedido, nome por participante. Cancelar devolve a vaga. Gratuito não passa por pagamento. |
| Transmissão online | Liberada 15 min antes do início até o fim. |
| Remédios | Os horários cadastrados viram doses na agenda de Hoje; "Dei" registra a dose, e dose passada sem registro aparece como atrasada. |
| Check-in | A portaria é uma tela só da demonstração, fora do menu: abra `#/checkin` e digite o código do ingresso (ele valida uma única vez). |
| Planos | Basic: 5 remédios, 3 consultas, 10 msgs/dia, preço cheio. Plus: ilimitado, 20% em sessões, 10% em ingressos. Família: 30% e 20%. |

Para apagar tudo e voltar aos dados de exemplo: Perfil > Privacidade e dados.

## Acessibilidade (pensado em adultos)

- Tamanho do texto em 3 níveis (botão "Texto" no topo ou menu lateral, e em Perfil > Texto e tema).
- Tema claro, escuro ou automático, e modo de alto contraste.
- Alvos de toque de pelo menos 44 px, ícones sempre acompanhados de texto nos botões principais, foco visível e navegação por teclado.
- Estados que não dependem só de cor: formas distintas nos pontos da semana, rótulos nos pills e nos botões.
- Datas em linguagem natural ("Hoje", "Amanhã"), telas de confirmação com resumo e "Adicionar ao calendário" (.ics).
- Respeita `prefers-reduced-motion`; o conteúdo nunca depende de animação para aparecer.

## Cenários prontos no mock

Os dados de exemplo cobrem os estados de borda, todos relativos ao momento em que o app abre:

| Situação | Onde ver |
|---|---|
| Sessão online acontecendo agora e evento ao vivo, com botão "Entrar" | Hoje |
| Remédio atrasado, remédio já dado e estoque baixo ou zerado | Hoje, Cuidado > Remédios |
| Sessão que começa em 1h30: link fechado e cancelamento bloqueado (menos de 2h) | Cuidado > Consultas |
| Sessão realizada, sessão cancelada, e consulta médica nos 3 status | Cuidado > Consultas |
| Psicóloga de férias, psicólogo com agenda lotada, psicóloga só presencial | Apoio > Psicólogos |
| Evento encerrado, ingresso utilizado e ingresso cancelado | Eventos > Meus ingressos |
| Evento esgotado, com poucas vagas ("Restam 2"), gratuito e com 2 tipos de ingresso | Eventos > Programação |
| Limite do plano Basic (3 consultas, 5 remédios, 10 mensagens/dia) com atalho para os planos | Consultas, Remédios, Conversar |

## Demonstração sugerida

1. Hoje: marcar "Dei" no remédio atrasado e entrar na sessão ao vivo.
2. Apoio > Psicólogos > escolher um > dia > horário > Pix > confirmação com "Adicionar ao calendário".
3. Eventos > evento presencial > comprar 2 ingressos com cartão `4242 4242 4242 4242` > Meus ingressos (QR).
4. Portaria (fora do menu, só para a demonstração): abrir `#/checkin` e digitar o código que aparece abaixo do QR do ingresso.
5. Perfil > Plano: trocar para Plus e ver os descontos.

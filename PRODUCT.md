# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Cuidadores familiares adultos (em geral filhos, cônjuges ou parentes) que cuidam de uma pessoa idosa em casa, no Brasil. Usam o app no celular, no meio de uma rotina corrida, muitas vezes cansados e com pouca paciência para interface complicada. Também há a banca da faculdade (ESAMC Uberlândia, 2026) que vai ver o app numa apresentação, no celular e projetado no computador.

## Product Purpose

Nexus organiza o cuidado de um idoso e cuida de quem cuida. Reúne consultas médicas, remédios com controle de estoque, tarefas, rede de profissionais, chat de orientação e apoio psicológico. Duas funções novas: agendar sessões com os psicólogos da plataforma (conforme a agenda de cada dia) e comprar ingressos de palestras e eventos online ou presenciais. Sucesso é o cuidador resolver cada tarefa em poucos toques, sem se perder, e a banca enxergar um produto real, completo e profissional.

## Positioning

Um único lugar que junta a logística do cuidado do idoso com o cuidado emocional do cuidador (sessões com psicólogos, plantão de escuta e eventos de apoio), coisa que apps de lembrete de remédio não fazem.

## Operating Context

Projeto acadêmico demonstrado ao vivo. Sem backend: dados mockados no navegador (localStorage), pagamento simulado, publicado no GitHub Pages (https://diogofrr.github.io/nexus-gestao-do-cuidado/). Os dados de exemplo cobrem estados de borda (sessão ao vivo, agenda lotada, evento esgotado, estoque zerado, limites do plano).

## Capabilities and Constraints

- Stack existente: React 19, TypeScript, Vite, React Router (HashRouter). Sem dependências de UI hoje.
- Todas as funções atuais ficam: início, consultas, medicações, profissionais, tarefas, chat, plantão/apoio psicológico, configurações (perfil, planos Basic/Plus/Família, notificações, privacidade), psicólogos e agendamento, eventos, compra de ingresso, meus ingressos com QR Code, check-in, confirmações com .ics.
- Tudo em português do Brasil (interface, datas, valores em R$).
- Planos: Basic (limites), Plus (R$ 49/mês), Família (R$ 89/mês), com descontos em sessões e ingressos.
- Fluxos críticos devem ser curtos: agendar sessão e comprar ingresso.

## Brand Commitments

- Nome: Nexus, escrito NEXUS em caixa alta como wordmark.
- Cor da marca do app original: azul `#116EB0` (gradiente para `#2C93DD`), com apoio em verde-azulado `#0D9488` e âmbar `#D97706`. O usuário pediu para seguir a cor e o logo existentes.
- Wordmark original em serifada (Playfair Display, 700).

## Evidence on Hand

App original de referência: https://nexus-gestao-do-cuidado-5f2c4aad.base44.app. Não há logotipo em arquivo, fotos, depoimentos nem métricas. Nenhum dado real de usuários, psicólogos ou eventos: tudo é demonstração sintética e deve ser tratado como tal.

## Product Principles

1. Simples primeiro: uma tarefa por tela, o próximo passo sempre óbvio.
2. Acolher sem infantilizar: tom calmo e adulto, sem alarmismo nem gamificação.
3. O estado importa mais que o enfeite: o que está acontecendo agora (sessão ao vivo, remédio acabando) aparece antes de tudo.
4. Completo e verdadeiro: cada função existe e funciona; nada de tela de mentira.
5. Celular primeiro, desktop sem sobras.

## Accessibility & Inclusion

Público adulto, incluindo pessoas com visão cansada: texto legível por padrão, alvos de toque generosos, bom contraste, opção de aumentar o texto e de alto contraste, sem depender só de cor ou de ícone para comunicar estado.

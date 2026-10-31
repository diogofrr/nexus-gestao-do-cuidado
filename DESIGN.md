---
name: Nexus Gestão do Cuidado
description: Agenda semanal de papel para quem cuida de um idoso. Folha fria, tinta azul-marinho, caneta azul, e uma cor só para o agora.
colors:
  brand: "#116EB0"
  brand-hover: "#0D5F9B"
  brand-soft: "#E5F0F9"
  now: "#0A7A70"
  now-dot: "#14B8A6"
  now-soft: "#DCF4F0"
  desk: "#F1F4F9"
  sheet: "#FFFFFF"
  sheet-2: "#F7F9FC"
  ink: "#0E2036"
  ink-2: "#435468"
  ink-3: "#5D6E83"
  rule: "#E1E8F0"
  rule-strong: "#C9D5E3"
  amber: "#A85206"
  amber-soft: "#FDEFD8"
  danger: "#B42318"
  danger-soft: "#FDEAE7"
  violet: "#6A3FBD"
  violet-soft: "#EDE7FA"
  rose: "#B0306A"
  rose-soft: "#FAE6EF"
  slate: "#4F6076"
  slate-soft: "#E8EDF3"
typography:
  wordmark:
    fontFamily: "Playfair Display, Georgia, serif"
    fontSize: "1.3rem"
    fontWeight: 700
    letterSpacing: "0.06em"
  headline:
    fontFamily: "Figtree Variable, system-ui, sans-serif"
    fontSize: "1.75rem"
    fontWeight: 750
    lineHeight: 1.15
    letterSpacing: "-0.02em"
  title:
    fontFamily: "Figtree Variable, system-ui, sans-serif"
    fontSize: "1.2rem"
    fontWeight: 700
    lineHeight: 1.25
    letterSpacing: "-0.012em"
  subtitle:
    fontFamily: "Figtree Variable, system-ui, sans-serif"
    fontSize: "1.02rem"
    fontWeight: 650
    lineHeight: 1.3
  body:
    fontFamily: "Figtree Variable, system-ui, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.5
  label:
    fontFamily: "Figtree Variable, system-ui, sans-serif"
    fontSize: "0.75rem"
    fontWeight: 650
    letterSpacing: "0.04em"
rounded:
  sm: "10px"
  md: "12px"
  lg: "20px"
  pill: "999px"
spacing:
  xs: "0.25rem"
  sm: "0.5rem"
  md: "1rem"
  lg: "1.75rem"
  time-column: "3.4rem"
  control: "3.1rem"
components:
  button-primary:
    backgroundColor: "{colors.brand}"
    textColor: "#FFFFFF"
    rounded: "{rounded.sm}"
    height: "3.1rem"
    padding: "0 1.3rem"
  button-primary-hover:
    backgroundColor: "{colors.brand-hover}"
  button-secondary:
    backgroundColor: "transparent"
    textColor: "{colors.brand}"
    rounded: "{rounded.sm}"
    height: "3.1rem"
  button-live:
    backgroundColor: "{colors.now}"
    textColor: "#FFFFFF"
    rounded: "{rounded.sm}"
    height: "3.1rem"
  input:
    backgroundColor: "{colors.sheet}"
    textColor: "{colors.ink}"
    rounded: "{rounded.sm}"
    height: "3.1rem"
    padding: "0.6rem 0.9rem"
  list:
    backgroundColor: "{colors.sheet}"
    rounded: "{rounded.md}"
  list-item:
    padding: "0.95rem 1rem"
  chip:
    backgroundColor: "{colors.sheet}"
    textColor: "{colors.ink}"
    rounded: "{rounded.pill}"
    height: "2.5rem"
    padding: "0 1rem"
  chip-on:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.desk}"
  pill-now:
    backgroundColor: "{colors.now-soft}"
    textColor: "{colors.now}"
    rounded: "{rounded.pill}"
  timeline-row-now:
    backgroundColor: "{colors.now-soft}"
    textColor: "{colors.ink}"
    rounded: "{rounded.sm}"
  day-selected:
    backgroundColor: "{colors.brand}"
    textColor: "#FFFFFF"
---

# Design System: Nexus Gestão do Cuidado

## Overview

**Creative North Star: "A Agenda Viva"**

Nexus é uma agenda semanal de papel: uma folha branca fria pousada sobre um fundo azul-acinzentado, escrita em tinta azul-marinho, dividida por linhas finas como a pauta de um caderno. Tudo no cuidado tem hora, então a home é o dia em linha do tempo, não um painel de cartões de ícone. O azul da marca é a caneta: aparece onde há uma ação a tomar. O verde-azulado é exclusivo do que está acontecendo agora e de mais nada.

A densidade é calma e adulta. Listas são pautadas (linhas de 1px entre itens dentro de uma folha) em vez de cartões empilhados. Estados mudam a linha sem quebrar a grade: concluído vira texto riscado em tinta mais clara, o "agora" ganha fundo verde-azulado na própria linha, e a coluna das horas continua no mesmo lugar. O texto é grande por padrão (base 17px, com opções de 19px e 21.5px e alto contraste) porque o público tem visão cansada.

**Key Characteristics:**
- Folha branca sobre fundo frio; profundidade por tom e linha, quase sem sombra.
- Uma caneta (azul da marca) e uma cor de presente (verde-azulado do agora), nunca misturadas.
- Coluna de horas fixa (3.4rem) com régua contínua, como a lombada de uma agenda.
- Alvos de toque de 2.75rem a 3.4rem; estado nunca depende só de cor.
- Tema claro, escuro e automático, mais alto contraste, todos por troca de tokens.

## Colors

Paleta fria e disciplinada: neutros azulados, uma cor de ação, uma cor de agora, e um pequeno conjunto de tons de tipo usados só como pontos e pílulas.

### Primary
- **Caneta Azul** (brand, #116EB0): ações e navegação ativa: botão primário, links, foco, dia selecionado, aba ativa, interruptores ligados. Hover em brand-hover. Fundo suave brand-soft para seleção e banners informativos.

### Secondary
- **Verde do Agora** (now, #0A7A70; ponto now-dot #14B8A6; fundo now-soft): reservado ao que acontece neste momento: o bloco "Acontecendo agora", a linha "agora" da agenda, o botão "Entrar" (button-live), a linha do tempo em curso. Aparece também em confirmações de sucesso, como extensão do sentido "deu certo, está valendo".

### Tertiary
- **Âmbar** (amber, #A85206), **Violeta** (violet, #6A3FBD), **Rosa** (rose, #B0306A), **Perigo** (danger, #B42318): cada um com versão -soft. Identificam o tipo do item (remédio = âmbar, sessão = violeta, evento = rosa, consulta = azul da marca) como ponto de 0.55rem no glifo e como marcas na faixa da semana, e sinalizam estoque baixo e erro.

### Neutral
- **Mesa Fria** (desk, #F1F4F9): fundo da página.
- **Folha** (sheet, #FFFFFF) e **Folha 2** (sheet-2, #F7F9FC): superfícies de lista, campos e hover de linha.
- **Tinta Marinho** (ink, #0E2036): texto principal e chip selecionado.
- **Tinta 2 / 3** (#435468 / #5D6E83): texto secundário e terciário/concluído, ambos ajustados para manter contraste legível.
- **Pauta** (rule, #E1E8F0) e **Pauta Forte** (rule-strong, #C9D5E3): linhas entre itens, bordas de campo, régua das horas.
- **Ardósia** (slate, #4F6076 / slate-soft #E8EDF3): pílula neutra, hover de ícone, trilho do segmentado.

O tema escuro e o alto contraste redefinem os mesmos nomes de token; nada no código usa hex fora dos tokens, salvo branco em texto sobre botão cheio.

### Named Rules
**The Only Now Rule.** O verde-azulado significa "acontecendo agora" e nada mais decorativo. Se o elemento não está em curso neste instante, não usa `now`. (Sucesso de confirmação é a única extensão aceita.)

**The Pen Rule.** Azul da marca marca ação ou seleção. Texto corrido, títulos e ícones de contexto ficam em tinta, não em azul.

**The Type Dot Rule.** Cor de tipo (âmbar, violeta, rosa) vive só em pontos e pílulas pequenos, nunca em fundos de bloco ou tiles. O tipo também é dito em texto e em forma (círculo, quadrado, losango na faixa da semana).

## Typography

**Display/Wordmark Font:** Playfair Display 700 (com Georgia, serif): somente o wordmark NEXUS.
**Body Font:** Figtree Variable (com system-ui, Segoe UI, Roboto): todo o resto.

**Character:** Um wordmark serifado herdado do app original sobre uma sans humanista e legível. Números tabulares ligados no corpo (`tnum`), para que horários alinhem na coluna.

### Hierarchy
- **Wordmark** (700, 1.3rem na barra, 1.5rem no rail, tracking 0.06em, caixa alta, azul da marca): só a marca.
- **Headline** (750, 1.75rem, 1.15, -0.02em): h1 de página, ex.: "Bom dia, Nome".
- **Title** (700, 1.2rem, 1.25): h2, título de seção/faixa da semana.
- **Subtitle** (650, 1.02rem, 1.3): h3, título de item e de dia.
- **Body** (400, 1rem, 1.5): texto corrido; metadados em 0.9rem e dicas em 0.85rem, cor tinta 2/3.
- **Label** (650-700, 0.72-0.8rem; maiúsculas com tracking 0.04-0.05em só em dia da semana e mês): rótulos de faixa da semana, pílulas, abas.
- **Hora** (750, 1.05rem, tabular, alinhada à direita): a hora na coluna da agenda.

### Named Rules
**The Serif Is a Signature Rule.** Playfair aparece apenas no wordmark. Títulos e interface ficam em Figtree.

**The Aligned Hours Rule.** Todo horário e número que se compara usa figuras tabulares.

## Layout

Celular primeiro, desktop sem sobras. Página centrada com largura máxima de 44rem (52rem em desktop; 68-72rem para a home em duas colunas) e margem de 1rem. No celular: barra superior fixa e barra de abas inferior com 5 itens (altura 4.1rem). A partir de 1024px: rail lateral de 17rem, sem barra nem abas.

A home em desktop usa duas colunas (1.6fr / 1fr); no celular as colunas se desfazem e `order` define a leitura: agora, atenção, agenda, pendências. Ritmo vertical em múltiplos de 0.25rem (0.5, 1, 1.75rem entre blocos). Linha de agenda: grade de duas colunas, 3.4rem de hora e o conteúdo. Faixa da semana: 7 colunas iguais. Barras de ação de formulário e de agendamento ficam fixas acima da tabbar.

## Elevation & Depth

Tonal e por linha, não por sombra. Superfícies são folhas brancas com borda de 1px em pauta; o fundo da página é mais escuro que a folha. Sombras existem só onde algo flutua sobre a folha: botão de ação flutuante, toast, barra de abas e barra de reserva (sombra para cima), e a pílula ativa do segmentado.

### Shadow Vocabulary
- **Sm** (`0 1px 2px rgb(14 32 54 / 6%)`): pílula ativa do segmentado, botão do interruptor.
- **Md** (`0 2px 6px rgb(14 32 54 / 6%), 0 12px 28px rgb(14 32 54 / 8%)`): FAB, toast, barra de reserva em desktop.
- **Up** (`0 -1px 0 var(--line), 0 -10px 30px rgb(14 32 54 / 6%)`): barras presas ao rodapé.

### Named Rules
**The Flat Sheet Rule.** A folha e seus itens são planos em repouso. Sombra só em elementos que flutuam ou estão fixos sobre o conteúdo; nunca em itens de lista.

## Shapes

Cantos suavemente arredondados e consistentes: listas, cartões e bancadas em 12px; botões, campos, banners e linhas em destaque em 10px; chips, pílulas, avatares, FAB e trilho do segmentado em totalmente redondo. Linhas finas de 1px dividem; campos e botões de contorno usam 1.5px. O ingresso tem a única forma própria: canhoto tracejado com entalhes circulares.

## Components

### Buttons
- **Shape:** cantos de 10px; altura 3.1rem (sm 2.75rem, lg 3.4rem).
- **Primary:** fundo azul da marca, texto branco, peso 650; hover em brand-hover; ativo desloca 1px para baixo.
- **Secondary / Ghost / Danger:** contorno de 1.5px (azul, linha forte, perigo) com fundo transparente; hover preenche com tom suave.
- **Live:** mesma forma, fundo verde do agora; só para entrar em algo que está acontecendo.
- **Disabled:** opacidade 0.5.
- **Foco:** anel de 3px na cor da marca, deslocado 2px, em todo elemento focável.

### Chips e pílulas
- **Chip:** pílula de 2.5rem, borda 1.5px em rule-strong, fundo folha; selecionado inverte para tinta com texto da cor do fundo.
- **Pílula de estado:** 0.8rem, peso 700, fundo -soft e texto na cor do tipo (brand, now, amber, danger, violet, rose, slate).

### Lista pautada (assinatura)
Folha com borda de 1px e raio de 12px; itens separados por linha de 1px; hover em sheet-2; título 650, metadado em tinta 2. Item encerrado: título em tinta 3 com risco fino, sem reduzir opacidade, para manter contraste. O glifo do tipo é um ícone em tinta com um ponto colorido do tipo no canto.

### Linha do tempo "Agenda viva" (assinatura)
Coluna de hora (3.4rem, 750, tabular, à direita) com régua vertical contínua de 1px em rule-strong. Linhas separadas por filete. A marca "agora" é uma linha de 3px em now-dot que atravessa a folha com a hora e a palavra "agora" em now, inserida antes do primeiro item futuro ou em curso. A linha que está acontecendo ganha fundo now-soft; as concluídas passadas ficam recolhidas atrás de um "N itens concluídos". Entrada das linhas com leve subida escalonada (45ms), partindo de opacidade legível.

### Faixa da semana
Sete dias em botões de 12px de raio: dia da semana em maiúsculas pequenas, número em 1.2rem, pontos de tipo (círculo = consulta, quadrado = sessão, losango = evento). Hoje tem anel de 2px na cor da marca; selecionado vira fundo azul com texto branco.

### Inputs / Fields
Altura 3.1rem, raio 10px, borda 1.5px em rule-strong, fundo folha. Foco: contorno de 3px em azul 35% e borda azul. Placeholder em tinta 3. Rótulo acima em 650.

### Navigation
Mobile: tabbar de 5 itens, rótulo 0.72rem em 650; ativo em azul da marca com traço de 3px no topo. Desktop: rail de 17rem com wordmark e itens de 2.75rem; ativo em brand-soft com texto azul. Segmentado de rotas: trilho slate-soft pílula, ativo em folha com sombra Sm.

### Bloco "Acontecendo agora"
Painel now-soft com borda now a 35% e ponto pulsante (anel que se expande a cada 1.8s); título em now; cada item com botão "Entrar" na cor do agora. Só existe quando algo está em curso.

### Outros
Banners de 10px com tom -soft e ícone na cor do tipo; medidor de estoque de 6px (azul, âmbar, vermelho); folha modal (sheet) só para confirmar e pagar, com 20px de raio superior; bolhas de chat de 20px; ticket com QR.

## Do's and Don'ts

### Do:
- **Do** usar linhas de 1px em rule (#E1E8F0) para dividir itens dentro de uma folha, em vez de cartões separados.
- **Do** reservar `now` (#0A7A70 / #14B8A6 / #DCF4F0) ao que acontece agora.
- **Do** usar o azul da marca (#116EB0) para ações, seleção e foco; texto e títulos em tinta (#0E2036).
- **Do** mudar o estado pela própria linha: texto riscado em tinta 3, fundo now-soft, sem alterar a grade nem reduzir opacidade do texto.
- **Do** comunicar tipo e estado com texto ou forma além de cor.
- **Do** manter alvos interativos de pelo menos 2.75rem e anel de foco de 3px.
- **Do** definir novas cores só como tokens com variante -soft e redefinição nos temas escuro e de alto contraste.
- **Do** respeitar `prefers-reduced-motion` (toda animação cai para 0.001ms).

### Don't:
- **Don't** montar a home como painel de cartões de ícone, em gradiente azul ou com emoji.
- **Don't** usar o verde do agora como decoração, ícone de categoria ou cor de marca secundária.
- **Don't** pintar blocos ou tiles inteiros com cores de tipo; elas são pontos e pílulas.
- **Don't** usar Playfair fora do wordmark.
- **Don't** usar sombra em itens de lista; flutuar é a exceção.
- **Don't** depender só de cor para indicar estado, tipo ou perigo.
- **Don't** introduzir hex solto fora dos tokens.

## Não canonizado (defeitos do build, não regras)

- Desfoque de fundo (`backdrop-filter`) na topbar, formbar e composer: efeito de vidro que a marca de papel não pede; não herdar em novas superfícies.
- Raios e tamanhos de fonte agora saem de tokens (`--radius-sm` 10px, `--radius` 12px, `--radius-lg` 20px para o sheet e os balões; `--fs-xs` 0.8rem, `--fs-sm` 0.875rem, `--fs-md` 0.95rem, `--fs-lg` 1.5rem). Em superfícies novas, usar os tokens em vez de literais. Exceções registradas no detector: passos de texto 17px e 21.5px da escala do usuário, micro-raios de 2 a 6px de marcas finas, tinta `#052b27` sobre o botão teal no escuro, cortina do sheet e a pilha monoespaçada dos códigos.
- A home envolve a linha do tempo num `.card` (borda e raio) dentro da seção, em tensão com "lista pautada, não cartão": registrado como desvio, não como padrão de cartão a reutilizar.

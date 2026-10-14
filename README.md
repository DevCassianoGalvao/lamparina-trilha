# Trilha Socioambiental: site (front-end)

Front-end do site institucional da **Trilha Consultoria & Gestão Socioambiental**, construído a partir do *Briefing executivo de copy e conteúdo para webdesign* (v1.0, 14/10/2026).

O site é estático: HTML, CSS e JS puros, sem framework e sem dependências em produção. O back-end (envio do formulário, newsletter, CMS do blog e glossário) fica para a próxima etapa.

## Estrutura

```
src/
  build.mjs     gerador: layout, Home e todas as páginas
  data.mjs      copy do briefing (soluções, públicos, método, glossário, artigos, contatos)
  ill.mjs       ilustrações SVG animadas (mapa vivo, camadas, rios, ícones das soluções)
  icons.mjs     ícones de traço
  styles.css    sistema visual completo (tokens, glassmorphism, animações)
  main.js       interações (menus, entradas, busca, cookies, formulário em etapas)
  assets/       logos recortados do material da marca, favicon, OG e fontes
dist/           site pronto para publicar (gerado; é o que vai para o servidor)
```

## Comandos

```bash
npm run build          # gera dist/ com URLs limpas (/a-trilha/, /solucoes/...)
npm run serve          # serve dist/ em http://localhost:8080
npm run build:preview  # gera preview/ com links para index.html (abre sem servidor)
```

Para publicar, suba o conteúdo de `dist/` para a raiz do domínio. O `404.html` usa caminhos absolutos (`/assets/...`) e deve ser configurado como página de erro no servidor.

## Páginas (39)

- **Início**, **A Trilha** (história), **Como atuamos**, **Integridade**
- **Soluções**: página geral e as 8 soluções em `/solucoes/<slug>/`
- **Para quem atuamos**: comunidades, empresas e organizações em `/para-quem/<slug>/`
- **Projetos e territórios**: mapa esquemático com lista textual, cards de caso e template de caso
- **Blog**: lista com filtro por categoria e os 3 artigos de lançamento (template)
- **Glossário**: filtro, índice A–Z e uma página por termo (`/glossario/<termo>/`)
- **Contato**: formulário adaptativo em 4 etapas
- **Legais e utilitários**: Privacidade, Cookies, Acessibilidade, 404, busca (`/` ou Ctrl+K) e banner de cookies

## Direção visual

- **Conceito "cartografia viva"**: o caminho aparece em curvas de nível, rotas, rios e pontos de passagem. Não usa trilhas literais, conforme o briefing.
- **Paleta**:
  - Verde Trilha `#047234` (logo)
  - Floresta `#0e3b2c`
  - Folha `#6dbb45`
  - Areia `#f2ede2`
  - Terracota `#b4552f`
  - Grafite `#1f2a26`
- **Tipografia**:
  - Familjen Grotesk nos títulos
  - Instrument Sans no texto
  - Ambas self-hosted, licença OFL.
- **Vidro e movimento**:
  - Cards de vidro (glassmorphism) sobre auras de cor e curvas de nível animadas.
  - Ilustrações em loop, entradas por rolagem, luz que segue o ponteiro, cards com inclinação e botões magnéticos.
  - Tudo respeita `prefers-reduced-motion`.

## Placeholders e pendências

| Onde | O que falta |
| --- | --- |
| Espaços tracejados com câmera | Fotos de campo autorizadas (hero, experiência, caso, história, equipe) |
| `src/data.mjs` → `SITE` | E-mail oficial, WhatsApp oficial (e link `wa.me`), prazo de resposta, domínio |
| Etiquetas laranja "Validar…" | Ano de fundação, caso de Oriximiná, territórios, política de integridade |
| Linhas cinza animadas | Texto ainda não produzido: artigos, definições do glossário, descrições de compromissos, minibios, textos legais |

As etiquetas "Validar…" e as linhas cinza são marcações de trabalho. Elas precisam ser removidas antes de o site ir ao ar. Procure por `validate(` e `sk(` em `src/build.mjs`.

## Back-end (próxima etapa)

- `src/main.js` → `TODO back-end`: envio do formulário de contato (`FormData`) e inscrição na newsletter.
- O contato aceita pré-seleção por URL, por exemplo `/contato/?perfil=comunidade&tema=CPLI`. As páginas de solução e de público já usam esse recurso.
- Blog, glossário e casos estão em `src/data.mjs`. Se for usar um CMS, cada lista vira uma coleção.
- Analytics só deve ser carregado quando o consentimento salvo em `localStorage` (`trilha-cookies`) tiver `analytics: true`.

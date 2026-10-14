// Conteúdo extraído do "Briefing executivo de copy e conteúdo para webdesign" v1.0 (14/10/2026).
// Itens marcados com VALIDAR dependem de confirmação do cliente antes da publicação.

export const SITE = {
  name: 'Trilha Socioambiental',
  legal: 'Trilha Consultoria & Gestão Socioambiental Ltda',
  cnpj: '46.763.839/0001-82', // VALIDAR: briefing pede confirmar razão social, CNPJ e ano de fundação
  signature: 'Do território à decisão, construímos caminhos possíveis.',
  footerLine: 'Consultoria e assessoria técnica em temas sociais, ambientais, territoriais e de governança.',
  city: 'Santarém, Pará',
  email: '[E-MAIL OFICIAL]', // VALIDAR
  whatsapp: '[WHATSAPP OFICIAL]', // VALIDAR: há números diferentes nos canais atuais
  whatsappHref: '#', // VALIDAR: https://wa.me/55DDDNUMERO
  instagram: 'https://www.instagram.com/trilha.socioambiental/',
  responseTime: '[PRAZO]', // VALIDAR
  url: 'https://trilhasocioambiental.com.br', // VALIDAR domínio
};

export const SOLUTIONS = [
  {
    slug: 'assessoria-tecnica-independente', key: 'assessoria', icon: 'fileSearch', featured: true,
    name: 'Assessoria técnica independente',
    card: 'Apoio para comunidades compreenderem processos, organizarem demandas e participarem de decisões com autonomia.',
    menu: 'Apoio para comunidades participarem de decisões com autonomia.',
    h1: 'Conhecimento técnico a serviço da participação e da autonomia comunitária.',
    text: 'A assessoria ajuda comunidades e associações a compreender processos que afetam seus territórios, organizar prioridades e participar de decisões com informação qualificada.',
    entregas: [['Leitura de documentos', 'doc'], ['Diagnósticos participativos', 'users'], ['Organização de demandas', 'layers'], ['Formação', 'graduation'], ['Apoio a reuniões', 'message'], ['Monitoramento de compromissos', 'eye']],
    cta: 'Quero entender se este serviço se aplica', audience: 'comunidades-associacoes', topic: 'Assessoria técnica',
  },
  {
    slug: 'consultoria-socioambiental', key: 'consultoria', icon: 'compass', featured: true,
    name: 'Consultoria socioambiental',
    card: 'Diagnósticos, estratégias e planos para organizações e empreendimentos atuarem com responsabilidade nos territórios.',
    menu: 'Diagnósticos, estratégias e planos para atuar nos territórios.',
    h1: 'Decisões melhores começam com uma leitura responsável do território.',
    text: 'A Trilha apoia organizações e empreendimentos na compreensão de impactos, riscos, atores e oportunidades, transformando contexto em estratégia, planos e ações acompanháveis.',
    entregas: [['Diagnóstico', 'fileSearch'], ['Mapeamento de atores', 'network'], ['Linha de base', 'chart'], ['Estratégia de relacionamento', 'handshake'], ['Plano territorial', 'map'], ['Indicadores', 'target']],
    cta: 'Converse sobre o seu projeto', audience: 'empresas-empreendimentos', topic: 'Consultoria',
  },
  {
    slug: 'gestao-de-projetos-sociais', key: 'gestao', icon: 'chart', featured: true,
    name: 'Gestão de projetos sociais',
    card: 'Estruturação, execução e monitoramento de iniciativas de desenvolvimento e fortalecimento institucional.',
    menu: 'Estruturação, execução e monitoramento de iniciativas.',
    h1: 'Do propósito à entrega: projetos sociais com método e acompanhamento.',
    text: 'Estruturamos e gerenciamos iniciativas de desenvolvimento local, geração de renda, cultura, esporte e fortalecimento institucional.',
    entregas: [['Diagnóstico', 'fileSearch'], ['Teoria de mudança', 'route'], ['Plano de trabalho', 'calendar'], ['Gestão da execução', 'sliders'], ['Indicadores', 'target'], ['Avaliação', 'check']],
    cta: 'Estruture seu projeto com a Trilha', audience: 'organizacoes-instituicoes', topic: 'Projetos sociais',
  },
  {
    slug: 'esg-e-inteligencia-territorial', key: 'esg', icon: 'layers',
    name: 'ESG e inteligência territorial',
    card: 'Riscos sociais, partes interessadas, indicadores e governança conectados ao território.',
    menu: 'Riscos sociais, indicadores e governança conectados ao território.',
    h1: 'ESG que começa na realidade e chega à governança.',
    text: 'A Trilha transforma a dimensão social e territorial do ESG em critérios de gestão, riscos, indicadores e responsabilidades.',
    entregas: [['Materialidade', 'target'], ['Riscos e impactos', 'alert'], ['Partes interessadas', 'users'], ['Direitos humanos', 'scale'], ['Indicadores', 'chart'], ['Governança', 'building']],
    cta: 'Conecte território e governança', audience: 'empresas-empreendimentos', topic: 'ESG',
  },
  {
    slug: 'licenciamento-componente-quilombola', key: 'licenciamento', icon: 'shield',
    name: 'Licenciamento e componente quilombola',
    card: 'Apoio técnico em ECQ, PBAQ e acompanhamento de programas.',
    menu: 'Apoio técnico em ECQ, PBAQ e acompanhamento de programas.',
    h1: 'Qualidade técnica e participação nos estudos e programas do componente quilombola.',
    text: 'Apoio multidisciplinar em ECQ, PBAQ e acompanhamento de programas, conforme o papel assumido e as diretrizes aplicáveis.',
    entregas: [['Coordenação técnica', 'sliders'], ['Trabalho de campo', 'pin'], ['Análise de impactos', 'alert'], ['Programas', 'layers'], ['Indicadores', 'chart'], ['Relatórios', 'record']],
    cta: 'Apresente o contexto do licenciamento', audience: 'empresas-empreendimentos', topic: 'ECQ/PBAQ',
  },
  {
    slug: 'cpli-processos-participativos', key: 'cpli', icon: 'message',
    name: 'CPLI e processos participativos',
    card: 'Informação, metodologia, registro e apoio à participação.',
    menu: 'Informação, metodologia, registro e apoio à participação.',
    h1: 'Participação exige informação, tempo, método e respeito.',
    text: 'A Trilha oferece apoio técnico e metodológico a processos de Consulta Prévia, Livre e Informada, com clareza sobre o papel exercido.',
    entregas: [['Planejamento', 'calendar'], ['Materiais acessíveis', 'book'], ['Formação', 'graduation'], ['Facilitação compatível com o escopo', 'users'], ['Registro', 'record'], ['Monitoramento', 'eye']],
    cta: 'Converse sobre a preparação necessária', audience: 'comunidades-associacoes', topic: 'CPLI',
  },
  {
    slug: 'pgtaq-gestao-territorial', key: 'pgtaq', icon: 'map',
    name: 'PGTAQs e gestão territorial',
    card: 'Apoio participativo a instrumentos de gestão territorial e ambiental quilombola.',
    menu: 'Instrumentos de gestão territorial e ambiental quilombola.',
    h1: 'Planejamento territorial construído com autonomia, identidade e visão de futuro.',
    text: 'Apoio participativo à construção de Planos de Gestão Territorial e Ambiental Quilombola alinhados à PNGTAQ.',
    entregas: [['Leitura territorial', 'map'], ['Mapeamento participativo', 'pin'], ['Visão de futuro', 'sprout'], ['Carteira de projetos', 'layers'], ['Indicadores', 'target'], ['Plano de implementação', 'calendar']],
    cta: 'Conheça o apoio da Trilha', audience: 'comunidades-associacoes', topic: 'PGTAQ',
  },
  {
    slug: 'articulacao-institucional', key: 'articulacao', icon: 'network',
    name: 'Articulação institucional',
    card: 'Conexão entre demandas locais, políticas, parceiros e espaços de decisão.',
    menu: 'Conexão entre demandas locais, políticas e espaços de decisão.',
    h1: 'Demandas do território precisam chegar aos espaços de decisão.',
    text: 'A Trilha apoia agendas, parcerias e caminhos institucionais que conectem necessidades locais a políticas, órgãos, financiadores e organizações.',
    entregas: [['Mapeamento institucional', 'network'], ['Preparação de agenda', 'calendar'], ['Materiais técnicos', 'doc'], ['Reuniões', 'message'], ['Parcerias', 'handshake'], ['Acompanhamento', 'eye']],
    cta: 'Estruture sua agenda institucional', audience: 'organizacoes-instituicoes', topic: 'Articulação',
  },
];

export const AUDIENCES = [
  {
    slug: 'comunidades-associacoes', key: 'comunidades', tone: '', profile: 'comunidade',
    name: 'Comunidades e associações', short: 'Comunidades',
    card: 'Informação, organização e apoio técnico para participar de processos complexos com mais segurança.',
    cardCta: 'Quero entender a assessoria',
    h1: 'Mais informação e apoio técnico para decisões que afetam o território.',
    text: 'Quando documentos são complexos, prazos são curtos e muitos interesses estão envolvidos, a comunidade precisa de condições reais para compreender, deliberar e se posicionar.',
    listTitle: 'Situações em que a Trilha pode apoiar',
    items: [['Empreendimento ou obra', 'building'], ['Estudos difíceis de analisar', 'fileSearch'], ['Consulta ou negociação', 'message'], ['Compromissos sem acompanhamento', 'eye'], ['Associação precisa fortalecer gestão', 'users']],
    cta: 'Solicitar conversa reservada',
    solutions: ['assessoria-tecnica-independente', 'cpli-processos-participativos', 'pgtaq-gestao-territorial', 'licenciamento-componente-quilombola'],
  },
  {
    slug: 'empresas-empreendimentos', key: 'empresas', tone: 'terra', profile: 'empresa',
    name: 'Empresas e empreendimentos', short: 'Empresas',
    card: 'Leitura territorial, prevenção de riscos, programas sociais e relacionamento responsável.',
    cardCta: 'Quero discutir um projeto',
    h1: 'Gestão socioambiental conectada ao território e à tomada de decisão.',
    text: 'A Trilha ajuda a compreender contextos, prevenir falhas, estruturar programas e qualificar relações com partes interessadas.',
    listTitle: 'Frentes de atuação',
    items: [['Diagnóstico', 'fileSearch'], ['Riscos sociais', 'alert'], ['Relacionamento', 'handshake'], ['Projetos sociais', 'sprout'], ['ESG', 'layers'], ['Licenciamento', 'shield'], ['Indicadores', 'chart']],
    cta: 'Solicite uma conversa técnica',
    solutions: ['consultoria-socioambiental', 'esg-e-inteligencia-territorial', 'licenciamento-componente-quilombola', 'gestao-de-projetos-sociais'],
  },
  {
    slug: 'organizacoes-instituicoes', key: 'organizacoes', tone: 'forest', profile: 'organizacao',
    name: 'Organizações e instituições', short: 'Organizações',
    card: 'Diagnóstico, planejamento, governança e gestão para fortalecer capacidades e ampliar impacto.',
    cardCta: 'Quero fortalecer uma iniciativa',
    h1: 'Estratégia e gestão para organizações que querem ampliar seu impacto.',
    text: 'Associações, cooperativas, fundações, institutos e órgãos públicos precisam transformar propósito em prioridades, projetos, rotinas e resultados.',
    listTitle: 'Frentes de atuação',
    items: [['Diagnóstico', 'fileSearch'], ['Planejamento', 'calendar'], ['Governança', 'building'], ['Projetos', 'layers'], ['Captação', 'coins'], ['Monitoramento', 'eye'], ['Formação', 'graduation'], ['Articulação', 'network']],
    cta: 'Fortaleça sua organização',
    solutions: ['gestao-de-projetos-sociais', 'articulacao-institucional', 'consultoria-socioambiental', 'esg-e-inteligencia-territorial'],
  },
];

export const METHOD = [
  ['Escuta e enquadramento', 'Contexto, atores e papel da Trilha.', 'ear'],
  ['Diagnóstico', 'Evidências, riscos, capacidades e prioridades.', 'fileSearch'],
  ['Planejamento', 'Objetivos, entregas, indicadores e cronograma.', 'calendar'],
  ['Implementação', 'Coordenação de especialistas, ações e registros.', 'sliders'],
  ['Monitoramento', 'Resultados, aprendizados e ajustes de rota.', 'refresh'],
];

export const VALUES = [
  ['Respeito aos territórios', 'map'], ['Autonomia técnica', 'compass'], ['Escuta qualificada', 'ear'],
  ['Transparência de papéis', 'eye'], ['Construção conjunta', 'puzzle'], ['Resultado com continuidade', 'refresh'],
];
export const COMMITMENTS = [
  ['Clareza de representação', 'users'], ['Prevenção de conflitos de interesse', 'scale'], ['Autonomia técnica', 'compass'],
  ['Participação sem coerção', 'handshake'], ['Proteção de informações', 'lock'], ['Comunicação responsável', 'megaphone'],
];
export const PILLARS = [
  ['Território antes da solução', 'Cada trabalho começa pela compreensão do contexto, dos atores, das relações e dos impactos.', 'map'],
  ['Conhecimento que fortalece decisões', 'A Trilha traduz informações técnicas e organiza evidências para decisões mais claras.', 'fileSearch'],
  ['Diálogo com método', 'Escuta, participação, registro e devolutiva fazem parte do processo.', 'message'],
  ['Articulação que aproxima território e decisão', 'Demandas locais são conectadas a políticas, instituições e espaços de decisão.', 'network'],
  ['Resultado que permanece', 'O trabalho deve deixar capacidades, processos e indicadores úteis.', 'sprout'],
];

export const BLOG_CATS = [
  ['territorios-comunidades', 'Territórios e comunidades', ['#d6ebc4', '#047234', '#b4552f']],
  ['licenciamento-participacao', 'Licenciamento e participação', ['#f2d6c6', '#b4552f', '#0e3b2c']],
  ['projetos-impacto-social', 'Projetos e impacto social', ['#0e3b2c', '#6dbb45', '#e0b062']],
  ['esg-governanca', 'ESG e governança', ['#e8e0cf', '#0e3b2c', '#047234']],
  ['gestao-institucional', 'Gestão institucional', ['#cfe0d6', '#0e3b2c', '#b4552f']],
  ['trilha-em-campo', 'Trilha em campo', ['#134a37', '#bfe3a8', '#e0b062']],
];

export const POSTS = [
  {
    slug: 'o-que-e-assessoria-tecnica-independente', cat: 'territorios-comunidades', seed: 3,
    title: 'O que é assessoria técnica independente?',
    summary: 'Como o apoio técnico ajuda comunidades a compreender processos, organizar prioridades e participar de decisões com informação qualificada.',
    toc: ['Para que serve a assessoria', 'Quem pode solicitar', 'Como garantir independência', 'Quando procurar apoio'],
    related: ['assessoria-tecnica-independente'], terms: ['assessoria-tecnica-independente', 'territorio'],
  },
  {
    slug: 'cpli-sete-condicoes-participacao-consistente', cat: 'licenciamento-participacao', seed: 8,
    title: 'CPLI: sete condições para uma participação consistente.',
    summary: 'O que precisa acontecer antes de uma Consulta Prévia, Livre e Informada começar, e por que informação, tempo e método fazem diferença.',
    toc: ['O que é a CPLI', 'As sete condições', 'Papéis de cada parte', 'Registro e devolutiva'],
    related: ['cpli-processos-participativos'], terms: ['cpli', 'partes-interessadas'],
  },
  {
    slug: 'cinco-etapas-projeto-social-resultado-acompanhado', cat: 'projetos-impacto-social', seed: 21,
    title: 'Cinco etapas para transformar um projeto social em resultado acompanhado.',
    summary: 'Escuta, diagnóstico, planejamento, implementação e monitoramento aplicados ao dia a dia de projetos sociais.',
    toc: ['Escuta e enquadramento', 'Diagnóstico', 'Planejamento', 'Implementação', 'Monitoramento'],
    related: ['gestao-de-projetos-sociais'], terms: ['teoria-de-mudanca', 'linha-de-base'],
  },
];

// Siglas: apenas o desdobramento (fato público). Definições completas: a produzir.
export const TERMS = [
  ['assessoria-tecnica-independente', 'Assessoria técnica independente', '', ['assessoria-tecnica-independente']],
  ['cpli', 'CPLI', 'Consulta Prévia, Livre e Informada', ['cpli-processos-participativos']],
  ['ecq', 'ECQ', 'Estudo do Componente Quilombola', ['licenciamento-componente-quilombola']],
  ['linha-de-base', 'Linha de base', '', ['consultoria-socioambiental']],
  ['materialidade', 'Materialidade', '', ['esg-e-inteligencia-territorial']],
  ['partes-interessadas', 'Partes interessadas', '', ['consultoria-socioambiental', 'esg-e-inteligencia-territorial']],
  ['pbaq', 'PBAQ', 'Plano Básico Ambiental Quilombola', ['licenciamento-componente-quilombola']],
  ['pgtaq', 'PGTAQ', 'Plano de Gestão Territorial e Ambiental Quilombola', ['pgtaq-gestao-territorial']],
  ['pngtaq', 'PNGTAQ', 'Política Nacional de Gestão Territorial e Ambiental Quilombola', ['pgtaq-gestao-territorial']],
  ['teoria-de-mudanca', 'Teoria de mudança', '', ['gestao-de-projetos-sociais']],
  ['territorio', 'Território', '', ['assessoria-tecnica-independente', 'pgtaq-gestao-territorial']],
];

export const PROFILES = [
  ['comunidade', 'Comunidade ou associação', 'users'],
  ['empresa', 'Empresa ou empreendimento', 'building'],
  ['organizacao', 'Organização ou instituição', 'sprout'],
  ['orgao', 'Órgão público', 'scale'],
  ['parceiro', 'Parceiro técnico', 'handshake'],
  ['outro', 'Outro', 'spark'],
];
export const TOPICS = [
  ['assessoria', 'Assessoria técnica', 'fileSearch'], ['consultoria', 'Consultoria', 'compass'], ['projetos', 'Projetos sociais', 'chart'],
  ['esg', 'ESG', 'layers'], ['ecq', 'ECQ/PBAQ', 'shield'], ['cpli', 'CPLI', 'message'], ['pgtaq', 'PGTAQ', 'map'],
  ['articulacao', 'Articulação', 'network'], ['parceria', 'Parceria', 'handshake'], ['outro', 'Outro', 'spark'],
];

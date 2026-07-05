export type Lang = "en" | "es" | "fr" | "de" | "pt" | "zh" | "ja";

export const LANG_LABELS: Record<Lang, string> = {
  en: "EN",
  es: "ES",
  fr: "FR",
  de: "DE",
  pt: "PT",
  zh: "中文",
  ja: "日本語",
};

export const LANG_NAMES: Record<Lang, string> = {
  en: "English",
  es: "Español",
  fr: "Français",
  de: "Deutsch",
  pt: "Português",
  zh: "中文",
  ja: "日本語",
};

export interface ModuleT {
  tag: string;
  title: string;
  subtitle: string;
  deliverable?: string;
  desc: string;
  topics: string[];
  workshopSession: string;
}

export interface WorkshopT {
  title: string;
  weeks: string[];
}

export interface FoundationsT {
  nav: {
    timeline: string;
    modules: string;
    workshops: string;
    howToApply: string;
  };
  hero: {
    metaLeft: string;
    metaRight: string;
    titleLine1: string;
    titleLine2: string;
    premise: { label: string; text: string }[];
    stats: { label: string }[];
    cta: string;
  };
  timeline: {
    title: string;
    subtitle: string;
    monthLabels: string[];
  };
  modules: {
    sectionTitle: string;
    sectionDesc: string;
    contentsLabel: string;
    loadLabel: string;
    workshopLabel: string;
    items: ModuleT[];
  };
  workshops: {
    sectionTitle: string;
    sectionSubtitle: string;
    sectionDesc: string;
    weekLabel: string;
    items: WorkshopT[];
  };
  footer: {
    tagline: string;
    programLabel: string;
    programItems: string[];
    applyLabel: string;
    applyBtn: string;
  };
  miniChat: {
    label: string;
    cta: string;
    placeholder: string;
  };
}

const en: FoundationsT = {
  nav: {
    timeline: "Timeline",
    modules: "Modules",
    workshops: "Workshops",
    howToApply: "How to apply",
  },
  hero: {
    metaLeft: "Master in Intelligent Artificial Worlds",
    metaRight: "Program 01 — Foundations",
    titleLine1: "Foundations of",
    titleLine2: "intelligent worlds.",
    premise: [
      {
        label: "Premise",
        text: "Build the tools, the data, and the ways of thinking needed for a project operating with AI in the built environment. From basic programming to the digital twin, without skipping the foundations.",
      },
      {
        label: "Who",
        text: "Architects, urban planners, engineers, and designers who want to arrive at MIAW Advanced or the Final Project with real technical grounding — not just vocabulary.",
      },
      {
        label: "Outcome",
        text: "A body of personal workflows, defended across three workshops and a course project. Ready to enter Advanced or apply in practice.",
      },
    ],
    stats: [
      { label: "ECTS" },
      { label: "Total load" },
      { label: "Modules" },
      { label: "Workshops" },
      { label: "Months" },
    ],
    cta: "How to apply →",
  },
  timeline: {
    title: "timeline",
    subtitle: "9 modules · 8 fortnights",
    monthLabels: ["Month 1", "Month 2", "Month 3", "Month 4", "Month 5+"],
  },
  modules: {
    sectionTitle: "nine modules.",
    sectionDesc:
      "Each module is a fortnight of work: 40 hours, one expert masterclass, practical content, and a clear link to one of the three program workshops. The progression runs from foundations (data, programming, GIS) through modelling, simulation, fabrication, and finally integration into a bespoke ecosystem.",
    contentsLabel: "Contents",
    loadLabel: "Load",
    workshopLabel: "Workshop",
    items: [
      {
        tag: "Onboarding",
        title: "Essential Workflows Overview",
        subtitle: "Mapping the territory before setting foot in it.",
        deliverable: "Map the full program, set up your environment, and define the course project question you will defend in July.",
        desc: "Kickoff fortnight. Walk through the program structure, locate the three workshops, and frame the course project so every student arrives at the first module with their question already formulated. This is not a gentle introduction — it's where you decide what you'll be defending in July.",
        topics: ["Program structure", "Cross-cutting workflows", "Final Course Project", "Mentor assignment", "Statement of interests"],
        workshopSession: "Pre-Workshop 1",
      },
      {
        tag: "Workshop 1",
        title: "Fundamentals",
        subtitle: "All about data structures and basic programming",
        deliverable: "SETUP AI WORKFLOWS — General setup for AI tools. Basic understanding of data structures and file types to consume in an AI environment. Possibilities for connections between AI tools and existing programs.",
        desc: "Basic programming, data structures, and AI environment setup. No flashy demos here — this is where you build the foundation you'll use for five months. Skip this module and you'll pay compound interest for the rest of the course.",
        topics: ["Programming 1", "Data structures", "Databases", "Data scraping", "AI Concepts", "AI Environment Setup", "MCPs"],
        workshopSession: "Masterclass + Kickstart + Follow-up + Final",
      },
      {
        tag: "Workshop 1",
        title: "AI Territory",
        subtitle: "Topography / Landscape / Territory based AI uses",
        deliverable: "TERRAIN GENERATION TOOLKIT — Procedural and bespoke system for generating and modifying digital terrain using computational rules, geospatial data and simulation feedback loops, enabling controllable landscape formation and iterative spatial design.",
        desc: "Territory understood as data: topography, landscape, city. The module teaches you to read and produce geographic information with notebooks and models — not to buy layers. The deliverable: build your own territorial layer without depending on a third-party viewer.",
        topics: ["GIS", "Geolocated data display", "LM Notebooks", "Programming 2", "Topography scraping", "Landscape modeling", "Smart city modelling", "MCPs 2"],
        workshopSession: "1 session · 2.5h + Q&A",
      },
      {
        tag: "Workshop 1",
        title: "AI Modeling",
        subtitle: "From concept to usable model. Fast AI-assisted prototyping",
        deliverable: "AI ASSISTED MODELING AGENT AND PIPELINE — End-to-end AI-assisted architectural modeling workflow that transforms multimodal conceptual inputs (text, sketches, references or spatial constraints) into usable 3D models through generative AI.",
        desc: "Create, modify, and control geometry with AI. From meshes, NURBS, and SubDs to fast-modelling workflows and topology aids — the module builds the toolkit for generating and adapting complex forms at design speed.",
        topics: ["Meshes / NURBS / SubDs", "Fast modelling techniques", "Topology and modelling aids"],
        workshopSession: "1 session · 2.5h + Q&A",
      },
      {
        tag: "Workshop 2",
        title: "AI Prototyping",
        subtitle: "AI-assisted Prototyping with Visual programming",
        deliverable: "ADAPTIVE RULE-BASED TYPOLOGY GENERATOR — Computational design system for generating adaptive architectural typologies based on rule-based logic, where spatial configurations emerge from encoded constraints, behavioural rules and environmental parameters, enabling continuous generation, variation and optimisation of building typologies in response to changing contextual and performance conditions.",
        desc: "This is where you decide how to prototype for the rest of the program. Visual programming, assisted scripting, parametric vs. code. The module forces you to choose tool and method for each situation, rather than defaulting to what you already know.",
        topics: ["Visual Programming", "Advanced Prototypes", "AI assisted scripting", "Parametric vs Code", "Topologies vs typologies", "Procedural Modelling", "Deterministic vs Stochastic", "Rules as Tools"],
        workshopSession: "Workshop 2 — Masterclass",
      },
      {
        tag: "Workshop 2",
        title: "AI Simulation",
        subtitle: "AI-based simulation use and limitations",
        deliverable: "PREDICTIVE PERFORMANCE BUILDING MODEL — Integrated computational building system that combines simulation, AI-based prediction and real-time performance analysis to anticipate structural, environmental and operational behaviour, enabling the design of buildings whose geometry and systems are continuously evaluated.",
        desc: "Multidisciplinary simulation with AI: structure, environment, flows, optimization. The emphasis is on limits — what a network simulates well, what a classical FEM does better, when a multi-agent system is the right call. Learning to validate results is half the module.",
        topics: ["Simulation types & cost", "Smart workflows", "Optimization algorithms", "AI result validation", "Alternative simulations", "Finite Element Models", "ML / EVO / EMO / AI", "Multiagent systems"],
        workshopSession: "1 session · 2.5h + Q&A",
      },
      {
        tag: "Workshop 3",
        title: "AI Communication",
        subtitle: "AI-assisted Multimedia Production and Model-based digital Immersion",
        deliverable: "AI IMMERSIVE APPLICATION — AI-assisted multimedia production and digital immersion framework that transforms architectural models and simulation outputs into coherent visual narratives, combining image, video and real-time 3D environments to communicate design, performance data and spatial experience through immersive and interactive interfaces.",
        desc: "Image and video production with generative models, return from audiovisual to 3D model, immersive environments. The module's question is not how to generate a pretty render, but how to build a coherent visual language for an AI project applied to the built environment.",
        topics: ["AI image tooling", "AI image models", "Model to Image", "Image to Video", "Video + image to model", "Image to World"],
        workshopSession: "Workshop 3 — Masterclass",
      },
      {
        tag: "Workshop 3",
        title: "AI Documentation",
        subtitle: "Automated BIM, documentation and Document Management",
        deliverable: "CLOUD AI-BIM DOCUMENTATION PLATFORM — Cloud-based openBIM system for automated architectural documentation and project information management, enabling real-time generation, coordination and versioning of documentation directly from BIM models, integrating interoperable openBIM standards, AI-assisted content generation and collaborative data workflows across design, engineering and construction environments.",
        desc: "What is not documented does not exist on site. The module works through advanced BIM, entities, exchange formats, and AI-assisted drafting. It also covers document management and the boundary with robotics and construction.",
        topics: ["Advanced BIM entities", "Data management & formats", "Details, Materials, Articulations", "Construction, Constraints & Robotics 101", "BIM Super-Integrations", "AI Driven Drafting"],
        workshopSession: "1 session · 2.5h + Q&A",
      },
      {
        tag: "Workshop 3",
        title: "AI Digital Fabrication",
        subtitle: "AI in Robotics and Complex Digital Manufacturing",
        deliverable: "AI DIGITAL FABRICATION ALGORITHM SCRIPTING FOR COMPLEX GEOMETRY — AI-driven computational fabrication framework for the design and production of singular architectural components, where algorithmic geometry generation, material constraints and robotic manufacturing processes converge to produce unique, non-repetitive building elements optimized through simulation, fabrication feedback and construction-aware design logic.",
        desc: "Advanced digital fabrication, robotics, and complex assemblies. The module closes the digital–physical–digital loop: the model is built, measured, and returned to the system corrected. Optimization workflows, gcode, and smart fabrication strategies designed for real-world production.",
        topics: ["From Digital to Physical and back", "Smart workflows", "Optimization for DIGFAB", "Robotics 101", "3D printing, GCodes & paths"],
        workshopSession: "1 session · 2.5h + Q&A",
      },
      {
        tag: "Final Project",
        title: "AI Integration",
        subtitle: "A bespoke, adaptive multimodal ecosystem.",
        deliverable: "GLOBAL AI INTERACTIVE INTERFACE — A bespoke, adaptive multimodal AI ecosystem integrating all tools, data, and workflows from every previous module, ready to defend.",
        desc: "The closing module adds no new topics — it connects them. Each student integrates tools, data, models, and workflows from the previous eight modules into a personal ecosystem they'll defend before the final jury.",
        topics: ["Multimodal integration", "Bespoke AI Workflows", "Final Course Project", "Final Jury"],
        workshopSession: "Final Jury",
      },
    ],
  },
  workshops: {
    sectionTitle: "three workshops.",
    sectionSubtitle: "3 juries · 3 milestones",
    sectionDesc:
      "Each workshop is an intensive sprint where the preceding modules converge into a single defended project. Three juries, three milestones, one continuous arc.",
    weekLabel: "Week",
    items: [
      {
        title: "AI Parametricism\n& Systems",
        weeks: ["Setup & kickstart", "Territory analysis", "Modeling sprint", "Review & jury"],
      },
      {
        title: "AI Powered Design\n& Simulations",
        weeks: ["Prototyping setup", "Simulation sprint", "Optimization", "Final review"],
      },
      {
        title: "Bespoke AI",
        weeks: ["Visual language", "BIM & docs", "Fabrication", "Integration & jury"],
      },
    ],
  },
  footer: {
    tagline:
      "Master in Intelligent Artificial Worlds. Postgraduate program in spatial AI and physical world modeling for the AEC sector.",
    programLabel: "Program",
    programItems: ["Foundations", "Advanced", "Final Project"],
    applyLabel: "Apply",
    applyBtn: "speak to an advisor →",
  },
  miniChat: {
    label: "miaw",
    cta: "ask anything →",
    placeholder: "start a conversation",
  },
};

const es: FoundationsT = {
  nav: {
    timeline: "Cronograma",
    modules: "Módulos",
    workshops: "Workshops",
    howToApply: "Cómo aplicar",
  },
  hero: {
    metaLeft: "Máster en Mundos Artificiales Inteligentes",
    metaRight: "Programa 01 — Foundations",
    titleLine1: "Fundamentos de",
    titleLine2: "mundos inteligentes.",
    premise: [
      {
        label: "Premisa",
        text: "Construir las herramientas, los datos y las maneras de pensar que necesita un proyecto que opera con IA en el medio construido. De la programación básica al gemelo digital, sin saltarse los cimientos.",
      },
      {
        label: "Quién",
        text: "Arquitectos, urbanistas, ingenieros y diseñadores que quieren llegar a MIAW Advanced o al Proyecto Final con base técnica real, no con vocabulario suelto.",
      },
      {
        label: "Salida",
        text: "Un cuerpo de workflows propios, defendidos en tres workshops y un proyecto de curso. Listos para entrar en Advanced o aplicarse en estudio.",
      },
    ],
    stats: [
      { label: "ECTS" },
      { label: "Carga total" },
      { label: "Módulos" },
      { label: "Workshops" },
      { label: "Meses" },
    ],
    cta: "Cómo aplicar →",
  },
  timeline: {
    title: "cronograma",
    subtitle: "9 módulos · 8 quincenas",
    monthLabels: ["Mes 1", "Mes 2", "Mes 3", "Mes 4", "Mes 5+"],
  },
  modules: {
    sectionTitle: "nueve módulos.",
    sectionDesc:
      "Cada módulo es una quincena de trabajo: 40 horas, una masterclass experta, contenido práctico y un vínculo claro con uno de los tres workshops del programa. La progresión va de los fundamentos (datos, programación, GIS) al modelado, la simulación, la fabricación y, finalmente, la integración en un ecosistema a medida.",
    contentsLabel: "Contenidos",
    loadLabel: "Carga",
    workshopLabel: "Workshop",
    items: [
      {
        tag: "Onboarding",
        title: "Fundamental Workshops Overview",
        subtitle: "Mapa del territorio antes de pisarlo.",
        desc: "Quincena de arranque. Recorre la estructura del programa, sitúa los tres workshops y plantea el proyecto de curso para que cada estudiante llegue al primer módulo con su pregunta ya formulada. No es introductorio en el sentido suave: es donde se decide qué se va a defender en julio.",
        topics: ["Estructura del máster", "Workflows transversales", "Final Course Project", "Asignación de mentores", "Statement de intereses"],
        workshopSession: "Pre-Workshop 1",
      },
      {
        tag: "Workshop 1",
        title: "Fundamentals / AI Setups",
        subtitle: "Todo lo que aguanta el resto del programa.",
        desc: "Programación básica, estructuras de datos y montaje del entorno de IA. Aquí no se hacen demos vistosas: se monta la base con la que cada estudiante va a trabajar durante los cinco meses. Quien salta este módulo paga interés compuesto el resto del curso.",
        topics: ["Programming 1", "Estructuras de datos", "Bases de datos", "Data scrapping", "AI Concepts", "AI Environment Setup", "MCPs"],
        workshopSession: "Masterclass + Kickstart + Follow-up + Final",
      },
      {
        tag: "Workshop 1",
        title: "AI Territory",
        subtitle: "Estrategias para el territorio con IA.",
        desc: "El territorio entendido como dato: topografía, paisaje, ciudad. El módulo enseña a leer y producir información geográfica con notebooks y modelos, no a comprar layers. La meta es que cada estudiante pueda construir su capa territorial sin depender del visor que le pasen.",
        topics: ["GIS", "Geolocated data display", "LM Notebooks", "Programming 2", "Topography scrapping", "Landscape modeling", "Smart city modelling", "MCPs 2"],
        workshopSession: "1 sesión · 2.5h + Q&A",
      },
      {
        tag: "Workshop 1",
        title: "AI Modeling",
        subtitle: "Del concepto al modelo usable — prototipado rápido asistido por IA.",
        desc: "Crear, modificar y controlar geometría con IA. De mallas, NURBS y SubDs a workflows de modelado rápido y herramientas topológicas — el módulo construye el kit necesario para generar y adaptar formas complejas a velocidad de diseño.",
        topics: ["Meshes / NURBS / SubDs", "Fast modelling techniques", "Topology and modelling aids"],
        workshopSession: "1 sesión · 2.5h + Q&A",
      },
      {
        tag: "Workshop 2",
        title: "AI Prototyping",
        subtitle: "Programación visual asistida por IA.",
        desc: "Aquí se decide cómo se va a prototipar el resto del programa. Programación visual, scripting asistido, paramétrico contra código. El módulo obliga a elegir herramienta y método para cada situación, en lugar de defender por inercia la que ya se conoce.",
        topics: ["Visual Programming", "Advanced Prototypes", "AI assisted scripting", "Parametric vs Code", "Topologies vs typologies", "Procedural Modelling", "Deterministic vs Stochastic", "Rules as Tools"],
        workshopSession: "Workshop 2 — Masterclass",
      },
      {
        tag: "Workshop 2",
        title: "AI Simulation",
        subtitle: "Simular mundos sin engañarse.",
        desc: "Simulación multidisciplinar con IA: estructura, ambiente, flujos, optimización. El énfasis está en los límites — qué simula bien la red, qué hace mejor un FEM clásico, cuándo conviene un sistema multiagente. Aprender a validar resultados es la mitad del módulo.",
        topics: ["Simulation types & cost", "Smart workflows", "Optimization algorithms", "AI result validation", "Alternative simulations", "Finite Element Models", "ML / EVO / EMO / AI", "Multiagent systems"],
        workshopSession: "1 sesión · 2.5h + Q&A",
      },
      {
        tag: "Workshop 3",
        title: "AI Communication",
        subtitle: "Imagen, vídeo e inmersión.",
        desc: "Producción de imagen y vídeo con modelos generativos, vuelta del audiovisual al modelo 3D, ambientes inmersivos. La pregunta del módulo no es cómo generar render bonito, sino cómo construir un lenguaje visual coherente para un proyecto de IA aplicada al medio construido.",
        topics: ["AI image tooling", "AI image models", "Model to Image", "Image to Video", "Video + image to model", "Image to World"],
        workshopSession: "Workshop 3 — Masterclass",
      },
      {
        tag: "Workshop 3",
        title: "AI Documentation",
        subtitle: "BIM, datos y gestión de la información.",
        desc: "Lo que no se documenta no existe en obra. El módulo trabaja BIM avanzado, entidades, formatos de intercambio y drafting asistido por IA. Cubre también gestión documental y la frontera con robótica y construcción.",
        topics: ["Advanced BIM entities", "Data management & formats", "Details, Materials, Articulations", "Construction, Constraints & Robotics 101", "BIM Super-Integrations", "AI Driven Drafting"],
        workshopSession: "1 sesión · 2.5h + Q&A",
      },
      {
        tag: "Workshop 3",
        title: "AI Digital Fabrication",
        subtitle: "Del modelo a la pieza física.",
        desc: "Fabricación digital avanzada, robótica y piezas complejas. El módulo cierra el circuito digital — físico — digital: el modelo se construye, se mide y vuelve al sistema corregido. Robótica 101, gcode y workflows de optimización pensados para el taller.",
        topics: ["From Digital to Physical and back", "Smart workflows", "Optimization for DIGFAB", "Robotics 101", "3D printing, GCodes & paths"],
        workshopSession: "1 sesión · 2.5h + Q&A",
      },
      {
        tag: "Final Project",
        title: "AI Integration",
        subtitle: "Ecosistema multimodal a medida.",
        desc: "El módulo de cierre no añade temas nuevos: los conecta. Cada estudiante integra herramientas, datos, modelos y workflows de los ocho módulos anteriores en un ecosistema propio que defenderá ante el jurado final.",
        topics: ["Integración multimodal", "Bespoke AI Workflows", "Final Course Project", "Final Jury"],
        workshopSession: "Final Jury",
      },
    ],
  },
  workshops: {
    sectionTitle: "tres workshops.",
    sectionSubtitle: "3 jurados · 3 hitos",
    sectionDesc:
      "Cada workshop es un sprint intensivo donde los módulos anteriores convergen en un proyecto único defendido. Tres jurados, tres hitos, un arco continuo.",
    weekLabel: "Semana",
    items: [
      {
        title: "AI Parametricism\n& Systems",
        weeks: ["Setup & arranque", "Análisis territorial", "Sprint de modelado", "Revisión & jurado"],
      },
      {
        title: "AI Powered Design\n& Simulations",
        weeks: ["Setup de prototipado", "Sprint de simulación", "Optimización", "Revisión final"],
      },
      {
        title: "Bespoke AI",
        weeks: ["Lenguaje visual", "BIM & docs", "Fabricación", "Integración & jurado"],
      },
    ],
  },
  footer: {
    tagline:
      "Máster en Mundos Artificiales Inteligentes. Programa de posgrado en IA espacial y modelado del mundo físico para el sector AEC.",
    programLabel: "Programa",
    programItems: ["Foundations", "Advanced", "Proyecto Final"],
    applyLabel: "Aplicar",
    applyBtn: "habla con un asesor →",
  },
  miniChat: {
    label: "miaw",
    cta: "pregunta algo →",
    placeholder: "inicia una conversación",
  },
};

const fr: FoundationsT = {
  nav: {
    timeline: "Calendrier",
    modules: "Modules",
    workshops: "Ateliers",
    howToApply: "Comment postuler",
  },
  hero: {
    metaLeft: "Master en Mondes Artificiels Intelligents",
    metaRight: "Programme 01 — Fondations",
    titleLine1: "Fondements des",
    titleLine2: "mondes intelligents.",
    premise: [
      {
        label: "Prémisse",
        text: "Construire les outils, les données et les modes de pensée nécessaires à un projet opérant avec l'IA dans le milieu construit. De la programmation de base au jumeau numérique, sans sauter les fondations.",
      },
      {
        label: "Pour qui",
        text: "Architectes, urbanistes, ingénieurs et designers souhaitant accéder à MIAW Advanced ou au Projet Final avec de vraies bases techniques, pas seulement du vocabulaire.",
      },
      {
        label: "Résultat",
        text: "Un corpus de workflows personnels, défendus dans trois ateliers et un projet de cours. Prêts à intégrer Advanced ou à appliquer en pratique.",
      },
    ],
    stats: [
      { label: "ECTS" },
      { label: "Charge totale" },
      { label: "Modules" },
      { label: "Ateliers" },
      { label: "Mois" },
    ],
    cta: "Comment postuler →",
  },
  timeline: {
    title: "calendrier",
    subtitle: "9 modules · 8 quinzaines",
    monthLabels: ["Mois 1", "Mois 2", "Mois 3", "Mois 4", "Mois 5+"],
  },
  modules: {
    sectionTitle: "neuf modules.",
    sectionDesc:
      "Chaque module est une quinzaine de travail : 40 heures, une masterclass d'expert, du contenu pratique et un lien clair avec l'un des trois ateliers du programme. La progression va des fondations (données, programmation, SIG) à la modélisation, la simulation, la fabrication et finalement l'intégration dans un écosystème sur mesure.",
    contentsLabel: "Contenu",
    loadLabel: "Charge",
    workshopLabel: "Atelier",
    items: [
      {
        tag: "Onboarding",
        title: "Fundamental Workshops Overview",
        subtitle: "Cartographier le territoire avant de le fouler.",
        desc: "Quinzaine de lancement. Parcourir la structure du programme, situer les trois ateliers et poser le projet de cours afin que chaque étudiant arrive au premier module avec sa question déjà formulée. Ce n'est pas une introduction douce — c'est là qu'on décide ce qu'on défendra en juillet.",
        topics: ["Structure du programme", "Workflows transversaux", "Projet de cours final", "Attribution des mentors", "Déclaration d'intérêts"],
        workshopSession: "Pré-Atelier 1",
      },
      {
        tag: "Atelier 1",
        title: "Fundamentals / AI Setups",
        subtitle: "Ce sur quoi repose tout le reste du programme.",
        desc: "Programmation de base, structures de données et mise en place de l'environnement IA. Ici, pas de démos spectaculaires : on construit la base qui servira pendant cinq mois. Qui saute ce module paiera des intérêts composés pour le reste du cours.",
        topics: ["Programmation 1", "Structures de données", "Bases de données", "Web scraping", "Concepts IA", "Configuration environnement IA", "MCPs"],
        workshopSession: "Masterclass + Kickstart + Suivi + Final",
      },
      {
        tag: "Atelier 1",
        title: "AI Territory",
        subtitle: "Stratégies territoriales avec l'IA.",
        desc: "Le territoire compris comme donnée : topographie, paysage, ville. Le module apprend à lire et produire de l'information géographique avec des notebooks et des modèles. L'objectif : construire sa propre couche territoriale sans dépendre d'un visualiseur tiers.",
        topics: ["SIG", "Affichage de données géolocalisées", "LM Notebooks", "Programmation 2", "Scraping topographique", "Modélisation paysagère", "Modélisation smart city", "MCPs 2"],
        workshopSession: "1 session · 2,5h + Q&A",
      },
      {
        tag: "Atelier 1",
        title: "AI Modeling",
        subtitle: "Du concept au modèle utilisable.",
        desc: "Créer, modifier, capturer et contrôler la géométrie avec l'IA. Le module croise maillages, NURBS et SubDs avec des LoRAs et du BIM, et introduit l'ingénierie inverse pour passer d'une photo ou d'un nuage de points à un modèle éditable.",
        topics: ["Meshes / NURBS / SubDs", "2D vers 3D — LoRAs", "BIM piloté par IA / OpenBIM", "Ingénierie inverse"],
        workshopSession: "1 session · 2,5h + Q&A",
      },
      {
        tag: "Atelier 2",
        title: "AI Prototyping",
        subtitle: "Programmation visuelle assistée par IA.",
        desc: "C'est ici qu'on décide comment prototyper pour le reste du programme. Programmation visuelle, scripting assisté, paramétrique vs code. Le module oblige à choisir outil et méthode selon la situation, plutôt que de défendre par habitude ce que l'on connaît déjà.",
        topics: ["Programmation visuelle", "Prototypes avancés", "Scripting assisté par IA", "Paramétrique vs Code", "Topologies vs typologies", "Modélisation procédurale", "Déterministe vs Stochastique", "Règles comme outils"],
        workshopSession: "Atelier 2 — Masterclass",
      },
      {
        tag: "Atelier 2",
        title: "AI Simulation",
        subtitle: "Simuler des mondes sans se tromper.",
        desc: "Simulation multidisciplinaire avec l'IA : structure, environnement, flux, optimisation. L'accent est mis sur les limites — ce que le réseau simule bien, ce qu'un FEM classique fait mieux, quand un système multi-agents est le bon choix. Apprendre à valider les résultats représente la moitié du module.",
        topics: ["Types de simulation & coût", "Workflows intelligents", "Algorithmes d'optimisation", "Validation des résultats IA", "Modèles éléments finis", "ML / EVO / EMO / IA", "Systèmes multi-agents"],
        workshopSession: "1 session · 2,5h + Q&A",
      },
      {
        tag: "Atelier 3",
        title: "AI Communication",
        subtitle: "Image, vidéo et immersion.",
        desc: "Production d'images et de vidéos avec des modèles génératifs, retour de l'audiovisuel au modèle 3D, environnements immersifs. La question du module n'est pas comment générer un beau rendu, mais comment construire un langage visuel cohérent pour un projet IA appliqué au milieu construit.",
        topics: ["Outils image IA", "Modèles image IA", "Modèle vers image", "Image vers vidéo", "Vidéo + image vers modèle", "Image vers monde"],
        workshopSession: "Atelier 3 — Masterclass",
      },
      {
        tag: "Atelier 3",
        title: "AI Documentation",
        subtitle: "BIM, données et gestion de l'information.",
        desc: "Ce qui n'est pas documenté n'existe pas sur le chantier. Le module aborde le BIM avancé, les entités, les formats d'échange et le dessin assisté par IA. Il couvre aussi la gestion documentaire et la frontière avec la robotique et la construction.",
        topics: ["Entités BIM avancées", "Gestion des données & formats", "Détails, Matériaux, Articulations", "Construction & Robotique 101", "Super-intégrations BIM", "Dessin assisté par IA"],
        workshopSession: "1 session · 2,5h + Q&A",
      },
      {
        tag: "Atelier 3",
        title: "AI Digital Fabrication",
        subtitle: "Du modèle à la pièce physique.",
        desc: "Fabrication numérique avancée, robotique et pièces complexes. Le module ferme la boucle numérique–physique–numérique : le modèle est construit, mesuré et renvoyé au système corrigé. Robotique 101, gcode et workflows d'optimisation conçus pour l'atelier.",
        topics: ["Du numérique au physique et retour", "Workflows intelligents", "Optimisation pour DIGFAB", "Robotique 101", "Impression 3D, GCodes & trajectoires"],
        workshopSession: "1 session · 2,5h + Q&A",
      },
      {
        tag: "Projet Final",
        title: "AI Integration",
        subtitle: "Un écosystème multimodal sur mesure.",
        desc: "Le module de clôture n'ajoute pas de nouveaux sujets — il les connecte. Chaque étudiant intègre outils, données, modèles et workflows des huit modules précédents dans un écosystème personnel qu'il défendra devant le jury final.",
        topics: ["Intégration multimodale", "Workflows IA sur mesure", "Projet de cours final", "Jury final"],
        workshopSession: "Jury Final",
      },
    ],
  },
  workshops: {
    sectionTitle: "trois ateliers.",
    sectionSubtitle: "3 jurys · 3 jalons",
    sectionDesc:
      "Chaque atelier est un sprint intensif où les modules précédents convergent en un seul projet défendu. Trois jurys, trois jalons, un arc continu.",
    weekLabel: "Semaine",
    items: [
      {
        title: "AI Parametricism\n& Systems",
        weeks: ["Setup & lancement", "Analyse territoriale", "Sprint de modélisation", "Révision & jury"],
      },
      {
        title: "AI Powered Design\n& Simulations",
        weeks: ["Setup prototypage", "Sprint simulation", "Optimisation", "Révision finale"],
      },
      {
        title: "Bespoke AI",
        weeks: ["Langage visuel", "BIM & docs", "Fabrication", "Intégration & jury"],
      },
    ],
  },
  footer: {
    tagline:
      "Master en Mondes Artificiels Intelligents. Programme de troisième cycle en IA spatiale et modélisation du monde physique pour le secteur AEC.",
    programLabel: "Programme",
    programItems: ["Fondations", "Advanced", "Projet Final"],
    applyLabel: "Postuler",
    applyBtn: "parler à un conseiller →",
  },
  miniChat: {
    label: "miaw",
    cta: "posez une question →",
    placeholder: "démarrer une conversation",
  },
};

const de: FoundationsT = {
  nav: {
    timeline: "Zeitplan",
    modules: "Module",
    workshops: "Workshops",
    howToApply: "Bewerbung",
  },
  hero: {
    metaLeft: "Master in Intelligenten Künstlichen Welten",
    metaRight: "Programm 01 — Grundlagen",
    titleLine1: "Grundlagen der",
    titleLine2: "intelligenten welten.",
    premise: [
      {
        label: "Prämisse",
        text: "Die Werkzeuge, Daten und Denkweisen aufbauen, die ein Projekt benötigt, das mit KI in der gebauten Umwelt operiert. Von der Grundprogrammierung bis zum digitalen Zwilling — ohne die Fundamente zu überspringen.",
      },
      {
        label: "Für wen",
        text: "Architekten, Stadtplaner, Ingenieure und Designer, die MIAW Advanced oder das Abschlussprojekt mit echter technischer Grundlage erreichen wollen — nicht nur mit Vokabular.",
      },
      {
        label: "Ergebnis",
        text: "Ein Korpus eigener Workflows, in drei Workshops und einem Kursprojekt verteidigt. Bereit für Advanced oder die Anwendung in der Praxis.",
      },
    ],
    stats: [
      { label: "ECTS" },
      { label: "Gesamtlast" },
      { label: "Module" },
      { label: "Workshops" },
      { label: "Monate" },
    ],
    cta: "Zur Bewerbung →",
  },
  timeline: {
    title: "zeitplan",
    subtitle: "9 Module · 8 Vierzehntage",
    monthLabels: ["Monat 1", "Monat 2", "Monat 3", "Monat 4", "Monat 5+"],
  },
  modules: {
    sectionTitle: "neun module.",
    sectionDesc:
      "Jedes Modul ist eine zweiwöchige Arbeitseinheit: 40 Stunden, eine Experten-Masterclass, praktische Inhalte und ein klarer Bezug zu einem der drei Programm-Workshops. Der Fortschritt geht von den Grundlagen (Daten, Programmierung, GIS) über Modellierung, Simulation, Fertigung bis hin zur Integration in ein maßgeschneidertes Ökosystem.",
    contentsLabel: "Inhalt",
    loadLabel: "Last",
    workshopLabel: "Workshop",
    items: [
      {
        tag: "Onboarding",
        title: "Fundamental Workshops Overview",
        subtitle: "Das Terrain kartieren, bevor man es betritt.",
        desc: "Startfortnight. Programmstruktur durchgehen, die drei Workshops einordnen und das Kursprojekt skizzieren, damit jeder Studierende zum ersten Modul mit einer bereits formulierten Frage kommt. Das ist keine sanfte Einführung — hier entscheidet sich, was im Juli verteidigt wird.",
        topics: ["Programmstruktur", "Transversale Workflows", "Abschlusskursprojekt", "Mentorzuweisung", "Interessenserklärung"],
        workshopSession: "Pre-Workshop 1",
      },
      {
        tag: "Workshop 1",
        title: "Fundamentals / AI Setups",
        subtitle: "Alles, worauf der Rest des Programms steht.",
        desc: "Grundprogrammierung, Datenstrukturen und KI-Umgebungsaufbau. Keine spektakulären Demos hier — das Fundament wird gelegt, das fünf Monate lang genutzt wird. Wer dieses Modul überspringt, zahlt für den Rest des Kurses Zinseszinsen.",
        topics: ["Programmierung 1", "Datenstrukturen", "Datenbanken", "Data Scraping", "KI-Konzepte", "KI-Umgebungseinrichtung", "MCPs"],
        workshopSession: "Masterclass + Kickstart + Follow-up + Final",
      },
      {
        tag: "Workshop 1",
        title: "AI Territory",
        subtitle: "Strategien für das Territorium mit KI.",
        desc: "Territorium als Datum verstanden: Topographie, Landschaft, Stadt. Das Modul lehrt, geografische Informationen mit Notebooks und Modellen zu lesen und zu produzieren — nicht Ebenen zu kaufen. Das Ziel: eine eigene territoriale Ebene ohne externe Abhängigkeiten aufbauen.",
        topics: ["GIS", "Georeferenzierte Datenanzeige", "LM Notebooks", "Programmierung 2", "Topographie-Scraping", "Landschaftsmodellierung", "Smart City Modellierung", "MCPs 2"],
        workshopSession: "1 Sitzung · 2,5h + Q&A",
      },
      {
        tag: "Workshop 1",
        title: "AI Modeling",
        subtitle: "Vom Konzept zum nutzbaren Modell.",
        desc: "Geometrie mit KI erstellen, modifizieren, erfassen und steuern. Das Modul verbindet Meshes, NURBS und SubDs mit LoRAs und BIM und führt Reverse Engineering ein, um von Fotos oder Punktwolken zu bearbeitbaren Modellen zu gelangen.",
        topics: ["Meshes / NURBS / SubDs", "2D zu 3D — LoRAs", "KI-gesteuertes BIM / OpenBIM", "Reverse Engineering"],
        workshopSession: "1 Sitzung · 2,5h + Q&A",
      },
      {
        tag: "Workshop 2",
        title: "AI Prototyping",
        subtitle: "KI-gestützte visuelle Programmierung.",
        desc: "Hier wird entschieden, wie für den Rest des Programms prototypiert wird. Visuelle Programmierung, assistiertes Scripting, Parametrik vs. Code. Das Modul zwingt dazu, Werkzeug und Methode für jede Situation zu wählen, statt aus Gewohnheit das Bekannte zu verteidigen.",
        topics: ["Visuelle Programmierung", "Erweiterte Prototypen", "KI-assistiertes Scripting", "Parametrik vs. Code", "Topologien vs. Typologien", "Prozedurale Modellierung", "Deterministisch vs. Stochastisch", "Regeln als Werkzeuge"],
        workshopSession: "Workshop 2 — Masterclass",
      },
      {
        tag: "Workshop 2",
        title: "AI Simulation",
        subtitle: "Welten simulieren ohne sich zu täuschen.",
        desc: "Multidisziplinäre Simulation mit KI: Struktur, Umgebung, Flüsse, Optimierung. Der Fokus liegt auf den Grenzen — was ein Netz gut simuliert, was ein klassisches FEM besser macht, wann ein Multi-Agenten-System angebracht ist. Ergebnisse zu validieren ist die Hälfte des Moduls.",
        topics: ["Simulationstypen & Kosten", "Intelligente Workflows", "Optimierungsalgorithmen", "KI-Ergebnisvalidierung", "Finite-Elemente-Modelle", "ML / EVO / EMO / KI", "Multi-Agenten-Systeme"],
        workshopSession: "1 Sitzung · 2,5h + Q&A",
      },
      {
        tag: "Workshop 3",
        title: "AI Communication",
        subtitle: "Bild, Video und Immersion.",
        desc: "Bild- und Videoproduktion mit generativen Modellen, Rückkehr vom Audiovisuellen zum 3D-Modell, immersive Umgebungen. Die Frage des Moduls ist nicht, wie man hübsche Renderings erzeugt, sondern wie man eine kohärente visuelle Sprache für ein KI-Projekt in der gebauten Umwelt aufbaut.",
        topics: ["KI-Bildwerkzeuge", "KI-Bildmodelle", "Modell zu Bild", "Bild zu Video", "Video + Bild zu Modell", "Bild zu Welt"],
        workshopSession: "Workshop 3 — Masterclass",
      },
      {
        tag: "Workshop 3",
        title: "AI Documentation",
        subtitle: "BIM, Daten und Informationsmanagement.",
        desc: "Was nicht dokumentiert ist, existiert auf der Baustelle nicht. Das Modul befasst sich mit erweitertem BIM, Entitäten, Austauschformaten und KI-gestütztem Zeichnen. Auch Dokumentenmanagement und die Grenze zu Robotik und Bauwesen werden behandelt.",
        topics: ["Erweiterte BIM-Entitäten", "Datenverwaltung & Formate", "Details, Materialien, Artikulationen", "Bau & Robotik 101", "BIM-Super-Integrationen", "KI-gesteuertes Zeichnen"],
        workshopSession: "1 Sitzung · 2,5h + Q&A",
      },
      {
        tag: "Workshop 3",
        title: "AI Digital Fabrication",
        subtitle: "Vom Modell zum physischen Objekt.",
        desc: "Erweiterte digitale Fertigung, Robotik und komplexe Teile. Das Modul schließt den digital–physisch–digitalen Kreislauf: Das Modell wird gebaut, gemessen und korrigiert ins System zurückgeführt. Robotik 101, Gcode und für die Werkstatt konzipierte Optimierungs-Workflows.",
        topics: ["Von Digital zu Physisch und zurück", "Intelligente Workflows", "Optimierung für DIGFAB", "Robotik 101", "3D-Druck, GCodes & Pfade"],
        workshopSession: "1 Sitzung · 2,5h + Q&A",
      },
      {
        tag: "Abschlussprojekt",
        title: "AI Integration",
        subtitle: "Ein maßgeschneidertes multimodales Ökosystem.",
        desc: "Das Abschlussmodul fügt keine neuen Themen hinzu — es verbindet sie. Jeder Studierende integriert Werkzeuge, Daten, Modelle und Workflows aus den acht vorangegangenen Modulen in ein persönliches Ökosystem, das vor der Abschlussjury verteidigt wird.",
        topics: ["Multimodale Integration", "Maßgeschneiderte KI-Workflows", "Abschlusskursprojekt", "Abschlussjury"],
        workshopSession: "Abschlussjury",
      },
    ],
  },
  workshops: {
    sectionTitle: "drei workshops.",
    sectionSubtitle: "3 Jurys · 3 Meilensteine",
    sectionDesc:
      "Jeder Workshop ist ein intensiver Sprint, in dem die vorangegangenen Module in einem einzigen verteidigten Projekt konvergieren. Drei Jurys, drei Meilensteine, ein kontinuierlicher Bogen.",
    weekLabel: "Woche",
    items: [
      {
        title: "AI Parametricism\n& Systems",
        weeks: ["Setup & Kickstart", "Territoriumsanalyse", "Modellierungs-Sprint", "Überprüfung & Jury"],
      },
      {
        title: "AI Powered Design\n& Simulations",
        weeks: ["Prototyping-Setup", "Simulations-Sprint", "Optimierung", "Abschlussprüfung"],
      },
      {
        title: "Bespoke AI",
        weeks: ["Visuelle Sprache", "BIM & Docs", "Fertigung", "Integration & Jury"],
      },
    ],
  },
  footer: {
    tagline:
      "Master in Intelligenten Künstlichen Welten. Postgraduiertenprogramm in räumlicher KI und Modellierung der physischen Welt für den AEC-Sektor.",
    programLabel: "Programm",
    programItems: ["Grundlagen", "Advanced", "Abschlussprojekt"],
    applyLabel: "Bewerben",
    applyBtn: "mit einem Berater sprechen →",
  },
  miniChat: {
    label: "miaw",
    cta: "frag etwas →",
    placeholder: "Gespräch starten",
  },
};

const pt: FoundationsT = {
  nav: {
    timeline: "Cronograma",
    modules: "Módulos",
    workshops: "Workshops",
    howToApply: "Como candidatar",
  },
  hero: {
    metaLeft: "Mestrado em Mundos Artificiais Inteligentes",
    metaRight: "Programa 01 — Fundamentos",
    titleLine1: "Fundamentos dos",
    titleLine2: "mundos inteligentes.",
    premise: [
      {
        label: "Premissa",
        text: "Construir as ferramentas, os dados e as formas de pensar necessárias para um projeto que opera com IA no ambiente construído. Da programação básica ao gémeo digital, sem saltar os fundamentos.",
      },
      {
        label: "Para quem",
        text: "Arquitetos, urbanistas, engenheiros e designers que querem chegar ao MIAW Advanced ou ao Projeto Final com base técnica real — não apenas vocabulário.",
      },
      {
        label: "Resultado",
        text: "Um conjunto de workflows próprios, defendidos em três workshops e um projeto de curso. Prontos para entrar no Advanced ou aplicar na prática.",
      },
    ],
    stats: [
      { label: "ECTS" },
      { label: "Carga total" },
      { label: "Módulos" },
      { label: "Workshops" },
      { label: "Meses" },
    ],
    cta: "Como candidatar →",
  },
  timeline: {
    title: "cronograma",
    subtitle: "9 módulos · 8 quinzenas",
    monthLabels: ["Mês 1", "Mês 2", "Mês 3", "Mês 4", "Mês 5+"],
  },
  modules: {
    sectionTitle: "nove módulos.",
    sectionDesc:
      "Cada módulo é uma quinzena de trabalho: 40 horas, uma masterclass de especialista, conteúdo prático e uma ligação clara a um dos três workshops do programa. A progressão vai dos fundamentos (dados, programação, SIG) para a modelação, simulação, fabricação e, finalmente, integração num ecossistema à medida.",
    contentsLabel: "Conteúdos",
    loadLabel: "Carga",
    workshopLabel: "Workshop",
    items: [
      {
        tag: "Onboarding",
        title: "Fundamental Workshops Overview",
        subtitle: "Mapear o território antes de o pisar.",
        desc: "Quinzena de arranque. Percorrer a estrutura do programa, situar os três workshops e delinear o projeto de curso para que cada estudante chegue ao primeiro módulo com a sua questão já formulada. Não é uma introdução suave — é onde se decide o que se vai defender em julho.",
        topics: ["Estrutura do programa", "Workflows transversais", "Projeto de curso final", "Atribuição de mentores", "Declaração de interesses"],
        workshopSession: "Pré-Workshop 1",
      },
      {
        tag: "Workshop 1",
        title: "Fundamentals / AI Setups",
        subtitle: "Tudo o que sustenta o resto do programa.",
        desc: "Programação básica, estruturas de dados e configuração do ambiente de IA. Sem demos vistosas aqui — constrói-se a base que será usada durante cinco meses. Quem salta este módulo paga juros compostos no resto do curso.",
        topics: ["Programação 1", "Estruturas de dados", "Bases de dados", "Web scraping", "Conceitos de IA", "Configuração de ambiente IA", "MCPs"],
        workshopSession: "Masterclass + Kickstart + Acompanhamento + Final",
      },
      {
        tag: "Workshop 1",
        title: "AI Territory",
        subtitle: "Estratégias territoriais com IA.",
        desc: "O território entendido como dado: topografia, paisagem, cidade. O módulo ensina a ler e produzir informação geográfica com notebooks e modelos — não a comprar layers. O objetivo: construir a própria camada territorial sem depender de um visualizador externo.",
        topics: ["SIG", "Visualização de dados geolocalizados", "LM Notebooks", "Programação 2", "Scraping topográfico", "Modelação de paisagem", "Modelação de smart city", "MCPs 2"],
        workshopSession: "1 sessão · 2,5h + Q&A",
      },
      {
        tag: "Workshop 1",
        title: "AI Modeling",
        subtitle: "Do conceito ao modelo utilizável.",
        desc: "Criar, modificar, capturar e controlar geometria com IA. O módulo cruza malhas, NURBS e SubDs com LoRAs e BIM, e introduz engenharia inversa para passar de fotografia ou nuvem de pontos a um modelo editável.",
        topics: ["Meshes / NURBS / SubDs", "2D para 3D — LoRAs", "BIM orientado por IA / OpenBIM", "Engenharia inversa"],
        workshopSession: "1 sessão · 2,5h + Q&A",
      },
      {
        tag: "Workshop 2",
        title: "AI Prototyping",
        subtitle: "Programação visual assistida por IA.",
        desc: "É aqui que se decide como prototipar para o resto do programa. Programação visual, scripting assistido, paramétrico vs. código. O módulo obriga a escolher ferramenta e método para cada situação, em vez de defender por inércia o que já se conhece.",
        topics: ["Programação visual", "Protótipos avançados", "Scripting assistido por IA", "Paramétrico vs Código", "Topologias vs tipologias", "Modelação procedural", "Determinístico vs Estocástico", "Regras como ferramentas"],
        workshopSession: "Workshop 2 — Masterclass",
      },
      {
        tag: "Workshop 2",
        title: "AI Simulation",
        subtitle: "Simular mundos sem se enganar.",
        desc: "Simulação multidisciplinar com IA: estrutura, ambiente, fluxos, otimização. A ênfase está nos limites — o que uma rede simula bem, o que um FEM clássico faz melhor, quando um sistema multiagente é a escolha certa. Aprender a validar resultados é metade do módulo.",
        topics: ["Tipos de simulação & custo", "Workflows inteligentes", "Algoritmos de otimização", "Validação de resultados IA", "Modelos de elementos finitos", "ML / EVO / EMO / IA", "Sistemas multiagente"],
        workshopSession: "1 sessão · 2,5h + Q&A",
      },
      {
        tag: "Workshop 3",
        title: "AI Communication",
        subtitle: "Imagem, vídeo e imersão.",
        desc: "Produção de imagem e vídeo com modelos generativos, retorno do audiovisual ao modelo 3D, ambientes imersivos. A questão do módulo não é como gerar um render bonito, mas como construir uma linguagem visual coerente para um projeto de IA aplicada ao ambiente construído.",
        topics: ["Ferramentas de imagem IA", "Modelos de imagem IA", "Modelo para imagem", "Imagem para vídeo", "Vídeo + imagem para modelo", "Imagem para mundo"],
        workshopSession: "Workshop 3 — Masterclass",
      },
      {
        tag: "Workshop 3",
        title: "AI Documentation",
        subtitle: "BIM, dados e gestão da informação.",
        desc: "O que não é documentado não existe em obra. O módulo trabalha BIM avançado, entidades, formatos de troca e desenho assistido por IA. Cobre também gestão documental e a fronteira com robótica e construção.",
        topics: ["Entidades BIM avançadas", "Gestão de dados & formatos", "Detalhes, Materiais, Articulações", "Construção & Robótica 101", "Super-integrações BIM", "Desenho assistido por IA"],
        workshopSession: "1 sessão · 2,5h + Q&A",
      },
      {
        tag: "Workshop 3",
        title: "AI Digital Fabrication",
        subtitle: "Do modelo à peça física.",
        desc: "Fabricação digital avançada, robótica e peças complexas. O módulo fecha o ciclo digital–físico–digital: o modelo é construído, medido e devolvido ao sistema corrigido. Robótica 101, gcode e workflows de otimização concebidos para a oficina.",
        topics: ["Do digital ao físico e de volta", "Workflows inteligentes", "Otimização para DIGFAB", "Robótica 101", "Impressão 3D, GCodes & percursos"],
        workshopSession: "1 sessão · 2,5h + Q&A",
      },
      {
        tag: "Projeto Final",
        title: "AI Integration",
        subtitle: "Um ecossistema multimodal à medida.",
        desc: "O módulo de encerramento não acrescenta novos temas — conecta-os. Cada estudante integra ferramentas, dados, modelos e workflows dos oito módulos anteriores num ecossistema próprio que defenderá perante o júri final.",
        topics: ["Integração multimodal", "Workflows de IA à medida", "Projeto de curso final", "Júri final"],
        workshopSession: "Júri Final",
      },
    ],
  },
  workshops: {
    sectionTitle: "três workshops.",
    sectionSubtitle: "3 júris · 3 marcos",
    sectionDesc:
      "Cada workshop é um sprint intensivo onde os módulos anteriores convergem num único projeto defendido. Três júris, três marcos, um arco contínuo.",
    weekLabel: "Semana",
    items: [
      {
        title: "AI Parametricism\n& Systems",
        weeks: ["Setup & arranque", "Análise territorial", "Sprint de modelação", "Revisão & júri"],
      },
      {
        title: "AI Powered Design\n& Simulations",
        weeks: ["Setup de prototipagem", "Sprint de simulação", "Otimização", "Revisão final"],
      },
      {
        title: "Bespoke AI",
        weeks: ["Linguagem visual", "BIM & docs", "Fabricação", "Integração & júri"],
      },
    ],
  },
  footer: {
    tagline:
      "Mestrado em Mundos Artificiais Inteligentes. Programa de pós-graduação em IA espacial e modelação do mundo físico para o setor AEC.",
    programLabel: "Programa",
    programItems: ["Fundamentos", "Advanced", "Projeto Final"],
    applyLabel: "Candidatar",
    applyBtn: "falar com um orientador →",
  },
  miniChat: {
    label: "miaw",
    cta: "pergunte algo →",
    placeholder: "iniciar uma conversa",
  },
};

const zh: FoundationsT = {
  nav: {
    timeline: "时间轴",
    modules: "模块",
    workshops: "工作坊",
    howToApply: "如何申请",
  },
  hero: {
    metaLeft: "智能人工世界硕士",
    metaRight: "课程 01 — 基础",
    titleLine1: "智能世界的",
    titleLine2: "基础。",
    premise: [
      {
        label: "前提",
        text: "构建在建筑环境中使用人工智能所需的工具、数据和思维方式。从基础编程到数字孪生，不跳过任何基础。",
      },
      {
        label: "适合谁",
        text: "希望以真实技术基础（而非仅凭词汇）进入 MIAW 进阶课程或最终项目的建筑师、城市规划师、工程师和设计师。",
      },
      {
        label: "成果",
        text: "一套个人工作流程，在三个工作坊和一个课程项目中进行答辩。随时可进入进阶课程或付诸实践。",
      },
    ],
    stats: [
      { label: "学分" },
      { label: "总学时" },
      { label: "模块" },
      { label: "工作坊" },
      { label: "月份" },
    ],
    cta: "如何申请 →",
  },
  timeline: {
    title: "时间轴",
    subtitle: "9 个模块 · 8 个双周",
    monthLabels: ["第1月", "第2月", "第3月", "第4月", "第5月+"],
  },
  modules: {
    sectionTitle: "九个模块。",
    sectionDesc:
      "每个模块为期两周：40 小时、一场专家大师课、实践内容，并与三个工作坊之一有明确关联。课程从基础（数据、编程、GIS）逐步推进至建模、仿真、制造，最终整合成定制化生态系统。",
    contentsLabel: "内容",
    loadLabel: "学时",
    workshopLabel: "工作坊",
    items: [
      {
        tag: "入学",
        title: "基础工作坊概览",
        subtitle: "踏入之前先绘制地图。",
        desc: "启动双周。了解课程结构，定位三个工作坊，制定课程项目框架，确保每位学生在进入第一个模块时已有明确问题。这不是温和的介绍——而是决定七月份答辩内容的时刻。",
        topics: ["课程结构", "横向工作流", "最终课程项目", "导师分配", "兴趣陈述"],
        workshopSession: "预工作坊 1",
      },
      {
        tag: "工作坊 1",
        title: "基础 / AI 环境搭建",
        subtitle: "支撑整个课程的基础。",
        desc: "基础编程、数据结构与 AI 环境搭建。这里没有炫酷的演示——而是构建接下来五个月使用的基础。跳过此模块将为课程其余部分付出复利代价。",
        topics: ["编程 1", "数据结构", "数据库", "数据抓取", "AI 概念", "AI 环境搭建", "MCPs"],
        workshopSession: "大师课 + 启动 + 跟进 + 决赛",
      },
      {
        tag: "工作坊 1",
        title: "AI 地域分析",
        subtitle: "用 AI 进行地域策略研究。",
        desc: "将地域理解为数据：地形、景观、城市。本模块教你用 notebook 和模型读取和生成地理信息，而非购买图层。目标：构建自己的地域图层，不依赖第三方查看工具。",
        topics: ["GIS", "地理定位数据显示", "LM Notebooks", "编程 2", "地形数据抓取", "景观建模", "智慧城市建模", "MCPs 2"],
        workshopSession: "1 场课 · 2.5小时 + 问答",
      },
      {
        tag: "工作坊 1",
        title: "AI 建模",
        subtitle: "从概念到可用模型。",
        desc: "用 AI 创建、修改、捕捉和控制几何形体。本模块将网格、NURBS 和 SubD 与 LoRA 和 BIM 结合，并引入逆向工程——从照片或点云转化为可编辑模型。",
        topics: ["网格 / NURBS / SubD", "2D 转 3D — LoRA", "AI 驱动 BIM / OpenBIM", "逆向工程"],
        workshopSession: "1 场课 · 2.5小时 + 问答",
      },
      {
        tag: "工作坊 2",
        title: "AI 原型设计",
        subtitle: "AI 辅助可视化编程。",
        desc: "决定如何为课程后续内容制作原型的关键模块。可视化编程、辅助脚本、参数化与代码对比。本模块要求你针对不同情境选择工具和方法，而非凭惯性坚持已知内容。",
        topics: ["可视化编程", "高级原型", "AI 辅助脚本", "参数化 vs 代码", "拓扑 vs 类型", "程序化建模", "确定性 vs 随机性", "规则即工具"],
        workshopSession: "工作坊 2 — 大师课",
      },
      {
        tag: "工作坊 2",
        title: "AI 仿真",
        subtitle: "真实地模拟世界。",
        desc: "多学科 AI 仿真：结构、环境、流场、优化。重点在于边界——网络擅长模拟什么，经典有限元更适合什么，何时适合多智能体系统。学会验证结果占模块的一半内容。",
        topics: ["仿真类型与成本", "智能工作流", "优化算法", "AI 结果验证", "有限元模型", "ML / EVO / EMO / AI", "多智能体系统"],
        workshopSession: "1 场课 · 2.5小时 + 问答",
      },
      {
        tag: "工作坊 3",
        title: "AI 传播",
        subtitle: "图像、视频与沉浸式体验。",
        desc: "用生成模型进行图像和视频制作，从视听内容回溯 3D 模型，沉浸式环境。本模块的问题不是如何生成漂亮的渲染图，而是如何为建筑环境中的 AI 项目构建一致的视觉语言。",
        topics: ["AI 图像工具", "AI 图像模型", "模型转图像", "图像转视频", "视频+图像转模型", "图像转世界"],
        workshopSession: "工作坊 3 — 大师课",
      },
      {
        tag: "工作坊 3",
        title: "AI 文档",
        subtitle: "BIM、数据与信息管理。",
        desc: "未记录的内容在工地上不存在。本模块涵盖高级 BIM、实体、交换格式和 AI 辅助绘图，同时涉及文档管理以及与机器人和建造的边界。",
        topics: ["高级 BIM 实体", "数据管理与格式", "细节、材料、节点", "建造与机器人 101", "BIM 超级集成", "AI 辅助绘图"],
        workshopSession: "1 场课 · 2.5小时 + 问答",
      },
      {
        tag: "工作坊 3",
        title: "AI 数字制造",
        subtitle: "从模型到实物。",
        desc: "高级数字制造、机器人与复杂构件。本模块完成数字—实体—数字的闭环：模型被制造、测量并修正后返回系统。机器人 101、G 代码以及为车间设计的优化工作流。",
        topics: ["从数字到实体再回来", "智能工作流", "DIGFAB 优化", "机器人 101", "3D 打印、G 代码与路径"],
        workshopSession: "1 场课 · 2.5小时 + 问答",
      },
      {
        tag: "最终项目",
        title: "AI 整合",
        subtitle: "定制多模态生态系统。",
        desc: "收官模块不增加新主题——而是将其连接。每位学生将前八个模块的工具、数据、模型和工作流整合为个人生态系统，并在最终评审委员会前进行答辩。",
        topics: ["多模态整合", "定制 AI 工作流", "最终课程项目", "最终评审"],
        workshopSession: "最终评审",
      },
    ],
  },
  workshops: {
    sectionTitle: "三个工作坊。",
    sectionSubtitle: "3 场评审 · 3 个里程碑",
    sectionDesc:
      "每个工作坊都是一次密集冲刺，前几个模块的内容在单一答辩项目中汇聚。三场评审，三个里程碑，一条连续的弧线。",
    weekLabel: "第",
    items: [
      {
        title: "AI 参数化\n与系统",
        weeks: ["搭建与启动", "地域分析", "建模冲刺", "评审与答辩"],
      },
      {
        title: "AI 设计\n与仿真",
        weeks: ["原型搭建", "仿真冲刺", "优化", "最终评审"],
      },
      {
        title: "定制 AI",
        weeks: ["视觉语言", "BIM 与文档", "制造", "整合与答辩"],
      },
    ],
  },
  footer: {
    tagline:
      "智能人工世界硕士。面向 AEC 行业的空间 AI 与物理世界建模研究生课程。",
    programLabel: "课程",
    programItems: ["基础", "进阶", "最终项目"],
    applyLabel: "申请",
    applyBtn: "与顾问交流 →",
  },
  miniChat: {
    label: "miaw",
    cta: "随时提问 →",
    placeholder: "开始对话",
  },
};

const ja: FoundationsT = {
  nav: {
    timeline: "タイムライン",
    modules: "モジュール",
    workshops: "ワークショップ",
    howToApply: "出願方法",
  },
  hero: {
    metaLeft: "インテリジェント人工世界修士",
    metaRight: "プログラム 01 — 基礎",
    titleLine1: "インテリジェントな世界の",
    titleLine2: "基礎。",
    premise: [
      {
        label: "前提",
        text: "建築環境でAIを活用するプロジェクトに必要なツール、データ、思考法を構築する。基礎プログラミングからデジタルツインまで、土台を飛ばさずに。",
      },
      {
        label: "対象者",
        text: "語彙だけでなく、真の技術的基礎を持ってMIAWアドバンスまたは最終プロジェクトに臨みたい建築家、都市計画家、エンジニア、デザイナー。",
      },
      {
        label: "成果",
        text: "3つのワークショップとコースプロジェクトで発表された、個人のワークフロー群。アドバンスへの進学または実践への応用に向けて準備完了。",
      },
    ],
    stats: [
      { label: "ECTS" },
      { label: "総学習量" },
      { label: "モジュール" },
      { label: "ワークショップ" },
      { label: "ヶ月" },
    ],
    cta: "出願方法 →",
  },
  timeline: {
    title: "タイムライン",
    subtitle: "9モジュール · 8フォートナイト",
    monthLabels: ["第1月", "第2月", "第3月", "第4月", "第5月+"],
  },
  modules: {
    sectionTitle: "9つのモジュール。",
    sectionDesc:
      "各モジュールは2週間の学習単位：40時間、専門家によるマスタークラス1回、実践的なコンテンツ、そして3つのプログラムワークショップのいずれかへの明確な接続。基礎（データ、プログラミング、GIS）からモデリング、シミュレーション、製造、そして最終的にはオーダーメイドのエコシステムへの統合まで進む。",
    contentsLabel: "内容",
    loadLabel: "学習量",
    workshopLabel: "ワークショップ",
    items: [
      {
        tag: "オンボーディング",
        title: "基礎ワークショップ概要",
        subtitle: "踏み込む前に地図を描く。",
        desc: "スタートの2週間。プログラムの構造を把握し、3つのワークショップの位置を確認し、コースプロジェクトを設定する。各学生が最初のモジュールに自分の問いを持って臨めるようにするためだ。これはやさしい導入ではない——7月に何を発表するかを決める場だ。",
        topics: ["プログラム構造", "横断的ワークフロー", "最終コースプロジェクト", "メンター配置", "関心表明"],
        workshopSession: "プレワークショップ1",
      },
      {
        tag: "ワークショップ1",
        title: "Fundamentals / AI Setups",
        subtitle: "プログラム全体を支えるもの。",
        desc: "基礎プログラミング、データ構造、AI環境の構築。派手なデモはない——5ヶ月間使う基盤を作る場だ。このモジュールを飛ばすと、残りのコース全体で複利を払うことになる。",
        topics: ["プログラミング1", "データ構造", "データベース", "データスクレイピング", "AI概念", "AI環境構築", "MCP"],
        workshopSession: "マスタークラス + キックスタート + フォローアップ + ファイナル",
      },
      {
        tag: "ワークショップ1",
        title: "AI Territory",
        subtitle: "AIを使った地域戦略。",
        desc: "地域をデータとして理解する：地形、景観、都市。このモジュールでは、レイヤーを購入するのではなく、ノートブックとモデルを使って地理情報を読み取り生成することを学ぶ。目標：外部ビューアに依存せず、自分自身の地域レイヤーを構築すること。",
        topics: ["GIS", "位置情報データ表示", "LMノートブック", "プログラミング2", "地形スクレイピング", "ランドスケープモデリング", "スマートシティモデリング", "MCP2"],
        workshopSession: "1セッション · 2.5時間 + Q&A",
      },
      {
        tag: "ワークショップ1",
        title: "AI Modeling",
        subtitle: "コンセプトから使えるモデルへ。",
        desc: "AIを使って形状を作成、修正、キャプチャ、制御する。メッシュ、NURBS、SubDをLoRAやBIMと組み合わせ、写真や点群から編集可能なモデルを生成するリバースエンジニアリングを導入する。",
        topics: ["メッシュ / NURBS / SubD", "2Dから3D — LoRA", "AI駆動BIM / OpenBIM", "リバースエンジニアリング"],
        workshopSession: "1セッション · 2.5時間 + Q&A",
      },
      {
        tag: "ワークショップ2",
        title: "AI Prototyping",
        subtitle: "AI支援ビジュアルプログラミング。",
        desc: "プログラムの残りをどうプロトタイプするかを決める場所。ビジュアルプログラミング、支援スクリプティング、パラメトリックvsコード。慣性で知っているものを守るのではなく、状況に応じてツールと方法を選択することを強いるモジュール。",
        topics: ["ビジュアルプログラミング", "高度なプロトタイプ", "AI支援スクリプティング", "パラメトリック vs コード", "トポロジー vs 類型", "手続き的モデリング", "決定論的 vs 確率論的", "ルールをツールとして"],
        workshopSession: "ワークショップ2 — マスタークラス",
      },
      {
        tag: "ワークショップ2",
        title: "AI Simulation",
        subtitle: "自分を欺かずに世界をシミュレートする。",
        desc: "AIを使った多分野シミュレーション：構造、環境、流れ、最適化。焦点は限界に当てられている——ネットワークがうまくシミュレートできること、古典的FEMが優れていること、マルチエージェントシステムが適切な場面。結果を検証することがモジュールの半分を占める。",
        topics: ["シミュレーションの種類とコスト", "スマートワークフロー", "最適化アルゴリズム", "AI結果の検証", "有限要素モデル", "ML / EVO / EMO / AI", "マルチエージェントシステム"],
        workshopSession: "1セッション · 2.5時間 + Q&A",
      },
      {
        tag: "ワークショップ3",
        title: "AI Communication",
        subtitle: "画像、映像、そしてイマーシブ体験。",
        desc: "生成モデルによる画像・映像制作、視聴覚コンテンツから3Dモデルへの逆変換、没入型環境。このモジュールの問いは、きれいなレンダリングを生成する方法ではなく、建築環境のAIプロジェクトのための一貫したビジュアル言語をいかに構築するかだ。",
        topics: ["AI画像ツール", "AI画像モデル", "モデルから画像", "画像から映像", "映像+画像からモデル", "画像から世界"],
        workshopSession: "ワークショップ3 — マスタークラス",
      },
      {
        tag: "ワークショップ3",
        title: "AI Documentation",
        subtitle: "BIM、データ、情報管理。",
        desc: "文書化されていないものは工事現場に存在しない。このモジュールでは高度なBIM、エンティティ、交換フォーマット、AI支援製図を扱う。文書管理とロボティクス・建設との境界もカバーする。",
        topics: ["高度なBIMエンティティ", "データ管理＆フォーマット", "詳細、材料、接合部", "建設＆ロボティクス101", "BIMスーパー統合", "AI支援製図"],
        workshopSession: "1セッション · 2.5時間 + Q&A",
      },
      {
        tag: "ワークショップ3",
        title: "AI Digital Fabrication",
        subtitle: "モデルから物理的な作品へ。",
        desc: "高度なデジタルファブリケーション、ロボティクス、複雑な部品。このモジュールはデジタル—物理—デジタルのループを閉じる：モデルが作られ、計測され、修正されてシステムに戻る。ロボティクス101、Gコード、工房向けに設計された最適化ワークフロー。",
        topics: ["デジタルから物理へ、そして戻る", "スマートワークフロー", "DIGFAB最適化", "ロボティクス101", "3Dプリント、Gコード＆パス"],
        workshopSession: "1セッション · 2.5時間 + Q&A",
      },
      {
        tag: "最終プロジェクト",
        title: "AI Integration",
        subtitle: "オーダーメイドのマルチモーダルエコシステム。",
        desc: "最終モジュールは新しいトピックを追加しない——それらを繋げる。各学生は前の8モジュールのツール、データ、モデル、ワークフローを個人のエコシステムに統合し、最終審査委員会で発表する。",
        topics: ["マルチモーダル統合", "オーダーメイドAIワークフロー", "最終コースプロジェクト", "最終審査"],
        workshopSession: "最終審査",
      },
    ],
  },
  workshops: {
    sectionTitle: "3つのワークショップ。",
    sectionSubtitle: "3つの審査 · 3つのマイルストーン",
    sectionDesc:
      "各ワークショップは、前のモジュールが一つの発表プロジェクトに収束する集中スプリントだ。3つの審査、3つのマイルストーン、一本の連続したアーク。",
    weekLabel: "週",
    items: [
      {
        title: "AIパラメトリシズム\n& システム",
        weeks: ["セットアップ＆キックスタート", "地域分析", "モデリングスプリント", "レビュー＆審査"],
      },
      {
        title: "AI設計\n& シミュレーション",
        weeks: ["プロトタイピング設定", "シミュレーションスプリント", "最適化", "最終レビュー"],
      },
      {
        title: "ビスポークAI",
        weeks: ["ビジュアル言語", "BIM＆文書", "ファブリケーション", "統合＆審査"],
      },
    ],
  },
  footer: {
    tagline:
      "インテリジェント人工世界修士。AECセクター向けの空間AIと物理世界モデリングの大学院プログラム。",
    programLabel: "プログラム",
    programItems: ["基礎", "アドバンス", "最終プロジェクト"],
    applyLabel: "出願",
    applyBtn: "アドバイザーと話す →",
  },
  miniChat: {
    label: "miaw",
    cta: "何でも聞いて →",
    placeholder: "会話を始める",
  },
};

export const translations: Record<Lang, FoundationsT> = { en, es, fr, de, pt, zh, ja };

// ── Advanced Program translations ─────────────────────────────────────────

export interface AdvancedModuleT {
  tag: string;
  title: string;
  subtitle: string;
  deliverable?: string;
  desc: string;
  topics: string[];
  workshopSession: string;
}

export interface AdvancedWorkshopT {
  title: string;
  weeks: string[];
}

export interface AdvancedT {
  nav: {
    timeline: string;
    modules: string;
    workshops: string;
    howToApply: string;
  };
  hero: {
    metaLeft: string;
    metaRight: string;
    titleLine1: string;
    titleLine2: string;
    premise: { label: string; text: string }[];
    stats: { label: string }[];
    cta: string;
  };
  timeline: {
    title: string;
    subtitle: string;
    monthLabels: string[];
  };
  modules: {
    sectionTitle: string;
    sectionDesc: string;
    contentsLabel: string;
    loadLabel: string;
    workshopLabel: string;
    items: AdvancedModuleT[];
  };
  workshops: {
    sectionTitle: string;
    sectionSubtitle: string;
    sectionDesc: string;
    weekLabel: string;
    items: AdvancedWorkshopT[];
  };
  footer: {
    tagline: string;
    programLabel: string;
    programItems: string[];
    applyLabel: string;
    applyBtn: string;
  };
  miniChat: {
    label: string;
    cta: string;
    placeholder: string;
  };
}

const advancedEn: AdvancedT = {
  nav: {
    timeline: "Timeline",
    modules: "Modules",
    workshops: "Workshops",
    howToApply: "How to apply",
  },
  hero: {
    metaLeft: "Master in Intelligent Artificial Worlds",
    metaRight: "Program 02 — Advanced",
    titleLine1: "MIAW",
    titleLine2: "Advanced.",
    premise: [
      {
        label: "Premise",
        text: "Build a complete world: frame it, see it, structure it, model it, simulate it, communicate it, and govern it. Nine modules, three workshops, one fully realised world model that operates, reasons, and holds.",
      },
      {
        label: "Who",
        text: "Architects, researchers, engineers, and designers who want to build operational AI world models — not dashboards or renders, but functioning systems with data pipelines, rule engines, spatial frames, and autonomous decision-making.",
      },
      {
        label: "Outcome",
        text: "A complete, defended world model: brief, data pipeline, rules engine, spatial frame, predictive simulator, analytics interface, and governance layer — integrated and presented before a final jury.",
      },
    ],
    stats: [
      { label: "ECTS" },
      { label: "Total load" },
      { label: "Modules" },
      { label: "Workshops" },
      { label: "Months" },
    ],
    cta: "How to apply →",
  },
  timeline: {
    title: "timeline",
    subtitle: "9 modules · 8 fortnights",
    monthLabels: ["Month 1", "Month 2", "Month 3", "Month 4", "Month 5+"],
  },
  modules: {
    sectionTitle: "nine modules.",
    sectionDesc:
      "Nine modules. Nine fortnights. One world built from scratch. Each module contributes a working layer — from the initial brief to the data pipeline, rules engine, spatial frame, predictive simulator, analytics interface, and governance layer. The progression is cumulative: each deliverable feeds the next.",
    contentsLabel: "Contents",
    loadLabel: "Load",
    workshopLabel: "Workshop",
    items: [
      {
        tag: "Onboarding",
        title: "Advanced Program Setup",
        subtitle: "Define your world before you start building it.",
        deliverable: "WORLD PROJECT CHARTER",
        desc: "Kickoff fortnight. Each student defines the world they want to model — its scale, its domain, its question — and maps the three workshops against a clear research and production agenda. Mentors are assigned and the project charter is signed: what world, what data, what systems, what stake.",
        topics: ["World framing", "Research question definition", "Data audit", "Mentor assignment", "Workshop mapping", "Technical review"],
        workshopSession: "Pre-Workshop 1",
      },
      {
        tag: "Workshop 1",
        title: "Imagining the World",
        subtitle: "Set the basis of the system and its reaches",
        deliverable: "WORLD BRIEF",
        desc: "Interactive document combining AI-generated imagery, systems diagram, research question, needed data infrastructure, and authorial statement that together answer: what world do you want to model, and why does that world matter.",
        topics: ["AI image generation", "Systems diagramming", "Research question formulation", "Data infrastructure mapping", "Authorial positioning", "World concept development"],
        workshopSession: "Masterclass + Kickstart + Follow-up + Final",
      },
      {
        tag: "Workshop 1",
        title: "Seeing the World",
        subtitle: "Create the bare basics, gather and generate data to sustain the interpretation of the world",
        deliverable: "WORLD DATABASE PIPELINE",
        desc: "Full data pipeline — from sensor capture and database querying to algorithmic interpretation — and data management setup, producing a spatial knowledge artefact that reveals a pattern, dynamic, or condition of the world invisible to unassisted observation.",
        topics: ["Sensor capture", "Computer vision", "Point clouds", "Database querying", "Algorithmic interpretation", "Data pipeline architecture", "Spatial knowledge artefacts", "Pattern detection"],
        workshopSession: "1 session · 2.5h + Q&A",
      },
      {
        tag: "Workshop 1",
        title: "Structuring the World",
        subtitle: "Define relations between information systems and their hierarchy to get laws and rules as tools",
        deliverable: "WORLD RULES-BASED ENGINE",
        desc: "Programmed rule-based system — from the definition of laws, constraints and generative logic to their computational implementation — producing a structured world model whose form, behaviour and organisation emerges entirely from the rules that govern it.",
        topics: ["Rule definition", "Constraint systems", "Generative logic", "Computational implementation", "Emergent behaviour", "World model validation"],
        workshopSession: "1 session · 2.5h + Q&A",
      },
      {
        tag: "Workshop 2",
        title: "Modelling the World",
        subtitle: "Algorithms to Construct the Geometrical Context",
        deliverable: "WORLD SPATIAL FRAME",
        desc: "Advanced mathematical and computational geometry system — from associative geometry and constraint-based modelling to simulation-aware procedural generation — producing a continuously evolving spatial world model where geometry, behaviour and performance remain dynamically linked.",
        topics: ["Associative geometry", "Constraint-based modelling", "Digital twins", "FEMs / FEAs", "Procedural generation", "Simulation-aware design", "Complexity & complex systems", "Dynamic performance linkage"],
        workshopSession: "Workshop 2 — Masterclass",
      },
      {
        tag: "Workshop 2",
        title: "Simulating & Acting in the World",
        subtitle: "Simulate and act inside interrelated systems. Record interactions between systems, model and situations.",
        deliverable: "WORLD PREDICTIVE SIMULATOR",
        desc: "Predictive simulation and autonomous decision-making system — from spatial dynamics, behavioural modelling and synthetic environments to real-time forecasting, planning and adaptive control — producing operational world models capable of anticipating, evaluating and acting upon complex environmental scenarios.",
        topics: ["Spatial dynamics", "Behavioural modelling", "Multi-agent AI", "LLM / RAG integration", "Decision engines", "Laws of physics", "Real-time forecasting", "Adaptive control"],
        workshopSession: "1 session · 2.5h + Q&A",
      },
      {
        tag: "Workshop 3",
        title: "Communicating the World",
        subtitle: "Re-evaluate world system thinking and apply criticism to them.",
        deliverable: "WORLD ANALYTICS INTERFACE",
        desc: "World representation and data visualisation environment — from multi-layered simulation results and project information to visual narratives, documentation, performance comparisons and AI-assisted reporting — producing communicable insights across design, analysis and operation workflows.",
        topics: ["Data visualisation", "Multi-layered simulation display", "Visual narratives", "AI-assisted reporting", "Performance comparison", "Documentation systems"],
        workshopSession: "Workshop 3 — Masterclass",
      },
      {
        tag: "Workshop 3",
        title: "Governing the World",
        subtitle: "A self-regulating world that sustains its own coherence.",
        deliverable: "WORLD GOVERNANCE LAYER",
        desc: "Autonomous governance and control framework — from rule hierarchies, adaptive policies and multi-agent coordination to feedback-controlled management — producing a self-regulating world model that sustains its own coherence, responds to anomalies, and evolves its behaviour under changing conditions.",
        topics: ["Rule hierarchies", "Adaptive policies", "Multi-agent coordination", "Future prediction", "Truth / veracity / empathy", "Feedback control", "Anomaly detection", "Governance system design"],
        workshopSession: "1 session · 2.5h + Q&A",
      },
      {
        tag: "Final Project",
        title: "Final Master Project",
        subtitle: "One world, fully built, defended.",
        deliverable: "WORLD MASTER PROJECT",
        desc: "The final module is not a summary — it is a delivery. Each student assembles all previous components — brief, data pipeline, rules engine, spatial frame, simulator, analytics interface, governance layer — into a single integrated world model. The jury asks one question: does this world hold?",
        topics: ["Full world integration", "Cross-module synthesis", "World model defence", "Project documentation", "Final Jury"],
        workshopSession: "Final Jury",
      },
    ],
  },
  workshops: {
    sectionTitle: "three workshops.",
    sectionSubtitle: "3 juries · 3 milestones",
    sectionDesc:
      "Each workshop is an intensive sprint where preceding modules converge into a defended world position. Three juries, three escalations of resolution, one world that must hold.",
    weekLabel: "Week",
    items: [
      {
        title: "Imagining, Seeing\n& Structuring",
        weeks: ["World charter & setup", "World Brief + Database Pipeline sprint", "Rules-Based Engine integration", "Review & jury"],
      },
      {
        title: "Modelling &\nSimulating",
        weeks: ["Spatial Frame setup", "Predictive Simulator sprint", "Model-simulation integration", "Final review"],
      },
      {
        title: "Communicating,\nGoverning & Final",
        weeks: ["Analytics Interface build", "Governance Layer sprint", "Full world integration", "Final Jury"],
      },
    ],
  },
  footer: {
    tagline:
      "Master in Intelligent Artificial Worlds. Postgraduate program in spatial AI and physical world modeling for the AEC sector.",
    programLabel: "Program",
    programItems: ["Foundations", "Advanced", "Final Project"],
    applyLabel: "Apply",
    applyBtn: "speak to an advisor →",
  },
  miniChat: {
    label: "miaw",
    cta: "ask anything →",
    placeholder: "start a conversation",
  },
};

const advancedEs: AdvancedT = {
  nav: {
    timeline: "Cronograma",
    modules: "Módulos",
    workshops: "Workshops",
    howToApply: "Cómo aplicar",
  },
  hero: {
    metaLeft: "Máster en Mundos Artificiales Inteligentes",
    metaRight: "Programa 02 — Advanced",
    titleLine1: "MIAW",
    titleLine2: "Advanced.",
    premise: [
      {
        label: "Premisa",
        text: "Construye un mundo completo: imagínalo, obsérvalo, estrúcturalo, modélalo, simúlalo, comunícalo y govérnalo. Nueve módulos, tres workshops, un modelo de mundo completamente realizado que opera, razona y se sostiene.",
      },
      {
        label: "Quién",
        text: "Arquitectos, investigadores, ingenieros y diseñadores que quieren construir modelos de mundo operativos con IA — no dashboards ni renders, sino sistemas funcionando con pipelines de datos, motores de reglas, marcos espaciales y toma de decisiones autónoma.",
      },
      {
        label: "Salida",
        text: "Un modelo de mundo completo y defendido: brief, pipeline de datos, motor de reglas, marco espacial, simulador predictivo, interfaz de analítica y capa de gobernanza — integrados y presentados ante un jurado final.",
      },
    ],
    stats: [
      { label: "ECTS" },
      { label: "Carga total" },
      { label: "Módulos" },
      { label: "Workshops" },
      { label: "Meses" },
    ],
    cta: "Cómo aplicar →",
  },
  timeline: {
    title: "cronograma",
    subtitle: "9 módulos · 8 quincenas",
    monthLabels: ["Mes 1", "Mes 2", "Mes 3", "Mes 4", "Mes 5+"],
  },
  modules: {
    sectionTitle: "nueve módulos.",
    sectionDesc:
      "Nueve módulos. Nueve quincenas. Un mundo construido desde cero. Cada módulo aporta una capa funcional — del brief inicial al pipeline de datos, motor de reglas, marco espacial, simulador predictivo, interfaz de analítica y capa de gobernanza. La progresión es acumulativa: cada entregable alimenta el siguiente.",
    contentsLabel: "Contenidos",
    loadLabel: "Carga",
    workshopLabel: "Workshop",
    items: [
      {
        tag: "Onboarding",
        title: "Advanced Program Setup",
        subtitle: "Define tu mundo antes de empezar a construirlo.",
        deliverable: "WORLD PROJECT CHARTER",
        desc: "Quincena de arranque. Cada estudiante define el mundo que quiere modelar — su escala, su dominio, su pregunta — y mapea los tres workshops contra una agenda clara de investigación y producción. Se asignan mentores y se firma el acta del proyecto: qué mundo, qué datos, qué sistemas, qué apuesta.",
        topics: ["Marco del mundo", "Definición de la pregunta de investigación", "Auditoría de datos", "Asignación de mentores", "Mapeo de workshops", "Revisión técnica"],
        workshopSession: "Pre-Workshop 1",
      },
      {
        tag: "Workshop 1",
        title: "Imagining the World",
        subtitle: "¿Qué mundo quieres modelar y por qué importa?",
        deliverable: "WORLD BRIEF",
        desc: "Documento interactivo que combina imágenes generadas por IA, diagrama de sistemas, pregunta de investigación, infraestructura de datos necesaria y declaración de autor, respondiendo juntos: qué mundo quieres modelar y por qué ese mundo importa.",
        topics: ["Generación de imágenes con IA", "Diagramación de sistemas", "Formulación de pregunta de investigación", "Mapeo de infraestructura de datos", "Posicionamiento autoral", "Desarrollo del concepto de mundo"],
        workshopSession: "Masterclass + Kickstart + Follow-up + Final",
      },
      {
        tag: "Workshop 1",
        title: "Seeing the World",
        subtitle: "Revela lo invisible a la observación no asistida.",
        deliverable: "WORLD DATABASE PIPELINE",
        desc: "Pipeline de datos completo — desde la captura de sensores y consultas de bases de datos hasta la interpretación algorítmica — y configuración de gestión de datos, produciendo un artefacto de conocimiento espacial que revela un patrón, dinámica o condición del mundo invisible a la observación no asistida.",
        topics: ["Captura de sensores", "Consultas de bases de datos", "Interpretación algorítmica", "Arquitectura de pipeline de datos", "Artefactos de conocimiento espacial", "Detección de patrones"],
        workshopSession: "1 sesión · 2.5h + Q&A",
      },
      {
        tag: "Workshop 1",
        title: "Structuring the World",
        subtitle: "Forma y comportamiento que emerge completamente de las reglas.",
        deliverable: "WORLD RULES-BASED ENGINE",
        desc: "Sistema de reglas programado — desde la definición de leyes, restricciones y lógica generativa hasta su implementación computacional — produciendo un modelo de mundo estructurado cuya forma, comportamiento y organización emerge completamente de las reglas que lo gobiernan.",
        topics: ["Definición de reglas", "Sistemas de restricciones", "Lógica generativa", "Implementación computacional", "Comportamiento emergente", "Validación del modelo de mundo"],
        workshopSession: "1 sesión · 2.5h + Q&A",
      },
      {
        tag: "Workshop 2",
        title: "Modelling the World",
        subtitle: "Geometría, comportamiento y rendimiento dinámicamente vinculados.",
        deliverable: "WORLD SPATIAL FRAME",
        desc: "Sistema matemático y de geometría computacional avanzada — de la geometría asociativa y el modelado basado en restricciones a la generación procedural orientada a simulación — produciendo un modelo de mundo espacial en evolución continua donde geometría, comportamiento y rendimiento permanecen dinámicamente vinculados.",
        topics: ["Geometría asociativa", "Modelado basado en restricciones", "Generación procedural", "Diseño orientado a simulación", "Modelado de mundo espacial", "Vinculación dinámica de rendimiento"],
        workshopSession: "Workshop 2 — Masterclass",
      },
      {
        tag: "Workshop 2",
        title: "Simulating & Acting in the World",
        subtitle: "Modelos de mundo capaces de anticipar y actuar.",
        deliverable: "WORLD PREDICTIVE SIMULATOR",
        desc: "Sistema de simulación predictiva y toma de decisiones autónoma — desde dinámicas espaciales, modelado de comportamiento y entornos sintéticos hasta previsión en tiempo real, planificación y control adaptativo — produciendo modelos de mundo operativos capaces de anticipar, evaluar y actuar ante escenarios ambientales complejos.",
        topics: ["Dinámicas espaciales", "Modelado de comportamiento", "Entornos sintéticos", "Previsión en tiempo real", "Control adaptativo", "Toma de decisiones multiagente"],
        workshopSession: "1 sesión · 2.5h + Q&A",
      },
      {
        tag: "Workshop 3",
        title: "Communicating the World",
        subtitle: "Insights comunicables a través del diseño, el análisis y la operación.",
        deliverable: "WORLD ANALYTICS INTERFACE",
        desc: "Entorno de representación del mundo y visualización de datos — de resultados de simulación multicapa e información del proyecto a narrativas visuales, documentación, comparaciones de rendimiento e informes asistidos por IA — produciendo insights comunicables en flujos de trabajo de diseño, análisis y operación.",
        topics: ["Visualización de datos", "Visualización de simulación multicapa", "Narrativas visuales", "Informes asistidos por IA", "Comparación de rendimiento", "Sistemas de documentación"],
        workshopSession: "Workshop 3 — Masterclass",
      },
      {
        tag: "Workshop 3",
        title: "Governing the World",
        subtitle: "Un mundo que se autorregula y mantiene su propia coherencia.",
        deliverable: "WORLD GOVERNANCE LAYER",
        desc: "Marco de gobernanza y control autónomo — desde jerarquías de reglas, políticas adaptativas y coordinación multiagente hasta la gestión controlada por retroalimentación — produciendo un modelo de mundo autorregulado que mantiene su propia coherencia, responde a anomalías y evoluciona su comportamiento bajo condiciones cambiantes.",
        topics: ["Jerarquías de reglas", "Políticas adaptativas", "Coordinación multiagente", "Control por retroalimentación", "Detección de anomalías", "Diseño de sistema de gobernanza"],
        workshopSession: "1 sesión · 2.5h + Q&A",
      },
      {
        tag: "Final Project",
        title: "Final Master Project",
        subtitle: "Un mundo, completamente construido, defendido.",
        deliverable: "WORLD MASTER PROJECT",
        desc: "El módulo final no es un resumen — es una entrega. Cada estudiante ensambla todos los componentes anteriores — brief, pipeline de datos, motor de reglas, marco espacial, simulador, interfaz de analítica, capa de gobernanza — en un único modelo de mundo integrado. El jurado hace una sola pregunta: ¿este mundo se sostiene?",
        topics: ["Integración completa del mundo", "Síntesis entre módulos", "Defensa del modelo de mundo", "Documentación del proyecto", "Jurado Final"],
        workshopSession: "Final Jury",
      },
    ],
  },
  workshops: {
    sectionTitle: "tres workshops.",
    sectionSubtitle: "3 jurados · 3 hitos",
    sectionDesc:
      "Cada workshop es un sprint intensivo donde los módulos anteriores convergen en una posición de mundo defendida. Tres jurados, tres escaladas de resolución, un mundo que debe sostenerse.",
    weekLabel: "Semana",
    items: [
      {
        title: "Imaginando, Viendo\ny Estructurando",
        weeks: ["Acta del mundo y setup", "Sprint World Brief + Database Pipeline", "Integración Rules-Based Engine", "Revisión & jurado"],
      },
      {
        title: "Modelando &\nSimulando",
        weeks: ["Setup Spatial Frame", "Sprint Predictive Simulator", "Integración modelo-simulación", "Revisión final"],
      },
      {
        title: "Comunicando,\nGobernando & Final",
        weeks: ["Build Analytics Interface", "Sprint Governance Layer", "Integración completa del mundo", "Jurado Final"],
      },
    ],
  },
  footer: {
    tagline:
      "Máster en Mundos Artificiales Inteligentes. Programa de posgrado en IA espacial y modelado del mundo físico para el sector AEC.",
    programLabel: "Programa",
    programItems: ["Foundations", "Advanced", "Proyecto Final"],
    applyLabel: "Aplicar",
    applyBtn: "hablar con un asesor →",
  },
  miniChat: {
    label: "miaw",
    cta: "pregunta lo que quieras →",
    placeholder: "empieza una conversación",
  },
};

// ── Advanced: French ─────────────────────────────────────────────────────────

const advancedFr: AdvancedT = {
  nav: {
    timeline: "Chronologie",
    modules: "Modules",
    workshops: "Ateliers",
    howToApply: "Comment postuler",
  },
  hero: {
    metaLeft: "Master en Mondes Artificiels Intelligents",
    metaRight: "Programme 02 — Advanced",
    titleLine1: "MIAW",
    titleLine2: "Advanced.",
    premise: [
      {
        label: "Prémisse",
        text: "Construire un monde complet : le cadrer, le voir, le structurer, le modéliser, le simuler, le communiquer et le gouverner. Neuf modules, trois ateliers, un modèle de monde entièrement réalisé qui opère, raisonne et tient.",
      },
      {
        label: "Pour qui",
        text: "Architectes, chercheurs, ingénieurs et designers qui veulent construire des modèles de monde IA opérationnels — pas des tableaux de bord ou des rendus, mais des systèmes fonctionnels avec pipelines de données, moteurs de règles, cadres spatiaux et prise de décision autonome.",
      },
      {
        label: "Résultat",
        text: "Un modèle de monde complet et défendu : brief, pipeline de données, moteur de règles, cadre spatial, simulateur prédictif, interface d'analytique et couche de gouvernance — intégrés et présentés devant un jury final.",
      },
    ],
    stats: [
      { label: "ECTS" },
      { label: "Charge totale" },
      { label: "Modules" },
      { label: "Ateliers" },
      { label: "Mois" },
    ],
    cta: "Comment postuler →",
  },
  timeline: {
    title: "chronologie",
    subtitle: "9 modules · 8 quinzaines",
    monthLabels: ["Mois 1", "Mois 2", "Mois 3", "Mois 4", "Mois 5+"],
  },
  modules: {
    sectionTitle: "neuf modules.",
    sectionDesc:
      "Neuf modules. Neuf quinzaines. Un monde construit de zéro. Chaque module apporte une couche fonctionnelle — du brief initial au pipeline de données, moteur de règles, cadre spatial, simulateur prédictif, interface d'analytique et couche de gouvernance. La progression est cumulative : chaque livrable alimente le suivant.",
    contentsLabel: "Contenu",
    loadLabel: "Charge",
    workshopLabel: "Atelier",
    items: [
      {
        tag: "Onboarding",
        title: "Advanced Program Setup",
        subtitle: "Définir son monde avant de commencer à le construire.",
        deliverable: "WORLD PROJECT CHARTER",
        desc: "Quinzaine de lancement. Chaque étudiant définit le monde qu'il veut modéliser — son échelle, son domaine, sa question — et cartographie les trois ateliers contre un agenda clair de recherche et production. Les mentors sont assignés et l'acte de projet est signé : quel monde, quelles données, quels systèmes, quelle mise en jeu.",
        topics: ["Cadrage du monde", "Définition de la question de recherche", "Audit des données", "Attribution des mentors", "Cartographie des ateliers", "Revue technique"],
        workshopSession: "Pré-Atelier 1",
      },
      {
        tag: "Atelier 1",
        title: "Imagining the World",
        subtitle: "Poser les bases du système et ses portées.",
        deliverable: "WORLD BRIEF",
        desc: "Document interactif combinant images générées par IA, schéma de systèmes, question de recherche, infrastructure de données nécessaire et déclaration d'auteur qui répondent ensemble : quel monde voulez-vous modéliser, et pourquoi ce monde a-t-il de l'importance.",
        topics: ["Génération d'images IA", "Schématisation de systèmes", "Formulation de la question de recherche", "Cartographie de l'infrastructure de données", "Positionnement d'auteur", "Développement du concept de monde"],
        workshopSession: "Masterclass + Kickstart + Suivi + Final",
      },
      {
        tag: "Atelier 1",
        title: "Seeing the World",
        subtitle: "Révéler l'invisible à l'observation non assistée.",
        deliverable: "WORLD DATABASE PIPELINE",
        desc: "Pipeline de données complet — de la capture de capteurs et les requêtes de bases de données à l'interprétation algorithmique — et configuration de gestion de données, produisant un artefact de connaissance spatiale qui révèle un pattern, une dynamique ou une condition du monde invisible à l'observation non assistée.",
        topics: ["Capture de capteurs", "Vision par ordinateur", "Nuages de points", "Requêtes de bases de données", "Interprétation algorithmique", "Architecture de pipeline de données", "Artefacts de connaissance spatiale", "Détection de patterns"],
        workshopSession: "1 session · 2,5h + Q&A",
      },
      {
        tag: "Atelier 1",
        title: "Structuring the World",
        subtitle: "Forme et comportement qui émerge entièrement des règles.",
        deliverable: "WORLD RULES-BASED ENGINE",
        desc: "Système de règles programmé — de la définition des lois, contraintes et logique générative à leur implémentation computationnelle — produisant un modèle de monde structuré dont la forme, le comportement et l'organisation émergent entièrement des règles qui le gouvernent.",
        topics: ["Définition des règles", "Systèmes de contraintes", "Logique générative", "Implémentation computationnelle", "Comportement émergent", "Validation du modèle de monde"],
        workshopSession: "1 session · 2,5h + Q&A",
      },
      {
        tag: "Atelier 2",
        title: "Modelling the World",
        subtitle: "Géométrie, comportement et performance dynamiquement liés.",
        deliverable: "WORLD SPATIAL FRAME",
        desc: "Système de géométrie mathématique et computationnelle avancée — de la géométrie associative et la modélisation basée sur les contraintes à la génération procédurale orientée simulation — produisant un modèle de monde spatial en évolution continue où géométrie, comportement et performance restent dynamiquement liés.",
        topics: ["Géométrie associative", "Modélisation basée sur les contraintes", "Jumeaux numériques", "MEF / AEF", "Génération procédurale", "Design orienté simulation", "Complexité & systèmes complexes", "Liaison de performance dynamique"],
        workshopSession: "Atelier 2 — Masterclass",
      },
      {
        tag: "Atelier 2",
        title: "Simulating & Acting in the World",
        subtitle: "Modèles de monde capables d'anticiper et d'agir.",
        deliverable: "WORLD PREDICTIVE SIMULATOR",
        desc: "Système de simulation prédictive et de prise de décision autonome — des dynamiques spatiales, modélisation comportementale et environnements synthétiques à la prévision en temps réel, la planification et le contrôle adaptatif — produisant des modèles de monde opérationnels capables d'anticiper, d'évaluer et d'agir sur des scénarios environnementaux complexes.",
        topics: ["Dynamiques spatiales", "Modélisation comportementale", "IA multi-agents", "Intégration LLM / RAG", "Moteurs de décision", "Lois de la physique", "Prévision en temps réel", "Contrôle adaptatif"],
        workshopSession: "1 session · 2,5h + Q&A",
      },
      {
        tag: "Atelier 3",
        title: "Communicating the World",
        subtitle: "Insights communicables à travers la conception, l'analyse et l'exploitation.",
        deliverable: "WORLD ANALYTICS INTERFACE",
        desc: "Environnement de représentation du monde et de visualisation de données — des résultats de simulation multicouche et l'information de projet aux récits visuels, documentation, comparaisons de performance et rapports assistés par IA — produisant des insights communicables dans les workflows de conception, d'analyse et d'exploitation.",
        topics: ["Visualisation de données", "Affichage de simulation multicouche", "Récits visuels", "Rapports assistés par IA", "Comparaison de performance", "Systèmes de documentation"],
        workshopSession: "Atelier 3 — Masterclass",
      },
      {
        tag: "Atelier 3",
        title: "Governing the World",
        subtitle: "Un monde qui s'autorégule et maintient sa propre cohérence.",
        deliverable: "WORLD GOVERNANCE LAYER",
        desc: "Cadre de gouvernance et de contrôle autonome — des hiérarchies de règles, politiques adaptatives et coordination multi-agents à la gestion contrôlée par rétroaction — produisant un modèle de monde autorégulé qui maintient sa propre cohérence, répond aux anomalies et fait évoluer son comportement dans des conditions changeantes.",
        topics: ["Hiérarchies de règles", "Politiques adaptatives", "Coordination multi-agents", "Prédiction future", "Vérité / véracité / empathie", "Contrôle par rétroaction", "Détection d'anomalies", "Conception de système de gouvernance"],
        workshopSession: "1 session · 2,5h + Q&A",
      },
      {
        tag: "Projet Final",
        title: "Final Master Project",
        subtitle: "Un monde, entièrement construit, défendu.",
        deliverable: "WORLD MASTER PROJECT",
        desc: "Le module final n'est pas un résumé — c'est une livraison. Chaque étudiant assemble tous les composants précédents — brief, pipeline de données, moteur de règles, cadre spatial, simulateur, interface d'analytique, couche de gouvernance — en un unique modèle de monde intégré. Le jury pose une seule question : ce monde tient-il ?",
        topics: ["Intégration complète du monde", "Synthèse inter-modules", "Défense du modèle de monde", "Documentation du projet", "Jury Final"],
        workshopSession: "Jury Final",
      },
    ],
  },
  workshops: {
    sectionTitle: "trois ateliers.",
    sectionSubtitle: "3 jurys · 3 jalons",
    sectionDesc:
      "Chaque atelier est un sprint intensif où les modules précédents convergent en une position de monde défendue. Trois jurys, trois escalades de résolution, un monde qui doit tenir.",
    weekLabel: "Semaine",
    items: [
      {
        title: "Imaginer, Voir\n& Structurer",
        weeks: ["Acte de monde & setup", "Sprint World Brief + Pipeline de données", "Intégration Rules-Based Engine", "Révision & jury"],
      },
      {
        title: "Modéliser &\nSimuler",
        weeks: ["Setup Cadre Spatial", "Sprint Simulateur Prédictif", "Intégration modèle-simulation", "Révision finale"],
      },
      {
        title: "Communiquer,\nGouverner & Final",
        weeks: ["Build Interface Analytique", "Sprint Couche de Gouvernance", "Intégration complète du monde", "Jury Final"],
      },
    ],
  },
  footer: {
    tagline:
      "Master en Mondes Artificiels Intelligents. Programme de troisième cycle en IA spatiale et modélisation du monde physique pour le secteur AEC.",
    programLabel: "Programme",
    programItems: ["Fondations", "Advanced", "Projet Final"],
    applyLabel: "Postuler",
    applyBtn: "parler à un conseiller →",
  },
  miniChat: {
    label: "miaw",
    cta: "posez une question →",
    placeholder: "démarrer une conversation",
  },
};

// ── Advanced: German ──────────────────────────────────────────────────────────

const advancedDe: AdvancedT = {
  nav: {
    timeline: "Zeitplan",
    modules: "Module",
    workshops: "Workshops",
    howToApply: "Bewerbung",
  },
  hero: {
    metaLeft: "Master in Intelligenten Künstlichen Welten",
    metaRight: "Programm 02 — Advanced",
    titleLine1: "MIAW",
    titleLine2: "Advanced.",
    premise: [
      {
        label: "Prämisse",
        text: "Eine vollständige Welt bauen: sie rahmen, sehen, strukturieren, modellieren, simulieren, kommunizieren und regieren. Neun Module, drei Workshops, ein vollständig realisiertes Weltmodell, das operiert, denkt und hält.",
      },
      {
        label: "Für wen",
        text: "Architekten, Forscher, Ingenieure und Designer, die operative KI-Weltmodelle bauen wollen — keine Dashboards oder Renderings, sondern funktionierende Systeme mit Datenpipelines, Regelmaschinen, räumlichen Rahmen und autonomer Entscheidungsfindung.",
      },
      {
        label: "Ergebnis",
        text: "Ein vollständiges, verteidigtes Weltmodell: Brief, Datenpipeline, Regelmaschine, räumlicher Rahmen, Prognose-Simulator, Analyse-Interface und Governance-Schicht — integriert und vor einer Abschlussjury präsentiert.",
      },
    ],
    stats: [
      { label: "ECTS" },
      { label: "Gesamtlast" },
      { label: "Module" },
      { label: "Workshops" },
      { label: "Monate" },
    ],
    cta: "Zur Bewerbung →",
  },
  timeline: {
    title: "zeitplan",
    subtitle: "9 Module · 8 Vierzehntage",
    monthLabels: ["Monat 1", "Monat 2", "Monat 3", "Monat 4", "Monat 5+"],
  },
  modules: {
    sectionTitle: "neun module.",
    sectionDesc:
      "Neun Module. Neun Vierzehntage. Eine Welt von Grund auf gebaut. Jedes Modul trägt eine Arbeitsschicht bei — vom ersten Brief über die Datenpipeline, Regelmaschine, räumlichen Rahmen, Prognose-Simulator, Analyse-Interface bis zur Governance-Schicht. Der Fortschritt ist kumulativ: jedes Ergebnis füttert das nächste.",
    contentsLabel: "Inhalt",
    loadLabel: "Last",
    workshopLabel: "Workshop",
    items: [
      {
        tag: "Onboarding",
        title: "Advanced Program Setup",
        subtitle: "Die eigene Welt definieren, bevor man sie zu bauen beginnt.",
        deliverable: "WORLD PROJECT CHARTER",
        desc: "Startviertehjahr. Jeder Studierende definiert die Welt, die er modellieren möchte — ihre Skala, ihre Domäne, ihre Frage — und kartiert die drei Workshops gegen eine klare Forschungs- und Produktionsagenda. Mentoren werden zugewiesen und der Projektakt wird unterzeichnet: welche Welt, welche Daten, welche Systeme, welcher Einsatz.",
        topics: ["Weltrahmen", "Forschungsfragedefinition", "Datenaudit", "Mentorzuweisung", "Workshop-Kartierung", "Technische Überprüfung"],
        workshopSession: "Pre-Workshop 1",
      },
      {
        tag: "Workshop 1",
        title: "Imagining the World",
        subtitle: "Die Basis des Systems und seine Reichweiten setzen.",
        deliverable: "WORLD BRIEF",
        desc: "Interaktives Dokument, das KI-generierte Bilder, Systemdiagramm, Forschungsfrage, benötigte Dateninfrastruktur und Autorenerklärung kombiniert, die gemeinsam antworten: welche Welt möchten Sie modellieren, und warum ist diese Welt wichtig.",
        topics: ["KI-Bildgenerierung", "Systemdiagrammierung", "Forschungsfrageformulierung", "Dateninfrastruktur-Kartierung", "Autorenpositionen", "Weltkonzeptentwicklung"],
        workshopSession: "Masterclass + Kickstart + Follow-up + Final",
      },
      {
        tag: "Workshop 1",
        title: "Seeing the World",
        subtitle: "Das Unsichtbare für unassistierte Beobachtung enthüllen.",
        deliverable: "WORLD DATABASE PIPELINE",
        desc: "Vollständige Datenpipeline — von der Sensorerfassung und Datenbankabfragen bis zur algorithmischen Interpretation — und Datenverwaltungseinrichtung, die ein räumliches Wissensobjekt produziert, das ein Muster, eine Dynamik oder einen Zustand der Welt enthüllt, der für unassistierte Beobachtung unsichtbar ist.",
        topics: ["Sensorerfassung", "Computer Vision", "Punktwolken", "Datenbankabfragen", "Algorithmische Interpretation", "Datenpipeline-Architektur", "Räumliche Wissensobjekte", "Mustererkennung"],
        workshopSession: "1 Sitzung · 2,5h + Q&A",
      },
      {
        tag: "Workshop 1",
        title: "Structuring the World",
        subtitle: "Form und Verhalten, die vollständig aus den Regeln entstehen.",
        deliverable: "WORLD RULES-BASED ENGINE",
        desc: "Programmiertes Regelbasiertes System — von der Definition von Gesetzen, Einschränkungen und generativer Logik bis zu ihrer rechnerischen Umsetzung — das ein strukturiertes Weltmodell produziert, dessen Form, Verhalten und Organisation vollständig aus den Regeln entsteht, die es regieren.",
        topics: ["Regeldefinition", "Einschränkungssysteme", "Generative Logik", "Rechnerische Umsetzung", "Emergentes Verhalten", "Weltmodellvalidierung"],
        workshopSession: "1 Sitzung · 2,5h + Q&A",
      },
      {
        tag: "Workshop 2",
        title: "Modelling the World",
        subtitle: "Geometrie, Verhalten und Performance dynamisch verknüpft.",
        deliverable: "WORLD SPATIAL FRAME",
        desc: "Fortgeschrittenes mathematisches und computationales Geometriesystem — von assoziativer Geometrie und einschränkungsbasierter Modellierung bis zur simulationsorientierten prozeduralen Generierung — das ein kontinuierlich sich entwickelndes räumliches Weltmodell produziert, in dem Geometrie, Verhalten und Performance dynamisch verknüpft bleiben.",
        topics: ["Assoziative Geometrie", "Einschränkungsbasierte Modellierung", "Digitale Zwillinge", "FEM / FEA", "Prozedurale Generierung", "Simulationsorientiertes Design", "Komplexität & komplexe Systeme", "Dynamische Performance-Verknüpfung"],
        workshopSession: "Workshop 2 — Masterclass",
      },
      {
        tag: "Workshop 2",
        title: "Simulating & Acting in the World",
        subtitle: "Weltmodelle, die antizipieren und handeln können.",
        deliverable: "WORLD PREDICTIVE SIMULATOR",
        desc: "Prädiktives Simulations- und autonomes Entscheidungssystem — von räumlichen Dynamiken, Verhaltensmodellierung und synthetischen Umgebungen bis zu Echtzeit-Prognosen, Planung und adaptiver Kontrolle — das operative Weltmodelle produziert, die komplexe Umweltszenarien antizipieren, bewerten und handeln können.",
        topics: ["Räumliche Dynamiken", "Verhaltensmodellierung", "Multi-Agenten-KI", "LLM / RAG-Integration", "Entscheidungsmaschinen", "Gesetze der Physik", "Echtzeit-Prognose", "Adaptive Kontrolle"],
        workshopSession: "1 Sitzung · 2,5h + Q&A",
      },
      {
        tag: "Workshop 3",
        title: "Communicating the World",
        subtitle: "Kommunizierbare Erkenntnisse über Design, Analyse und Betrieb.",
        deliverable: "WORLD ANALYTICS INTERFACE",
        desc: "Weltdarstellungs- und Datenvisualisierungsumgebung — von mehrschichtigen Simulationsergebnissen und Projektinformationen zu visuellen Narrativen, Dokumentation, Leistungsvergleichen und KI-gestützter Berichterstattung — die kommunizierbare Erkenntnisse in Design-, Analyse- und Betriebs-Workflows produziert.",
        topics: ["Datenvisualisierung", "Mehrschichtige Simulationsanzeige", "Visuelle Narrative", "KI-gestützte Berichterstattung", "Leistungsvergleich", "Dokumentationssysteme"],
        workshopSession: "Workshop 3 — Masterclass",
      },
      {
        tag: "Workshop 3",
        title: "Governing the World",
        subtitle: "Eine Welt, die sich selbst reguliert und ihre eigene Kohärenz aufrechterhält.",
        deliverable: "WORLD GOVERNANCE LAYER",
        desc: "Autonomes Governance- und Kontrollrahmen — von Regelhierarchien, adaptiven Richtlinien und Multi-Agenten-Koordination bis zur rückkopplungsgesteuerten Verwaltung — das ein selbstregulierendes Weltmodell produziert, das seine eigene Kohärenz aufrechterhält, auf Anomalien reagiert und sein Verhalten unter sich ändernden Bedingungen entwickelt.",
        topics: ["Regelhierarchien", "Adaptive Richtlinien", "Multi-Agenten-Koordination", "Zukunftsvorhersage", "Wahrheit / Wahrhaftigkeit / Empathie", "Rückkopplungssteuerung", "Anomalieerkennung", "Governance-System-Design"],
        workshopSession: "1 Sitzung · 2,5h + Q&A",
      },
      {
        tag: "Abschlussprojekt",
        title: "Final Master Project",
        subtitle: "Eine Welt, vollständig gebaut, verteidigt.",
        deliverable: "WORLD MASTER PROJECT",
        desc: "Das Abschlussmodul ist keine Zusammenfassung — es ist eine Lieferung. Jeder Studierende montiert alle vorherigen Komponenten — Brief, Datenpipeline, Regelmaschine, räumlicher Rahmen, Simulator, Analyse-Interface, Governance-Schicht — in einem einzigen integrierten Weltmodell. Die Jury stellt eine einzige Frage: hält diese Welt?",
        topics: ["Vollständige Weltintegration", "Modulübergreifende Synthese", "Weltmodellverteidigung", "Projektdokumentation", "Abschlussjury"],
        workshopSession: "Abschlussjury",
      },
    ],
  },
  workshops: {
    sectionTitle: "drei workshops.",
    sectionSubtitle: "3 Jurys · 3 Meilensteine",
    sectionDesc:
      "Jeder Workshop ist ein intensiver Sprint, in dem die vorangegangenen Module in eine verteidigte Weltposition konvergieren. Drei Jurys, drei Auflösungseskalationen, eine Welt, die halten muss.",
    weekLabel: "Woche",
    items: [
      {
        title: "Vorstellen, Sehen\n& Strukturieren",
        weeks: ["Weltakt & Setup", "World Brief + Datenpipeline Sprint", "Rules-Based Engine Integration", "Überprüfung & Jury"],
      },
      {
        title: "Modellieren &\nSimulieren",
        weeks: ["Spatial Frame Setup", "Prognose-Simulator Sprint", "Modell-Simulation Integration", "Abschlussüberprüfung"],
      },
      {
        title: "Kommunizieren,\nRegieren & Final",
        weeks: ["Analytics Interface aufbauen", "Governance Layer Sprint", "Vollständige Weltintegration", "Abschlussjury"],
      },
    ],
  },
  footer: {
    tagline:
      "Master in Intelligenten Künstlichen Welten. Postgraduiertenprogramm in räumlicher KI und Modellierung der physischen Welt für den AEC-Sektor.",
    programLabel: "Programm",
    programItems: ["Grundlagen", "Advanced", "Abschlussprojekt"],
    applyLabel: "Bewerben",
    applyBtn: "mit einem Berater sprechen →",
  },
  miniChat: {
    label: "miaw",
    cta: "frag etwas →",
    placeholder: "Gespräch starten",
  },
};

// ── Advanced: Portuguese ──────────────────────────────────────────────────────

const advancedPt: AdvancedT = {
  nav: {
    timeline: "Cronograma",
    modules: "Módulos",
    workshops: "Workshops",
    howToApply: "Como candidatar",
  },
  hero: {
    metaLeft: "Mestrado em Mundos Artificiais Inteligentes",
    metaRight: "Programa 02 — Advanced",
    titleLine1: "MIAW",
    titleLine2: "Advanced.",
    premise: [
      {
        label: "Premissa",
        text: "Construir um mundo completo: enquadrá-lo, vê-lo, estruturá-lo, modelá-lo, simulá-lo, comunicá-lo e governá-lo. Nove módulos, três workshops, um modelo de mundo completamente realizado que opera, raciocina e se sustenta.",
      },
      {
        label: "Para quem",
        text: "Arquitetos, investigadores, engenheiros e designers que querem construir modelos de mundo operacionais com IA — não dashboards ou renders, mas sistemas funcionais com pipelines de dados, motores de regras, quadros espaciais e tomada de decisão autónoma.",
      },
      {
        label: "Resultado",
        text: "Um modelo de mundo completo e defendido: brief, pipeline de dados, motor de regras, quadro espacial, simulador preditivo, interface de analítica e camada de governança — integrados e apresentados perante um júri final.",
      },
    ],
    stats: [
      { label: "ECTS" },
      { label: "Carga total" },
      { label: "Módulos" },
      { label: "Workshops" },
      { label: "Meses" },
    ],
    cta: "Como candidatar →",
  },
  timeline: {
    title: "cronograma",
    subtitle: "9 módulos · 8 quinzenas",
    monthLabels: ["Mês 1", "Mês 2", "Mês 3", "Mês 4", "Mês 5+"],
  },
  modules: {
    sectionTitle: "nove módulos.",
    sectionDesc:
      "Nove módulos. Nove quinzenas. Um mundo construído de raiz. Cada módulo contribui com uma camada funcional — do brief inicial ao pipeline de dados, motor de regras, quadro espacial, simulador preditivo, interface de analítica e camada de governança. A progressão é cumulativa: cada entregável alimenta o seguinte.",
    contentsLabel: "Conteúdos",
    loadLabel: "Carga",
    workshopLabel: "Workshop",
    items: [
      {
        tag: "Onboarding",
        title: "Advanced Program Setup",
        subtitle: "Definir o mundo antes de começar a construí-lo.",
        deliverable: "WORLD PROJECT CHARTER",
        desc: "Quinzena de arranque. Cada estudante define o mundo que quer modelar — a sua escala, o seu domínio, a sua questão — e mapeia os três workshops contra uma agenda clara de investigação e produção. Os mentores são atribuídos e a ata do projeto é assinada: que mundo, que dados, que sistemas, que aposta.",
        topics: ["Enquadramento do mundo", "Definição da questão de investigação", "Auditoria de dados", "Atribuição de mentores", "Mapeamento de workshops", "Revisão técnica"],
        workshopSession: "Pré-Workshop 1",
      },
      {
        tag: "Workshop 1",
        title: "Imagining the World",
        subtitle: "Definir a base do sistema e os seus alcances.",
        deliverable: "WORLD BRIEF",
        desc: "Documento interativo combinando imagens geradas por IA, diagrama de sistemas, questão de investigação, infraestrutura de dados necessária e declaração de autor que respondem juntos: que mundo quer modelar, e por que razão esse mundo importa.",
        topics: ["Geração de imagens IA", "Diagramação de sistemas", "Formulação da questão de investigação", "Mapeamento de infraestrutura de dados", "Posicionamento de autor", "Desenvolvimento do conceito de mundo"],
        workshopSession: "Masterclass + Kickstart + Acompanhamento + Final",
      },
      {
        tag: "Workshop 1",
        title: "Seeing the World",
        subtitle: "Revelar o invisível à observação não assistida.",
        deliverable: "WORLD DATABASE PIPELINE",
        desc: "Pipeline de dados completo — da captura de sensores e consultas de bases de dados à interpretação algorítmica — e configuração de gestão de dados, produzindo um artefacto de conhecimento espacial que revela um padrão, dinâmica ou condição do mundo invisível à observação não assistida.",
        topics: ["Captura de sensores", "Visão computacional", "Nuvens de pontos", "Consultas de bases de dados", "Interpretação algorítmica", "Arquitetura de pipeline de dados", "Artefactos de conhecimento espacial", "Deteção de padrões"],
        workshopSession: "1 sessão · 2,5h + Q&A",
      },
      {
        tag: "Workshop 1",
        title: "Structuring the World",
        subtitle: "Forma e comportamento que emerge completamente das regras.",
        deliverable: "WORLD RULES-BASED ENGINE",
        desc: "Sistema de regras programado — da definição de leis, restrições e lógica generativa à sua implementação computacional — produzindo um modelo de mundo estruturado cuja forma, comportamento e organização emerge completamente das regras que o governam.",
        topics: ["Definição de regras", "Sistemas de restrições", "Lógica generativa", "Implementação computacional", "Comportamento emergente", "Validação do modelo de mundo"],
        workshopSession: "1 sessão · 2,5h + Q&A",
      },
      {
        tag: "Workshop 2",
        title: "Modelling the World",
        subtitle: "Geometria, comportamento e performance dinamicamente ligados.",
        deliverable: "WORLD SPATIAL FRAME",
        desc: "Sistema matemático e de geometria computacional avançada — da geometria associativa e modelação baseada em restrições à geração procedimental orientada para simulação — produzindo um modelo de mundo espacial em evolução contínua onde geometria, comportamento e performance permanecem dinamicamente ligados.",
        topics: ["Geometria associativa", "Modelação baseada em restrições", "Gémeos digitais", "MEF / AEF", "Geração procedimental", "Design orientado para simulação", "Complexidade & sistemas complexos", "Ligação dinâmica de performance"],
        workshopSession: "Workshop 2 — Masterclass",
      },
      {
        tag: "Workshop 2",
        title: "Simulating & Acting in the World",
        subtitle: "Modelos de mundo capazes de antecipar e agir.",
        deliverable: "WORLD PREDICTIVE SIMULATOR",
        desc: "Sistema de simulação preditiva e tomada de decisão autónoma — de dinâmicas espaciais, modelação comportamental e ambientes sintéticos à previsão em tempo real, planeamento e controlo adaptativo — produzindo modelos de mundo operacionais capazes de antecipar, avaliar e agir sobre cenários ambientais complexos.",
        topics: ["Dinâmicas espaciais", "Modelação comportamental", "IA multi-agente", "Integração LLM / RAG", "Motores de decisão", "Leis da física", "Previsão em tempo real", "Controlo adaptativo"],
        workshopSession: "1 sessão · 2,5h + Q&A",
      },
      {
        tag: "Workshop 3",
        title: "Communicating the World",
        subtitle: "Insights comunicáveis através do design, análise e operação.",
        deliverable: "WORLD ANALYTICS INTERFACE",
        desc: "Ambiente de representação do mundo e visualização de dados — de resultados de simulação multicamada e informação de projeto a narrativas visuais, documentação, comparações de performance e relatórios assistidos por IA — produzindo insights comunicáveis em workflows de design, análise e operação.",
        topics: ["Visualização de dados", "Visualização de simulação multicamada", "Narrativas visuais", "Relatórios assistidos por IA", "Comparação de performance", "Sistemas de documentação"],
        workshopSession: "Workshop 3 — Masterclass",
      },
      {
        tag: "Workshop 3",
        title: "Governing the World",
        subtitle: "Um mundo que se autorregula e mantém a sua própria coerência.",
        deliverable: "WORLD GOVERNANCE LAYER",
        desc: "Quadro de governança e controlo autónomo — de hierarquias de regras, políticas adaptativas e coordenação multi-agente à gestão controlada por retroalimentação — produzindo um modelo de mundo autorregulado que mantém a sua própria coerência, responde a anomalias e evolui o seu comportamento em condições mutáveis.",
        topics: ["Hierarquias de regras", "Políticas adaptativas", "Coordenação multi-agente", "Previsão futura", "Verdade / veracidade / empatia", "Controlo por retroalimentação", "Deteção de anomalias", "Design de sistema de governança"],
        workshopSession: "1 sessão · 2,5h + Q&A",
      },
      {
        tag: "Projeto Final",
        title: "Final Master Project",
        subtitle: "Um mundo, completamente construído, defendido.",
        deliverable: "WORLD MASTER PROJECT",
        desc: "O módulo final não é um resumo — é uma entrega. Cada estudante monta todos os componentes anteriores — brief, pipeline de dados, motor de regras, quadro espacial, simulador, interface de analítica, camada de governança — num único modelo de mundo integrado. O júri faz uma única pergunta: este mundo aguenta?",
        topics: ["Integração completa do mundo", "Síntese entre módulos", "Defesa do modelo de mundo", "Documentação do projeto", "Júri Final"],
        workshopSession: "Júri Final",
      },
    ],
  },
  workshops: {
    sectionTitle: "três workshops.",
    sectionSubtitle: "3 júris · 3 marcos",
    sectionDesc:
      "Cada workshop é um sprint intensivo onde os módulos anteriores convergem numa posição de mundo defendida. Três júris, três escaladas de resolução, um mundo que deve aguentar.",
    weekLabel: "Semana",
    items: [
      {
        title: "Imaginar, Ver\n& Estruturar",
        weeks: ["Ata do mundo & setup", "Sprint World Brief + Pipeline de dados", "Integração Rules-Based Engine", "Revisão & júri"],
      },
      {
        title: "Modelar &\nSimular",
        weeks: ["Setup Quadro Espacial", "Sprint Simulador Preditivo", "Integração modelo-simulação", "Revisão final"],
      },
      {
        title: "Comunicar,\nGovernançar & Final",
        weeks: ["Build Interface Analítica", "Sprint Camada de Governança", "Integração completa do mundo", "Júri Final"],
      },
    ],
  },
  footer: {
    tagline:
      "Mestrado em Mundos Artificiais Inteligentes. Programa de pós-graduação em IA espacial e modelação do mundo físico para o setor AEC.",
    programLabel: "Programa",
    programItems: ["Fundamentos", "Advanced", "Projeto Final"],
    applyLabel: "Candidatar",
    applyBtn: "falar com um orientador →",
  },
  miniChat: {
    label: "miaw",
    cta: "pergunte algo →",
    placeholder: "iniciar uma conversa",
  },
};

// ── Advanced: Chinese ─────────────────────────────────────────────────────────

const advancedZh: AdvancedT = {
  nav: {
    timeline: "时间轴",
    modules: "模块",
    workshops: "工作坊",
    howToApply: "如何申请",
  },
  hero: {
    metaLeft: "智能人工世界硕士",
    metaRight: "课程 02 — 进阶",
    titleLine1: "MIAW",
    titleLine2: "进阶。",
    premise: [
      {
        label: "前提",
        text: "构建一个完整的世界：框架它、看见它、构建它、建模它、模拟它、传达它，并治理它。九个模块，三个工作坊，一个完全实现的世界模型，能够运行、推理并自我维持。",
      },
      {
        label: "适合谁",
        text: "建筑师、研究人员、工程师和设计师，他们想构建可操作的 AI 世界模型——不是仪表板或渲染图，而是具有数据管道、规则引擎、空间框架和自主决策的功能性系统。",
      },
      {
        label: "成果",
        text: "一个完整、经过答辩的世界模型：brief、数据管道、规则引擎、空间框架、预测模拟器、分析界面和治理层——整合后在最终评审委员会前展示。",
      },
    ],
    stats: [
      { label: "学分" },
      { label: "总学时" },
      { label: "模块" },
      { label: "工作坊" },
      { label: "月份" },
    ],
    cta: "如何申请 →",
  },
  timeline: {
    title: "时间轴",
    subtitle: "9 个模块 · 8 个双周",
    monthLabels: ["第1月", "第2月", "第3月", "第4月", "第5月+"],
  },
  modules: {
    sectionTitle: "九个模块。",
    sectionDesc:
      "九个模块。九个双周。从零构建一个世界。每个模块贡献一个工作层——从最初的 brief 到数据管道、规则引擎、空间框架、预测模拟器、分析界面和治理层。进程是累积的：每个交付物为下一个提供支撑。",
    contentsLabel: "内容",
    loadLabel: "学时",
    workshopLabel: "工作坊",
    items: [
      {
        tag: "入学",
        title: "Advanced Program Setup",
        subtitle: "在开始构建世界之前先定义它。",
        deliverable: "WORLD PROJECT CHARTER",
        desc: "启动双周。每位学生定义自己想要建模的世界——其规模、领域和问题——并将三个工作坊与明确的研究和生产议程对应起来。分配导师并签署项目章程：什么世界、什么数据、什么系统、什么赌注。",
        topics: ["世界框架", "研究问题定义", "数据审计", "导师分配", "工作坊规划", "技术评审"],
        workshopSession: "预工作坊 1",
      },
      {
        tag: "工作坊 1",
        title: "Imagining the World",
        subtitle: "奠定系统基础及其触达范围。",
        deliverable: "WORLD BRIEF",
        desc: "交互式文档，结合 AI 生成的图像、系统图、研究问题、所需数据基础设施和作者声明，共同回答：您想建模什么世界，以及为什么这个世界重要。",
        topics: ["AI 图像生成", "系统图绘制", "研究问题表述", "数据基础设施规划", "作者定位", "世界概念开发"],
        workshopSession: "大师课 + 启动 + 跟进 + 决赛",
      },
      {
        tag: "工作坊 1",
        title: "Seeing the World",
        subtitle: "揭示非辅助观察所不可见的内容。",
        deliverable: "WORLD DATABASE PIPELINE",
        desc: "完整数据管道——从传感器采集和数据库查询到算法解释——以及数据管理设置，产生空间知识制品，揭示世界中对非辅助观察不可见的模式、动态或状态。",
        topics: ["传感器采集", "计算机视觉", "点云", "数据库查询", "算法解释", "数据管道架构", "空间知识制品", "模式识别"],
        workshopSession: "1 场课 · 2.5小时 + 问答",
      },
      {
        tag: "工作坊 1",
        title: "Structuring the World",
        subtitle: "形式与行为完全从规则中涌现。",
        deliverable: "WORLD RULES-BASED ENGINE",
        desc: "基于规则的编程系统——从法律、约束和生成逻辑的定义到其计算实现——产生一个结构化的世界模型，其形式、行为和组织完全从规则中涌现。",
        topics: ["规则定义", "约束系统", "生成逻辑", "计算实现", "涌现行为", "世界模型验证"],
        workshopSession: "1 场课 · 2.5小时 + 问答",
      },
      {
        tag: "工作坊 2",
        title: "Modelling the World",
        subtitle: "几何、行为与性能动态关联。",
        deliverable: "WORLD SPATIAL FRAME",
        desc: "高级数学和计算几何系统——从关联几何和基于约束的建模到面向仿真的程序生成——产生一个持续演化的空间世界模型，其中几何、行为和性能保持动态关联。",
        topics: ["关联几何", "基于约束的建模", "数字孪生", "有限元法 / 有限元分析", "程序生成", "面向仿真的设计", "复杂性与复杂系统", "动态性能关联"],
        workshopSession: "工作坊 2 — 大师课",
      },
      {
        tag: "工作坊 2",
        title: "Simulating & Acting in the World",
        subtitle: "能够预见并行动的世界模型。",
        deliverable: "WORLD PREDICTIVE SIMULATOR",
        desc: "预测仿真和自主决策系统——从空间动态、行为建模和合成环境到实时预测、规划和自适应控制——产生能够预见、评估并应对复杂环境场景的可操作世界模型。",
        topics: ["空间动态", "行为建模", "多智能体 AI", "LLM / RAG 集成", "决策引擎", "物理定律", "实时预测", "自适应控制"],
        workshopSession: "1 场课 · 2.5小时 + 问答",
      },
      {
        tag: "工作坊 3",
        title: "Communicating the World",
        subtitle: "可在设计、分析和运营中传达的洞察。",
        deliverable: "WORLD ANALYTICS INTERFACE",
        desc: "世界表征和数据可视化环境——从多层仿真结果和项目信息到视觉叙事、文档、性能比较和 AI 辅助报告——产生跨设计、分析和运营工作流的可传达洞察。",
        topics: ["数据可视化", "多层仿真显示", "视觉叙事", "AI 辅助报告", "性能比较", "文档系统"],
        workshopSession: "工作坊 3 — 大师课",
      },
      {
        tag: "工作坊 3",
        title: "Governing the World",
        subtitle: "一个自我调节并维持自身一致性的世界。",
        deliverable: "WORLD GOVERNANCE LAYER",
        desc: "自主治理和控制框架——从规则层级、自适应策略和多智能体协调到反馈控制管理——产生一个自我调节的世界模型，维持自身一致性，响应异常，并在条件变化下演化其行为。",
        topics: ["规则层级", "自适应策略", "多智能体协调", "未来预测", "真相 / 真实性 / 同理心", "反馈控制", "异常检测", "治理系统设计"],
        workshopSession: "1 场课 · 2.5小时 + 问答",
      },
      {
        tag: "最终项目",
        title: "Final Master Project",
        subtitle: "一个世界，完整构建，经过答辩。",
        deliverable: "WORLD MASTER PROJECT",
        desc: "最终模块不是总结——而是交付。每位学生将所有之前的组件——brief、数据管道、规则引擎、空间框架、模拟器、分析界面、治理层——组装成一个单一的集成世界模型。评审委员会问一个问题：这个世界能否成立？",
        topics: ["完整世界整合", "跨模块综合", "世界模型答辩", "项目文档", "最终评审"],
        workshopSession: "最终评审",
      },
    ],
  },
  workshops: {
    sectionTitle: "三个工作坊。",
    sectionSubtitle: "3 场评审 · 3 个里程碑",
    sectionDesc:
      "每个工作坊都是一次密集冲刺，前面的模块在一个经过答辩的世界立场中汇聚。三场评审，三次分辨率升级，一个必须成立的世界。",
    weekLabel: "第",
    items: [
      {
        title: "想象、观察\n与构建",
        weeks: ["世界章程与设置", "World Brief + 数据管道冲刺", "Rules-Based Engine 整合", "评审与答辩"],
      },
      {
        title: "建模与\n仿真",
        weeks: ["空间框架设置", "预测模拟器冲刺", "模型-仿真整合", "最终评审"],
      },
      {
        title: "传达、\n治理与决赛",
        weeks: ["构建分析界面", "治理层冲刺", "完整世界整合", "最终评审"],
      },
    ],
  },
  footer: {
    tagline:
      "智能人工世界硕士。面向 AEC 行业的空间 AI 与物理世界建模研究生课程。",
    programLabel: "课程",
    programItems: ["基础", "进阶", "最终项目"],
    applyLabel: "申请",
    applyBtn: "与顾问交流 →",
  },
  miniChat: {
    label: "miaw",
    cta: "随时提问 →",
    placeholder: "开始对话",
  },
};

// ── Advanced: Japanese ────────────────────────────────────────────────────────

const advancedJa: AdvancedT = {
  nav: {
    timeline: "タイムライン",
    modules: "モジュール",
    workshops: "ワークショップ",
    howToApply: "出願方法",
  },
  hero: {
    metaLeft: "インテリジェント人工世界修士",
    metaRight: "プログラム 02 — アドバンス",
    titleLine1: "MIAW",
    titleLine2: "アドバンス。",
    premise: [
      {
        label: "前提",
        text: "完全な世界を構築する：フレームし、見て、構造化し、モデリングし、シミュレートし、伝達し、統治する。9つのモジュール、3つのワークショップ、動作し、推論し、維持される完全に実現された世界モデル。",
      },
      {
        label: "対象者",
        text: "操作可能なAI世界モデルを構築したい建築家、研究者、エンジニア、デザイナー——ダッシュボードやレンダリングではなく、データパイプライン、ルールエンジン、空間フレーム、自律的意思決定を備えた機能するシステム。",
      },
      {
        label: "成果",
        text: "完全な、答辩された世界モデル：brief、データパイプライン、ルールエンジン、空間フレーム、予測シミュレーター、分析インターフェース、ガバナンス層——統合され、最終審査委員会の前で発表される。",
      },
    ],
    stats: [
      { label: "ECTS" },
      { label: "総学習量" },
      { label: "モジュール" },
      { label: "ワークショップ" },
      { label: "ヶ月" },
    ],
    cta: "出願方法 →",
  },
  timeline: {
    title: "タイムライン",
    subtitle: "9モジュール · 8フォートナイト",
    monthLabels: ["第1月", "第2月", "第3月", "第4月", "第5月+"],
  },
  modules: {
    sectionTitle: "9つのモジュール。",
    sectionDesc:
      "9つのモジュール。9つのフォートナイト。ゼロから構築された一つの世界。各モジュールは機能する層を提供する——最初のbriefからデータパイプライン、ルールエンジン、空間フレーム、予測シミュレーター、分析インターフェース、ガバナンス層まで。進行は累積的：各成果物が次のものを支える。",
    contentsLabel: "内容",
    loadLabel: "学習量",
    workshopLabel: "ワークショップ",
    items: [
      {
        tag: "オンボーディング",
        title: "Advanced Program Setup",
        subtitle: "構築を始める前に世界を定義する。",
        deliverable: "WORLD PROJECT CHARTER",
        desc: "スタートの2週間。各学生がモデリングしたい世界を定義する——スケール、ドメイン、問い——そして明確な研究・制作アジェンダに対して3つのワークショップをマッピングする。メンターが割り当てられ、プロジェクト憲章が署名される：どの世界、どのデータ、どのシステム、何が賭けられているか。",
        topics: ["世界フレーミング", "研究質問定義", "データ監査", "メンター割り当て", "ワークショップマッピング", "技術レビュー"],
        workshopSession: "プレワークショップ1",
      },
      {
        tag: "ワークショップ1",
        title: "Imagining the World",
        subtitle: "システムの基盤とその到達範囲を設定する。",
        deliverable: "WORLD BRIEF",
        desc: "AI生成画像、システム図、研究質問、必要なデータインフラ、作者声明を組み合わせたインタラクティブドキュメント——これらが共に答える：どの世界をモデリングしたいか、そしてなぜその世界は重要か。",
        topics: ["AI画像生成", "システム図作成", "研究質問策定", "データインフラマッピング", "作者ポジショニング", "世界コンセプト開発"],
        workshopSession: "マスタークラス + キックスタート + フォローアップ + ファイナル",
      },
      {
        tag: "ワークショップ1",
        title: "Seeing the World",
        subtitle: "非支援観察には見えないものを明らかにする。",
        deliverable: "WORLD DATABASE PIPELINE",
        desc: "完全なデータパイプライン——センサーキャプチャとデータベースクエリからアルゴリズム解釈まで——とデータ管理設定。非支援観察には見えない世界のパターン、ダイナミクス、状態を明らかにする空間知識アーティファクトを生成する。",
        topics: ["センサーキャプチャ", "コンピュータビジョン", "点群", "データベースクエリ", "アルゴリズム解釈", "データパイプラインアーキテクチャ", "空間知識アーティファクト", "パターン検出"],
        workshopSession: "1セッション · 2.5時間 + Q&A",
      },
      {
        tag: "ワークショップ1",
        title: "Structuring the World",
        subtitle: "ルールから完全に生まれる形式と振る舞い。",
        deliverable: "WORLD RULES-BASED ENGINE",
        desc: "ルールベースプログラムシステム——法律、制約、生成ロジックの定義からその計算実装まで——形式、振る舞い、組織が統治するルールから完全に生まれる構造化された世界モデルを生成する。",
        topics: ["ルール定義", "制約システム", "生成ロジック", "計算実装", "創発的振る舞い", "世界モデル検証"],
        workshopSession: "1セッション · 2.5時間 + Q&A",
      },
      {
        tag: "ワークショップ2",
        title: "Modelling the World",
        subtitle: "ジオメトリ、振る舞い、パフォーマンスが動的にリンクされる。",
        deliverable: "WORLD SPATIAL FRAME",
        desc: "高度な数学的・計算幾何学システム——関連ジオメトリと制約ベースモデリングからシミュレーション対応手続き生成まで——ジオメトリ、振る舞い、パフォーマンスが動的にリンクされた状態を維持する継続的に進化する空間世界モデルを生成する。",
        topics: ["関連ジオメトリ", "制約ベースモデリング", "デジタルツイン", "FEM / FEA", "手続き生成", "シミュレーション対応設計", "複雑性 & 複雑システム", "動的パフォーマンスリンク"],
        workshopSession: "ワークショップ2 — マスタークラス",
      },
      {
        tag: "ワークショップ2",
        title: "Simulating & Acting in the World",
        subtitle: "予測し、行動できる世界モデル。",
        deliverable: "WORLD PREDICTIVE SIMULATOR",
        desc: "予測シミュレーションと自律的意思決定システム——空間ダイナミクス、行動モデリング、合成環境からリアルタイム予測、計画、適応制御まで——複雑な環境シナリオを予測、評価、行動できる運用可能な世界モデルを生成する。",
        topics: ["空間ダイナミクス", "行動モデリング", "マルチエージェントAI", "LLM / RAG統合", "決策エンジン", "物理法則", "リアルタイム予測", "適応制御"],
        workshopSession: "1セッション · 2.5時間 + Q&A",
      },
      {
        tag: "ワークショップ3",
        title: "Communicating the World",
        subtitle: "設計、分析、運用を横断する伝達可能なインサイト。",
        deliverable: "WORLD ANALYTICS INTERFACE",
        desc: "世界表現とデータ可視化環境——多層シミュレーション結果とプロジェクト情報からビジュアルナラティブ、ドキュメント、パフォーマンス比較、AI支援レポートまで——設計、分析、運用ワークフローにわたる伝達可能なインサイトを生成する。",
        topics: ["データ可視化", "多層シミュレーション表示", "ビジュアルナラティブ", "AI支援レポート", "パフォーマンス比較", "ドキュメントシステム"],
        workshopSession: "ワークショップ3 — マスタークラス",
      },
      {
        tag: "ワークショップ3",
        title: "Governing the World",
        subtitle: "自己調整し、独自の整合性を維持する世界。",
        deliverable: "WORLD GOVERNANCE LAYER",
        desc: "自律ガバナンスと制御フレームワーク——ルール階層、適応ポリシー、マルチエージェント調整からフィードバック制御管理まで——独自の整合性を維持し、異常に対応し、変化する条件下で振る舞いを進化させる自己調整世界モデルを生成する。",
        topics: ["ルール階層", "適応ポリシー", "マルチエージェント調整", "未来予測", "真実 / 真実性 / 共感", "フィードバック制御", "異常検出", "ガバナンスシステム設計"],
        workshopSession: "1セッション · 2.5時間 + Q&A",
      },
      {
        tag: "最終プロジェクト",
        title: "Final Master Project",
        subtitle: "一つの世界、完全に構築され、答辩された。",
        deliverable: "WORLD MASTER PROJECT",
        desc: "最終モジュールはまとめではない——納品だ。各学生は以前のすべてのコンポーネント——brief、データパイプライン、ルールエンジン、空間フレーム、シミュレーター、分析インターフェース、ガバナンス層——を単一の統合世界モデルに組み立てる。審査委員会は一つの質問をする：この世界は成立するか？",
        topics: ["完全世界統合", "モジュール横断合成", "世界モデル答辩", "プロジェクトドキュメント", "最終審査"],
        workshopSession: "最終審査",
      },
    ],
  },
  workshops: {
    sectionTitle: "3つのワークショップ。",
    sectionSubtitle: "3つの審査 · 3つのマイルストーン",
    sectionDesc:
      "各ワークショップは、前のモジュールが答辩された世界的立場に収束する集中スプリントだ。3つの審査、3つの解像度エスカレーション、成立しなければならない一つの世界。",
    weekLabel: "週",
    items: [
      {
        title: "想像し、見て\n構造化する",
        weeks: ["世界憲章 & セットアップ", "World Brief + データパイプライン スプリント", "Rules-Based Engine 統合", "レビュー & 審査"],
      },
      {
        title: "モデリング &\nシミュレーション",
        weeks: ["空間フレーム セットアップ", "予測シミュレーター スプリント", "モデル-シミュレーション 統合", "最終レビュー"],
      },
      {
        title: "伝達し、\n統治し、決勝",
        weeks: ["分析インターフェース 構築", "ガバナンス層 スプリント", "完全世界統合", "最終審査"],
      },
    ],
  },
  footer: {
    tagline:
      "インテリジェント人工世界修士。AECセクター向けの空間AIと物理世界モデリングの大学院プログラム。",
    programLabel: "プログラム",
    programItems: ["基礎", "アドバンス", "最終プロジェクト"],
    applyLabel: "出願",
    applyBtn: "アドバイザーと話す →",
  },
  miniChat: {
    label: "miaw",
    cta: "何でも聞いて →",
    placeholder: "会話を始める",
  },
};

export const advancedTranslations: Record<Lang, AdvancedT> = {
  en: advancedEn,
  es: advancedEs,
  fr: advancedFr,
  de: advancedDe,
  pt: advancedPt,
  zh: advancedZh,
  ja: advancedJa,
};

// ── Canvas UI translations ────────────────────────────────────────────────────
// Covers: nav tabs, chat placeholder, error messages,
// ApplyScreen form strings, CTAOverlay fork/waitlist strings.

export interface CanvasUI {
  nav: {
    howToApply: string;
    program: string;
    faculty: string;
    guests: string;
    institutions: string;
    timeline: string;
    workshop: string;
  };
  chat: {
    placeholder: string;
    rateLimit: string;
    error: string;
  };
  apply: {
    panelTitle: string;
    stepConversation: string;
    stepSubmit: string;
    stepReview: string;
    heading: string;
    subheading: string;
    gdprLabel: string;
    submitBtn: string;
    processingTitle: string;
    processingDesc: string;
    doneTitle: string;
    doneDesc: string;
    doneBack: string;
    errorEmail: string;
    errorConsent: string;
    errorGeneric: string;
  };
  cta: {
    forkTitle: string;
    forkDesc: string;
    joinWaitlist: string;
    applyNow: string;
    remember: string;
    waitlistTitle: string;
    waitlistDesc: string;
    waitlistBtn: string;
    waitlistBack: string;
    doneTitle: string;
    doneDesc: string;
    errorEmail: string;
    errorGeneric: string;
  };
}

export const canvasUI: Record<Lang, CanvasUI> = {
  en: {
    nav: {
      howToApply: "How to apply",
      program: "Program",
      faculty: "Faculty",
      guests: "Guests",
      institutions: "Institutions",
      timeline: "Timeline",
      workshop: "Workshop",
    },
    chat: {
      placeholder: "type here...",
      rateLimit: "You've had a good conversation. Come back in an hour.",
      error: "Something went wrong. Try again.",
    },
    apply: {
      panelTitle: "Application",
      stepConversation: "Conversation",
      stepSubmit: "Submit",
      stepReview: "Review",
      heading: "Ready to apply.",
      subheading: "We'll process your conversation with AI to prepare a personalised review. You'll receive an email confirmation with the decision timeline.",
      gdprLabel: "I agree to MIAW processing this conversation and my contact details for admissions consideration. I can withdraw consent at any time by emailing MIAW directly.",
      submitBtn: "Submit application →",
      processingTitle: "Processing your application…",
      processingDesc: "We're reviewing your conversation and preparing a personalised response. This takes about 10 seconds.",
      doneTitle: "Application received.",
      doneDesc: "Check your email — we've sent a personalised acknowledgment with your application details and the decision timeline.",
      doneBack: "← see your personalised response",
      errorEmail: "Please enter a valid email address.",
      errorConsent: "Please confirm your consent to proceed.",
      errorGeneric: "Something went wrong. Try again.",
    },
    cta: {
      forkTitle: "Want to be part of the first cohort?",
      forkDesc: "Two ways in: stay on the waitlist and we'll reach out, or keep talking and apply directly — right here.",
      joinWaitlist: "Join the waitlist",
      applyNow: "Apply now →",
      remember: "Remember our conversation so you don't have to start over next time",
      waitlistTitle: "Stay in the loop.",
      waitlistDesc: "Leave your email and we'll reach out when applications open.",
      waitlistBtn: "Join waitlist",
      waitlistBack: "← back",
      doneTitle: "You're in.",
      doneDesc: "We'll reach out when applications open. People like you are exactly who we're building this for.",
      errorEmail: "Please enter a valid email.",
      errorGeneric: "Something went wrong. Try again.",
    },
  },
  es: {
    nav: {
      howToApply: "Cómo aplicar",
      program: "Programa",
      faculty: "Facultad",
      guests: "Invitados",
      institutions: "Instituciones",
      timeline: "Cronograma",
      workshop: "Workshop",
    },
    chat: {
      placeholder: "escribe aquí...",
      rateLimit: "Has tenido una buena conversación. Vuelve en una hora.",
      error: "Algo salió mal. Inténtalo de nuevo.",
    },
    apply: {
      panelTitle: "Aplicación",
      stepConversation: "Conversación",
      stepSubmit: "Enviar",
      stepReview: "Revisión",
      heading: "Listo para aplicar.",
      subheading: "Procesaremos tu conversación con IA para preparar una revisión personalizada. Recibirás una confirmación por email con el calendario de decisión.",
      gdprLabel: "Acepto que MIAW procese esta conversación y mis datos de contacto para la consideración de admisión. Puedo retirar mi consentimiento en cualquier momento enviando un email directamente a MIAW.",
      submitBtn: "Enviar solicitud →",
      processingTitle: "Procesando tu solicitud…",
      processingDesc: "Estamos revisando tu conversación y preparando una respuesta personalizada. Esto tarda unos 10 segundos.",
      doneTitle: "Solicitud recibida.",
      doneDesc: "Revisa tu email — hemos enviado un acuse de recibo personalizado con los detalles de tu solicitud y el calendario de decisión.",
      doneBack: "← ver tu respuesta personalizada",
      errorEmail: "Por favor, introduce una dirección de email válida.",
      errorConsent: "Por favor, confirma tu consentimiento para continuar.",
      errorGeneric: "Algo salió mal. Inténtalo de nuevo.",
    },
    cta: {
      forkTitle: "¿Quieres ser parte de la primera cohorte?",
      forkDesc: "Dos formas de entrar: quédate en la lista de espera y te contactaremos, o sigue hablando y aplica directamente — aquí mismo.",
      joinWaitlist: "Unirse a la lista de espera",
      applyNow: "Aplicar ahora →",
      remember: "Recordar nuestra conversación para no tener que empezar de nuevo la próxima vez",
      waitlistTitle: "Mantente al día.",
      waitlistDesc: "Déjanos tu email y te contactaremos cuando se abran las aplicaciones.",
      waitlistBtn: "Unirse a la lista",
      waitlistBack: "← volver",
      doneTitle: "Ya estás dentro.",
      doneDesc: "Te contactaremos cuando se abran las aplicaciones. Personas como tú son exactamente para quienes estamos construyendo esto.",
      errorEmail: "Por favor, introduce un email válido.",
      errorGeneric: "Algo salió mal. Inténtalo de nuevo.",
    },
  },
  fr: {
    nav: {
      howToApply: "Comment postuler",
      program: "Programme",
      faculty: "Corps enseignant",
      guests: "Invités",
      institutions: "Institutions",
      timeline: "Calendrier",
      workshop: "Atelier",
    },
    chat: {
      placeholder: "écrivez ici...",
      rateLimit: "Vous avez eu une bonne conversation. Revenez dans une heure.",
      error: "Quelque chose s'est mal passé. Réessayez.",
    },
    apply: {
      panelTitle: "Candidature",
      stepConversation: "Conversation",
      stepSubmit: "Soumettre",
      stepReview: "Révision",
      heading: "Prêt à postuler.",
      subheading: "Nous traiterons votre conversation avec l'IA pour préparer une révision personnalisée. Vous recevrez une confirmation par email avec le calendrier de décision.",
      gdprLabel: "J'accepte que MIAW traite cette conversation et mes coordonnées pour l'examen de candidature. Je peux retirer mon consentement à tout moment en envoyant un email directement à MIAW.",
      submitBtn: "Soumettre la candidature →",
      processingTitle: "Traitement de votre candidature…",
      processingDesc: "Nous examinons votre conversation et préparons une réponse personnalisée. Cela prend environ 10 secondes.",
      doneTitle: "Candidature reçue.",
      doneDesc: "Vérifiez votre email — nous avons envoyé un accusé de réception personnalisé avec les détails de votre candidature et le calendrier de décision.",
      doneBack: "← voir votre réponse personnalisée",
      errorEmail: "Veuillez entrer une adresse email valide.",
      errorConsent: "Veuillez confirmer votre consentement pour continuer.",
      errorGeneric: "Quelque chose s'est mal passé. Réessayez.",
    },
    cta: {
      forkTitle: "Voulez-vous faire partie de la première cohorte ?",
      forkDesc: "Deux façons d'entrer : restez sur la liste d'attente et nous vous contacterons, ou continuez à discuter et postulez directement — ici même.",
      joinWaitlist: "Rejoindre la liste d'attente",
      applyNow: "Postuler maintenant →",
      remember: "Se souvenir de notre conversation pour ne pas recommencer la prochaine fois",
      waitlistTitle: "Restez informé.",
      waitlistDesc: "Laissez votre email et nous vous contacterons quand les candidatures ouvrent.",
      waitlistBtn: "Rejoindre la liste",
      waitlistBack: "← retour",
      doneTitle: "Vous êtes inscrit.",
      doneDesc: "Nous vous contacterons quand les candidatures ouvrent. Des personnes comme vous sont exactement pour qui nous construisons cela.",
      errorEmail: "Veuillez entrer un email valide.",
      errorGeneric: "Quelque chose s'est mal passé. Réessayez.",
    },
  },
  de: {
    nav: {
      howToApply: "Bewerbung",
      program: "Programm",
      faculty: "Dozenten",
      guests: "Gäste",
      institutions: "Institutionen",
      timeline: "Zeitplan",
      workshop: "Workshop",
    },
    chat: {
      placeholder: "hier tippen...",
      rateLimit: "Sie hatten ein gutes Gespräch. Kommen Sie in einer Stunde wieder.",
      error: "Etwas ist schiefgelaufen. Versuchen Sie es erneut.",
    },
    apply: {
      panelTitle: "Bewerbung",
      stepConversation: "Gespräch",
      stepSubmit: "Einreichen",
      stepReview: "Überprüfung",
      heading: "Bereit zur Bewerbung.",
      subheading: "Wir verarbeiten Ihr Gespräch mit KI, um eine persönliche Überprüfung vorzubereiten. Sie erhalten eine E-Mail-Bestätigung mit dem Entscheidungszeitplan.",
      gdprLabel: "Ich stimme zu, dass MIAW dieses Gespräch und meine Kontaktdaten für die Zulassungsprüfung verarbeitet. Ich kann meine Zustimmung jederzeit durch eine direkte E-Mail an MIAW widerrufen.",
      submitBtn: "Bewerbung einreichen →",
      processingTitle: "Bewerbung wird bearbeitet…",
      processingDesc: "Wir überprüfen Ihr Gespräch und bereiten eine persönliche Antwort vor. Das dauert etwa 10 Sekunden.",
      doneTitle: "Bewerbung erhalten.",
      doneDesc: "Überprüfen Sie Ihre E-Mail — wir haben eine persönliche Bestätigung mit Ihren Bewerbungsdetails und dem Entscheidungszeitplan gesendet.",
      doneBack: "← Ihre persönliche Antwort ansehen",
      errorEmail: "Bitte geben Sie eine gültige E-Mail-Adresse ein.",
      errorConsent: "Bitte bestätigen Sie Ihre Zustimmung, um fortzufahren.",
      errorGeneric: "Etwas ist schiefgelaufen. Versuchen Sie es erneut.",
    },
    cta: {
      forkTitle: "Möchten Sie Teil der ersten Kohorte sein?",
      forkDesc: "Zwei Wege hinein: bleiben Sie auf der Warteliste und wir melden uns, oder sprechen Sie weiter und bewerben Sie sich direkt — hier.",
      joinWaitlist: "Zur Warteliste",
      applyNow: "Jetzt bewerben →",
      remember: "Unser Gespräch merken, damit Sie nicht beim nächsten Mal von vorne beginnen müssen",
      waitlistTitle: "Bleiben Sie informiert.",
      waitlistDesc: "Hinterlassen Sie Ihre E-Mail und wir melden uns, wenn die Bewerbungen öffnen.",
      waitlistBtn: "Zur Warteliste",
      waitlistBack: "← zurück",
      doneTitle: "Sie sind dabei.",
      doneDesc: "Wir melden uns, wenn die Bewerbungen öffnen. Menschen wie Sie sind genau die, für die wir das aufbauen.",
      errorEmail: "Bitte geben Sie eine gültige E-Mail ein.",
      errorGeneric: "Etwas ist schiefgelaufen. Versuchen Sie es erneut.",
    },
  },
  pt: {
    nav: {
      howToApply: "Como candidatar",
      program: "Programa",
      faculty: "Corpo docente",
      guests: "Convidados",
      institutions: "Instituições",
      timeline: "Cronograma",
      workshop: "Workshop",
    },
    chat: {
      placeholder: "escreva aqui...",
      rateLimit: "Teve uma boa conversa. Volte daqui a uma hora.",
      error: "Algo correu mal. Tente novamente.",
    },
    apply: {
      panelTitle: "Candidatura",
      stepConversation: "Conversa",
      stepSubmit: "Enviar",
      stepReview: "Revisão",
      heading: "Pronto para candidatar.",
      subheading: "Processaremos a sua conversa com IA para preparar uma revisão personalizada. Receberá uma confirmação por email com o calendário de decisão.",
      gdprLabel: "Aceito que a MIAW processe esta conversa e os meus dados de contacto para consideração de admissão. Posso retirar o meu consentimento a qualquer momento enviando um email diretamente à MIAW.",
      submitBtn: "Enviar candidatura →",
      processingTitle: "A processar a sua candidatura…",
      processingDesc: "Estamos a rever a sua conversa e a preparar uma resposta personalizada. Isto demora cerca de 10 segundos.",
      doneTitle: "Candidatura recebida.",
      doneDesc: "Verifique o seu email — enviámos um acuse de recibo personalizado com os detalhes da sua candidatura e o calendário de decisão.",
      doneBack: "← ver a sua resposta personalizada",
      errorEmail: "Por favor, introduza um endereço de email válido.",
      errorConsent: "Por favor, confirme o seu consentimento para continuar.",
      errorGeneric: "Algo correu mal. Tente novamente.",
    },
    cta: {
      forkTitle: "Quer fazer parte da primeira coorte?",
      forkDesc: "Duas formas de entrar: fique na lista de espera e entraremos em contacto, ou continue a conversar e candidate-se diretamente — aqui mesmo.",
      joinWaitlist: "Juntar à lista de espera",
      applyNow: "Candidatar agora →",
      remember: "Lembrar a nossa conversa para não ter de recomeçar da próxima vez",
      waitlistTitle: "Fique a par.",
      waitlistDesc: "Deixe o seu email e entraremos em contacto quando as candidaturas abrirem.",
      waitlistBtn: "Juntar à lista",
      waitlistBack: "← voltar",
      doneTitle: "Está dentro.",
      doneDesc: "Entraremos em contacto quando as candidaturas abrirem. Pessoas como você são exatamente para quem estamos a construir isto.",
      errorEmail: "Por favor, introduza um email válido.",
      errorGeneric: "Algo correu mal. Tente novamente.",
    },
  },
  zh: {
    nav: {
      howToApply: "如何申请",
      program: "课程",
      faculty: "教师",
      guests: "嘉宾",
      institutions: "合作机构",
      timeline: "时间轴",
      workshop: "工作坊",
    },
    chat: {
      placeholder: "在此输入...",
      rateLimit: "您已进行了一次很好的对话。请一小时后再回来。",
      error: "出了点问题。请重试。",
    },
    apply: {
      panelTitle: "申请",
      stepConversation: "对话",
      stepSubmit: "提交",
      stepReview: "评审",
      heading: "准备好申请了。",
      subheading: "我们将用 AI 处理您的对话，为您准备个性化审核。您将收到一封包含决策时间表的电子邮件确认。",
      gdprLabel: "我同意 MIAW 处理此对话和我的联系方式用于录取考虑。我可以随时直接向 MIAW 发送电子邮件撤回同意。",
      submitBtn: "提交申请 →",
      processingTitle: "正在处理您的申请…",
      processingDesc: "我们正在审查您的对话并准备个性化回复。这大约需要 10 秒。",
      doneTitle: "申请已收到。",
      doneDesc: "请查看您的电子邮件——我们已发送包含申请详情和决策时间表的个性化确认。",
      doneBack: "← 查看您的个性化回复",
      errorEmail: "请输入有效的电子邮件地址。",
      errorConsent: "请确认您的同意以继续。",
      errorGeneric: "出了点问题。请重试。",
    },
    cta: {
      forkTitle: "想成为第一批学员吗？",
      forkDesc: "两种途径：加入候补名单等待联系，或继续交流直接申请——就在这里。",
      joinWaitlist: "加入候补名单",
      applyNow: "立即申请 →",
      remember: "记住我们的对话，下次无需重新开始",
      waitlistTitle: "保持联系。",
      waitlistDesc: "留下您的电子邮件，申请开放时我们会联系您。",
      waitlistBtn: "加入名单",
      waitlistBack: "← 返回",
      doneTitle: "已登记。",
      doneDesc: "申请开放时我们会联系您。像您这样的人正是我们为之而建的。",
      errorEmail: "请输入有效的电子邮件。",
      errorGeneric: "出了点问题。请重试。",
    },
  },
  ja: {
    nav: {
      howToApply: "出願方法",
      program: "プログラム",
      faculty: "教員",
      guests: "ゲスト",
      institutions: "機関",
      timeline: "タイムライン",
      workshop: "ワークショップ",
    },
    chat: {
      placeholder: "ここに入力...",
      rateLimit: "良い会話ができました。1時間後にお戻りください。",
      error: "問題が発生しました。再試行してください。",
    },
    apply: {
      panelTitle: "出願",
      stepConversation: "会話",
      stepSubmit: "提出",
      stepReview: "審査",
      heading: "出願の準備ができました。",
      subheading: "AIを使って会話を処理し、個別審査の準備をします。決定スケジュールを含むメール確認をお送りします。",
      gdprLabel: "入学審査のために、MIAWがこの会話と連絡先を処理することに同意します。MIAWに直接メールすることで、いつでも同意を撤回できます。",
      submitBtn: "出願を提出 →",
      processingTitle: "出願を処理中…",
      processingDesc: "会話を確認し、個別対応を準備しています。約10秒かかります。",
      doneTitle: "出願を受け取りました。",
      doneDesc: "メールをご確認ください——出願詳細と決定スケジュールを含む個別の受領確認をお送りしました。",
      doneBack: "← 個別の返答を見る",
      errorEmail: "有効なメールアドレスを入力してください。",
      errorConsent: "続行するには同意を確認してください。",
      errorGeneric: "問題が発生しました。再試行してください。",
    },
    cta: {
      forkTitle: "最初のコホートの一員になりませんか？",
      forkDesc: "2つの参加方法：キャンセル待ちリストに登録して連絡を待つか、会話を続けて直接出願する——ここで。",
      joinWaitlist: "キャンセル待ちに登録",
      applyNow: "今すぐ出願 →",
      remember: "次回最初からやり直さなくて済むよう会話を記憶する",
      waitlistTitle: "最新情報をお届けします。",
      waitlistDesc: "メールを残してください。出願が開始したらご連絡します。",
      waitlistBtn: "リストに参加",
      waitlistBack: "← 戻る",
      doneTitle: "登録完了。",
      doneDesc: "出願が開始したらご連絡します。あなたのような方のために作っています。",
      errorEmail: "有効なメールを入力してください。",
      errorGeneric: "問題が発生しました。再試行してください。",
    },
  },
};

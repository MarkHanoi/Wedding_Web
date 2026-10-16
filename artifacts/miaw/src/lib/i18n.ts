export const languageOptions = [
  { value: "en", label: "English" },
  { value: "es", label: "Español" },
  { value: "fr", label: "Français" },
  { value: "pt", label: "Português" },
] as const;

export type Language = (typeof languageOptions)[number]["value"];
export type GalleryKey = "preWedding" | "venue" | "brunch";

interface DayCopy {
  date: string;
  title: string;
  description: string;
  location: string;
  events: { time: string; name: string }[];
  gallery: GalleryKey;
}

export interface SiteCopy {
  languageLabel: string;
  hero: {
    tagline: string;
    explore: string;
    exploreLabel: string;
    mute: string;
    unmute: string;
  };
  navigation: {
    mainSections: string;
    backToIntro: string;
    sections: string[];
  };
  intro: {
    eyebrow: string;
    scrollToStory: string;
  };
  story: {
    title: string;
    paragraphs: string[];
  };
  weekend: {
    eyebrow: string;
    title: string;
    description: string;
    mapLink: string;
    days: DayCopy[];
  };
  location: {
    eyebrow: string;
    title: string;
    description: string;
    mapLink: string;
  };
  travel: {
    eyebrow: string;
    title: string;
    description: string;
    items: { title: string; description: string }[];
  };
  faq: {
    eyebrow: string;
    title: string;
    items: { question: string; answer: string }[];
  };
  dressCode: {
    eyebrow: string;
    title: string;
    description: string;
    swatchesLabel: string;
  };
  rsvp: {
    eyebrow: string;
    title: string;
    description: string;
    thankYou: string;
    accepted: string;
    declined: string;
    nameLabel: string;
    namePlaceholder: string;
    attendanceLegend: string;
    accept: string;
    decline: string;
    additionalGuests: string;
    shuttleLegend: string;
    shuttleYes: string;
    shuttleNo: string;
    dietaryLabel: string;
    dietaryPlaceholder: string;
    noteLabel: string;
    optional: string;
    notePlaceholder: string;
    send: string;
    sending: string;
    error: string;
  };
  footer: string;
  galleries: {
    carouselRole: string;
    previous: string;
    next: string;
    choose: string;
    preWeddingLabel: string;
    venueLabel: string;
    brunchLabel: string;
    preWeddingAlts: string[];
    venueAlts: string[];
    brunchAlt: string;
  };
}

export const translations: Record<Language, SiteCopy> = {
  en: {
    languageLabel: "Choose language",
    hero: {
      tagline: "We're Getting Married",
      explore: "Explore ↓",
      exploreLabel: "Explore the wedding information",
      mute: "Mute music",
      unmute: "Unmute music",
    },
    navigation: {
      mainSections: "Main sections",
      backToIntro: "Back to intro",
      sections: ["Our story", "The weekend", "Location", "Travel", "Good to know", "Dress code", "RSVP"],
    },
    intro: {
      eyebrow: "We're Getting Married",
      scrollToStory: "Scroll to our story",
    },
    story: {
      title: "Our Story",
      paragraphs: [
        "A French girl meets a Spanish boy in London in 2016. We met in a nightclub, under terrible lighting, and somehow things worked out.",
        "Since then, we’ve lived in Sydney, Brisbane and eventually Portugal, collecting a fair number of suitcases along the way — either because we were in love or very bad at settling down.",
        "In 2022, we started building a house in Portugal, then decided to take a year off to travel the world together. The ultimate relationship stress test: a year of adventures, constant company and no escape. Somehow, we’re getting married — in Portugal, somewhere between France and Spain, which seemed like a fair compromise.",
        "Ten years, countless countries and a few big adventures later, we have learned that the best place we have ever been is right next to each other.",
        "Lisbon, we’re ready.",
      ],
    },
    weekend: {
      eyebrow: "The weekend",
      title: "Meet us in South Lisbon",
      description: "Three days together on the Lisbon coast. More practical details will be added here as they’re confirmed.",
      mapLink: "View the beach on a map",
      days: [
        {
          date: "Friday · 18 June 2027",
          title: "Pre-wedding gathering",
          description: "An evening together by the water before the wedding.",
          location: "Aroeira Beach · Fonte da Telha",
          events: [{ time: "Evening", name: "Pre-wedding celebration" }],
          gallery: "preWedding",
        },
        {
          date: "Saturday · 19 June 2027",
          title: "The wedding",
          description: "A ceremony beneath the open sky, followed by dinner and dancing.",
          location: "South Lisbon · full venue details to follow",
          events: [
            { time: "17:00", name: "Ceremony" },
            { time: "18:00", name: "Cocktails" },
            { time: "21:00", name: "Dinner" },
            { time: "Late", name: "Dancing" },
          ],
          gallery: "venue",
        },
        {
          date: "Sunday · 20 June 2027",
          title: "Beach brunch",
          description: "A slow, sunny goodbye by the water.",
          location: "Details to follow",
          events: [{ time: "Midday", name: "Brunch" }],
          gallery: "brunch",
        },
      ],
    },
    location: {
      eyebrow: "The place",
      title: "South Lisbon, close to the sea",
      description: "Our pre-wedding gathering is at Aroeira Beach in Fonte da Telha. The wedding celebration will be in South Lisbon; we’ll share the exact venue and address as soon as they’re confirmed.",
      mapLink: "Aroeira Beach · Fonte da Telha",
    },
    travel: {
      eyebrow: "Travel & stay",
      title: "A little further south",
      description: "Fly into Lisbon Airport (LIS). We’ll share accommodation suggestions and local transport details when they’re ready.",
      items: [
        { title: "Getting here", description: "Lisbon Airport is the closest international airport." },
        { title: "Where to stay", description: "Stay recommendations will be added soon." },
        { title: "Getting around", description: "We’ll share local transport and shuttle information closer to the day." },
      ],
    },
    faq: {
      eyebrow: "A few notes",
      title: "Good to know",
      items: [
        { question: "Are children welcome?", answer: "Yes, we’d love to see them." },
        { question: "What if it’s windy or rainy?", answer: "We have a covered plan so the day stays beautiful." },
        { question: "Gifts?", answer: "Your presence is the gift. A contribution to our honeymoon is welcome." },
      ],
    },
    dressCode: {
      eyebrow: "Dress code",
      title: "Ivory, sand & soft light",
      description: "Think natural linen, airy fabrics and warm neutrals. Please leave white for the bride and black at home.",
      swatchesLabel: "Suggested colours",
    },
    rsvp: {
      eyebrow: "RSVP",
      title: "Will you join us?",
      description: "Please reply for the wedding weekend. We’ll add the response deadline soon.",
      thankYou: "Thank you, {name}.",
      accepted: "We can’t wait to celebrate with you.",
      declined: "We’ll miss you, but thank you for letting us know.",
      nameLabel: "Your name",
      namePlaceholder: "Full name",
      attendanceLegend: "Will you attend?",
      accept: "Joyfully accepts",
      decline: "Regretfully declines",
      additionalGuests: "Additional guests, excluding yourself",
      shuttleLegend: "Will you need a shuttle?",
      shuttleYes: "Yes, please",
      shuttleNo: "No, thank you",
      dietaryLabel: "Dietary requirements",
      dietaryPlaceholder: "Allergies or preferences",
      noteLabel: "A note for the couple",
      optional: "(optional)",
      notePlaceholder: "Write a little note…",
      send: "Send your reply",
      sending: "Sending…",
      error: "We couldn't send your reply just now. Please try again in a moment.",
    },
    footer: "Clémence & Antonio · Lisbon Coast · 2027",
    galleries: {
      carouselRole: "carousel",
      previous: "Show previous photo",
      next: "Show next photo",
      choose: "Choose a photo",
      preWeddingLabel: "Pre-wedding photos",
      venueLabel: "Wedding venue photos",
      brunchLabel: "Brunch photo",
      preWeddingAlts: [
        "Aerial view of Fonte da Telha beach and coastline",
        "A sandy path winding through the dunes toward the beach",
        "View of the Atlantic coastline from the cliffs above the beach",
        "Shaded tables on a beachside restaurant terrace",
        "Atlantic waves rolling onto the shore, seen from above",
        "Relaxed lounge seating overlooking Fonte da Telha beach",
      ],
      venueAlts: [
        "Aerial view of the wedding venue among the wooded grounds",
        "Garden terrace beneath the shade of a large oak tree",
        "Coral-pink venue entrance framed by cypress trees",
        "The venue courtyard warmly lit after dark",
        "A shaded garden seating area with blue benches",
        "The coral-pink garden wall and entrance gate",
      ],
      brunchAlt: "Outdoor brunch table with fresh fruit, pastries and drinks",
    },
  },
  es: {
    languageLabel: "Seleccionar idioma",
    hero: {
      tagline: "Nos casamos",
      explore: "Explorar ↓",
      exploreLabel: "Explorar la información de la boda",
      mute: "Silenciar música",
      unmute: "Activar música",
    },
    navigation: {
      mainSections: "Secciones principales",
      backToIntro: "Volver al inicio",
      sections: ["Nuestra historia", "El fin de semana", "Lugar", "Viaje", "Información útil", "Vestimenta", "Confirmación"],
    },
    intro: {
      eyebrow: "Nos casamos",
      scrollToStory: "Desplazarse a nuestra historia",
    },
    story: {
      title: "Nuestra historia",
      paragraphs: [
        "Clémence, de Jouy-en-Josas, Francia, y Antonio, de Córdoba, España, se conocieron en Londres en 2016. Lo que empezó allí pronto se convirtió en una aventura compartida que les llevó por países y continentes.",
        "Tras dos años en Londres, se mudaron a Sídney en 2018 y luego a Brisbane en 2019. En 2022 dieron otro gran paso y se instalaron en Portugal, al norte de Lisboa, donde empezaron a construir juntos una casa.",
        "Por el camino recorrieron el mundo, coleccionando recuerdos, descubriendo lugares nuevos y haciendo de cada aventura parte de su historia.",
        "Hoy han vuelto a la orilla sur de Lisboa, el lugar al que llaman hogar y donde celebrarán con ilusión el próximo capítulo de su viaje, rodeados de las personas que más quieren.",
        "Y así continúa su historia…",
      ],
    },
    weekend: {
      eyebrow: "El fin de semana",
      title: "Nos vemos en el sur de Lisboa",
      description: "Tres días juntos en la costa de Lisboa. Iremos añadiendo aquí los detalles prácticos cuando estén confirmados.",
      mapLink: "Ver la playa en el mapa",
      days: [
        {
          date: "Viernes · 18 de junio de 2027",
          title: "Encuentro previo a la boda",
          description: "Una velada junto al mar antes de la boda.",
          location: "Playa de Aroeira · Fonte da Telha",
          events: [{ time: "Por la tarde", name: "Celebración previa a la boda" }],
          gallery: "preWedding",
        },
        {
          date: "Sábado · 19 de junio de 2027",
          title: "La boda",
          description: "Una ceremonia al aire libre, seguida de cena y baile.",
          location: "Sur de Lisboa · pronto compartiremos todos los detalles del lugar",
          events: [
            { time: "17:00", name: "Ceremonia" },
            { time: "18:00", name: "Cóctel" },
            { time: "21:00", name: "Cena" },
            { time: "Hasta tarde", name: "Baile" },
          ],
          gallery: "venue",
        },
        {
          date: "Domingo · 20 de junio de 2027",
          title: "Brunch junto al mar",
          description: "Una despedida tranquila y soleada junto al mar.",
          location: "Más detalles próximamente",
          events: [{ time: "Mediodía", name: "Brunch" }],
          gallery: "brunch",
        },
      ],
    },
    location: {
      eyebrow: "El lugar",
      title: "Sur de Lisboa, cerca del mar",
      description: "El encuentro previo a la boda será en la playa de Aroeira, en Fonte da Telha. La celebración de la boda será en el sur de Lisboa; compartiremos el lugar y la dirección exactos en cuanto estén confirmados.",
      mapLink: "Playa de Aroeira · Fonte da Telha",
    },
    travel: {
      eyebrow: "Viaje y alojamiento",
      title: "Un poco más al sur",
      description: "Vuela al aeropuerto de Lisboa (LIS). Compartiremos recomendaciones de alojamiento y detalles del transporte local cuando estén listos.",
      items: [
        { title: "Cómo llegar", description: "El aeropuerto de Lisboa es el aeropuerto internacional más cercano." },
        { title: "Dónde alojarse", description: "Pronto añadiremos recomendaciones de alojamiento." },
        { title: "Cómo desplazarse", description: "Compartiremos información sobre el transporte local y el servicio de autobús cuando se acerque la fecha." },
      ],
    },
    faq: {
      eyebrow: "Algunos detalles",
      title: "Información útil",
      items: [
        { question: "¿Pueden venir niños?", answer: "Sí, nos encantará verlos." },
        { question: "¿Y si hace viento o llueve?", answer: "Tenemos un plan cubierto para que el día siga siendo especial." },
        { question: "¿Regalos?", answer: "Vuestra presencia es el mejor regalo. Si lo deseáis, podéis contribuir a nuestra luna de miel." },
      ],
    },
    dressCode: {
      eyebrow: "Vestimenta",
      title: "Marfil, arena y luz suave",
      description: "Lino natural, tejidos ligeros y tonos cálidos. Por favor, reservad el blanco para la novia y dejad el negro en casa.",
      swatchesLabel: "Colores sugeridos",
    },
    rsvp: {
      eyebrow: "Confirmación",
      title: "¿Nos acompañas?",
      description: "Confirma si asistirás al fin de semana de la boda. Pronto añadiremos la fecha límite.",
      thankYou: "Gracias, {name}.",
      accepted: "Estamos deseando celebrarlo contigo.",
      declined: "Te echaremos de menos. Gracias por avisarnos.",
      nameLabel: "Tu nombre",
      namePlaceholder: "Nombre y apellidos",
      attendanceLegend: "¿Asistirás?",
      accept: "Acepto con alegría",
      decline: "Lamentablemente, no podré asistir",
      additionalGuests: "Acompañantes adicionales, sin contarte",
      shuttleLegend: "¿Necesitarás transporte?",
      shuttleYes: "Sí, por favor",
      shuttleNo: "No, gracias",
      dietaryLabel: "Requisitos alimentarios",
      dietaryPlaceholder: "Alergias o preferencias",
      noteLabel: "Una nota para la pareja",
      optional: "(opcional)",
      notePlaceholder: "Escribe una nota…",
      send: "Enviar respuesta",
      sending: "Enviando…",
      error: "No se pudo enviar tu respuesta. Inténtalo de nuevo dentro de un momento.",
    },
    footer: "Clémence & Antonio · Costa de Lisboa · 2027",
    galleries: {
      carouselRole: "carrusel",
      previous: "Mostrar foto anterior",
      next: "Mostrar foto siguiente",
      choose: "Elegir una foto",
      preWeddingLabel: "Fotos del encuentro previo a la boda",
      venueLabel: "Fotos del lugar de la boda",
      brunchLabel: "Foto del brunch",
      preWeddingAlts: [
        "Vista aérea de la playa de Fonte da Telha y su costa",
        "Sendero de arena entre las dunas hacia la playa",
        "Vista de la costa atlántica desde los acantilados sobre la playa",
        "Mesas a la sombra en la terraza de un restaurante junto a la playa",
        "Olas del Atlántico llegando a la orilla, vistas desde arriba",
        "Zona de descanso con vistas a la playa de Fonte da Telha",
      ],
      venueAlts: [
        "Vista aérea del lugar de la boda entre los árboles",
        "Terraza ajardinada a la sombra de un gran roble",
        "Entrada rosa coral enmarcada por cipreses",
        "Patio del lugar iluminado al anochecer",
        "Rincón de jardín a la sombra con bancos azules",
        "Muro rosa coral del jardín y puerta de entrada",
      ],
      brunchAlt: "Mesa de brunch al aire libre con fruta fresca, bollería y bebidas",
    },
  },
  fr: {
    languageLabel: "Choisir la langue",
    hero: {
      tagline: "Nous nous marions",
      explore: "Découvrir ↓",
      exploreLabel: "Découvrir les informations du mariage",
      mute: "Couper le son",
      unmute: "Activer le son",
    },
    navigation: {
      mainSections: "Sections principales",
      backToIntro: "Retour à l’introduction",
      sections: ["Notre histoire", "Le week-end", "Lieu", "Voyage", "À savoir", "Tenue", "RSVP"],
    },
    intro: {
      eyebrow: "Nous nous marions",
      scrollToStory: "Faire défiler jusqu’à notre histoire",
    },
    story: {
      title: "Notre histoire",
      paragraphs: [
        "Clémence, originaire de Jouy-en-Josas en France, et Antonio, originaire de Córdoba en Espagne, se sont rencontrés à Londres en 2016. Ce qui a commencé là-bas est vite devenu une aventure à deux, qui les a menés à travers pays et continents.",
        "Après deux ans à Londres, ils sont partis vivre à Sydney en 2018, puis à Brisbane en 2019. En 2022, ils ont fait un nouveau grand saut et se sont installés au Portugal, juste au nord de Lisbonne, où ils ont commencé à construire une maison ensemble.",
        "Au fil du chemin, ils ont parcouru le monde, collectionné les souvenirs, découvert de nouveaux endroits et fait de chaque aventure une partie de leur histoire.",
        "Aujourd’hui, ils sont de retour sur la rive sud de Lisbonne, leur chez-eux, où ils ont hâte de célébrer la suite de leur histoire entourés de ceux qu’ils aiment.",
        "Et leur histoire continue…",
      ],
    },
    weekend: {
      eyebrow: "Le week-end",
      title: "Rendez-vous dans le sud de Lisbonne",
      description: "Trois jours ensemble sur la côte lisboète. Les informations pratiques seront ajoutées ici dès qu’elles seront confirmées.",
      mapLink: "Voir la plage sur la carte",
      days: [
        {
          date: "Vendredi · 18 juin 2027",
          title: "Rencontre avant le mariage",
          description: "Une soirée au bord de l’eau avant le mariage.",
          location: "Plage d’Aroeira · Fonte da Telha",
          events: [{ time: "En soirée", name: "Célébration avant le mariage" }],
          gallery: "preWedding",
        },
        {
          date: "Samedi · 19 juin 2027",
          title: "Le mariage",
          description: "Une cérémonie en plein air, suivie d’un dîner et d’une soirée dansante.",
          location: "Sud de Lisbonne · détails du lieu à venir",
          events: [
            { time: "17:00", name: "Cérémonie" },
            { time: "18:00", name: "Cocktail" },
            { time: "21:00", name: "Dîner" },
            { time: "Tard", name: "Danse" },
          ],
          gallery: "venue",
        },
        {
          date: "Dimanche · 20 juin 2027",
          title: "Brunch à la plage",
          description: "Un au revoir tout en douceur, au soleil et au bord de l’eau.",
          location: "Détails à venir",
          events: [{ time: "Midi", name: "Brunch" }],
          gallery: "brunch",
        },
      ],
    },
    location: {
      eyebrow: "Le lieu",
      title: "Au sud de Lisbonne, près de la mer",
      description: "Notre rencontre avant le mariage aura lieu à la plage d’Aroeira, à Fonte da Telha. La célébration du mariage se tiendra dans le sud de Lisbonne ; nous communiquerons le lieu exact et l’adresse dès qu’ils seront confirmés.",
      mapLink: "Plage d’Aroeira · Fonte da Telha",
    },
    travel: {
      eyebrow: "Voyage & séjour",
      title: "Un peu plus au sud",
      description: "Prenez un vol pour l’aéroport de Lisbonne (LIS). Nous partagerons des suggestions d’hébergement et les informations sur les transports locaux dès qu’elles seront prêtes.",
      items: [
        { title: "Venir jusqu’ici", description: "L’aéroport de Lisbonne est l’aéroport international le plus proche." },
        { title: "Où séjourner", description: "Des suggestions d’hébergement seront bientôt ajoutées." },
        { title: "Se déplacer", description: "Nous partagerons les informations sur les transports locaux et la navette à l’approche du jour J." },
      ],
    },
    faq: {
      eyebrow: "Quelques précisions",
      title: "À savoir",
      items: [
        { question: "Les enfants sont-ils les bienvenus ?", answer: "Oui, nous serons ravis de les voir." },
        { question: "Et s’il y a du vent ou de la pluie ?", answer: "Nous avons prévu une solution couverte pour que la journée reste belle." },
        { question: "Des cadeaux ?", answer: "Votre présence est le plus beau des cadeaux. Une contribution à notre lune de miel est la bienvenue." },
      ],
    },
    dressCode: {
      eyebrow: "Tenue",
      title: "Ivoire, sable & lumière douce",
      description: "Pensez au lin naturel, aux matières légères et aux tons chauds. Merci de réserver le blanc à la mariée et de laisser le noir à la maison.",
      swatchesLabel: "Couleurs suggérées",
    },
    rsvp: {
      eyebrow: "RSVP",
      title: "Serez-vous des nôtres ?",
      description: "Merci de répondre pour le week-end du mariage. La date limite sera communiquée bientôt.",
      thankYou: "Merci, {name}.",
      accepted: "Nous avons hâte de fêter cela avec vous.",
      declined: "Vous nous manquerez. Merci de nous avoir prévenus.",
      nameLabel: "Votre nom",
      namePlaceholder: "Nom et prénom",
      attendanceLegend: "Serez-vous présent(e) ?",
      accept: "Accepte avec joie",
      decline: "Décline avec regret",
      additionalGuests: "Invités supplémentaires, sans vous compter",
      shuttleLegend: "Aurez-vous besoin d’une navette ?",
      shuttleYes: "Oui, s’il vous plaît",
      shuttleNo: "Non, merci",
      dietaryLabel: "Régime alimentaire",
      dietaryPlaceholder: "Allergies ou préférences",
      noteLabel: "Un mot pour les mariés",
      optional: "(facultatif)",
      notePlaceholder: "Écrivez un petit mot…",
      send: "Envoyer votre réponse",
      sending: "Envoi…",
      error: "Votre réponse n’a pas pu être envoyée. Veuillez réessayer dans un instant.",
    },
    footer: "Clémence & Antonio · Côte de Lisbonne · 2027",
    galleries: {
      carouselRole: "carrousel",
      previous: "Afficher la photo précédente",
      next: "Afficher la photo suivante",
      choose: "Choisir une photo",
      preWeddingLabel: "Photos de la rencontre avant le mariage",
      venueLabel: "Photos du lieu du mariage",
      brunchLabel: "Photo du brunch",
      preWeddingAlts: [
        "Vue aérienne de la plage de Fonte da Telha et du littoral",
        "Sentier de sable à travers les dunes vers la plage",
        "Vue sur l’Atlantique depuis les falaises au-dessus de la plage",
        "Tables à l’ombre sur la terrasse d’un restaurant de plage",
        "Vagues de l’Atlantique arrivant sur le rivage, vues d’en haut",
        "Espace détente avec vue sur la plage de Fonte da Telha",
      ],
      venueAlts: [
        "Vue aérienne du lieu du mariage au milieu des bois",
        "Terrasse du jardin à l’ombre d’un grand chêne",
        "Entrée rose corail encadrée de cyprès",
        "Cour du lieu éclairée chaleureusement à la nuit tombée",
        "Coin salon ombragé dans le jardin avec des bancs bleus",
        "Mur rose corail du jardin et portail d’entrée",
      ],
      brunchAlt: "Table de brunch en plein air avec fruits frais, viennoiseries et boissons",
    },
  },
  pt: {
    languageLabel: "Selecionar idioma",
    hero: {
      tagline: "Vamos casar",
      explore: "Explorar ↓",
      exploreLabel: "Explorar as informações do casamento",
      mute: "Desligar o som",
      unmute: "Ligar o som",
    },
    navigation: {
      mainSections: "Secções principais",
      backToIntro: "Voltar ao início",
      sections: ["A nossa história", "O fim de semana", "Local", "Viagem", "Informações", "Traje", "Confirmação"],
    },
    intro: {
      eyebrow: "Vamos casar",
      scrollToStory: "Descer até à nossa história",
    },
    story: {
      title: "A nossa história",
      paragraphs: [
        "Clémence, de Jouy-en-Josas, França, e Antonio, de Córdoba, Espanha, conheceram-se em Londres em 2016. O que começou ali depressa se tornou numa aventura a dois, que os levou por países e continentes.",
        "Depois de dois anos em Londres, mudaram-se para Sydney em 2018 e, em 2019, para Brisbane. Em 2022, deram outro grande passo e fizeram de Portugal a sua casa, instalando-se a norte de Lisboa, onde começaram a construir uma casa juntos.",
        "Pelo caminho, viajaram pelo mundo, colecionaram memórias, descobriram novos lugares e fizeram de cada aventura parte da sua história.",
        "Hoje estão de volta à margem sul de Lisboa, o lugar a que chamam casa e onde estão entusiasmados por celebrar o próximo capítulo da sua viagem, rodeados pelas pessoas de quem mais gostam.",
        "E assim continua a sua história…",
      ],
    },
    weekend: {
      eyebrow: "O fim de semana",
      title: "Encontramo-nos no sul de Lisboa",
      description: "Três dias juntos na costa de Lisboa. Vamos acrescentando aqui os detalhes práticos assim que estiverem confirmados.",
      mapLink: "Ver a praia no mapa",
      days: [
        {
          date: "Sexta-feira · 18 de junho de 2027",
          title: "Encontro antes do casamento",
          description: "Uma noite junto ao mar antes do casamento.",
          location: "Praia da Aroeira · Fonte da Telha",
          events: [{ time: "À noite", name: "Celebração antes do casamento" }],
          gallery: "preWedding",
        },
        {
          date: "Sábado · 19 de junho de 2027",
          title: "O casamento",
          description: "Uma cerimónia ao ar livre, seguida de jantar e dança.",
          location: "Sul de Lisboa · em breve partilharemos os detalhes do local",
          events: [
            { time: "17:00", name: "Cerimónia" },
            { time: "18:00", name: "Cocktails" },
            { time: "21:00", name: "Jantar" },
            { time: "Até tarde", name: "Dança" },
          ],
          gallery: "venue",
        },
        {
          date: "Domingo · 20 de junho de 2027",
          title: "Brunch na praia",
          description: "Uma despedida tranquila e soalheira junto ao mar.",
          location: "Mais detalhes em breve",
          events: [{ time: "Meio-dia", name: "Brunch" }],
          gallery: "brunch",
        },
      ],
    },
    location: {
      eyebrow: "O local",
      title: "No sul de Lisboa, perto do mar",
      description: "O nosso encontro antes do casamento será na Praia da Aroeira, na Fonte da Telha. A celebração do casamento será no sul de Lisboa; partilharemos o local e a morada exatos assim que estiverem confirmados.",
      mapLink: "Praia da Aroeira · Fonte da Telha",
    },
    travel: {
      eyebrow: "Viagem e estadia",
      title: "Um pouco mais a sul",
      description: "Voe para o Aeroporto de Lisboa (LIS). Partilharemos sugestões de alojamento e informações sobre transportes locais quando estiverem prontas.",
      items: [
        { title: "Como chegar", description: "O Aeroporto de Lisboa é o aeroporto internacional mais próximo." },
        { title: "Onde ficar", description: "Em breve partilharemos sugestões de alojamento." },
        { title: "Como se deslocar", description: "Partilharemos informações sobre os transportes locais e o serviço de transporte mais perto da data." },
      ],
    },
    faq: {
      eyebrow: "Algumas notas",
      title: "Informações úteis",
      items: [
        { question: "As crianças são bem-vindas?", answer: "Sim, teremos muito gosto em vê-las." },
        { question: "E se estiver vento ou chover?", answer: "Temos uma alternativa coberta para que o dia continue a ser especial." },
        { question: "Presentes?", answer: "A vossa presença é o melhor presente. Uma contribuição para a nossa lua de mel é bem-vinda." },
      ],
    },
    dressCode: {
      eyebrow: "Traje",
      title: "Marfim, areia e luz suave",
      description: "Pense em linho natural, tecidos leves e tons quentes. Pedimos que reservem o branco para a noiva e deixem o preto em casa.",
      swatchesLabel: "Cores sugeridas",
    },
    rsvp: {
      eyebrow: "Confirmação",
      title: "Vão celebrar connosco?",
      description: "Por favor, confirmem se estarão presentes no fim de semana do casamento. Partilharemos em breve a data-limite para responder.",
      thankYou: "Obrigado, {name}.",
      accepted: "Estamos ansiosos por celebrar convosco.",
      declined: "Vamos sentir a vossa falta. Obrigado por nos avisarem.",
      nameLabel: "O seu nome",
      namePlaceholder: "Nome completo",
      attendanceLegend: "Vai estar presente?",
      accept: "Aceito com alegria",
      decline: "Lamento não poder estar presente",
      additionalGuests: "Acompanhantes adicionais, sem contar consigo",
      shuttleLegend: "Vai precisar de transporte?",
      shuttleYes: "Sim, por favor",
      shuttleNo: "Não, obrigado",
      dietaryLabel: "Restrições alimentares",
      dietaryPlaceholder: "Alergias ou preferências",
      noteLabel: "Uma mensagem para os noivos",
      optional: "(opcional)",
      notePlaceholder: "Escreva uma mensagem…",
      send: "Enviar resposta",
      sending: "A enviar…",
      error: "Não foi possível enviar a sua resposta. Tente novamente dentro de instantes.",
    },
    footer: "Clémence & Antonio · Costa de Lisboa · 2027",
    galleries: {
      carouselRole: "carrossel",
      previous: "Mostrar fotografia anterior",
      next: "Mostrar fotografia seguinte",
      choose: "Escolher uma fotografia",
      preWeddingLabel: "Fotografias do encontro antes do casamento",
      venueLabel: "Fotografias do local do casamento",
      brunchLabel: "Fotografia do brunch",
      preWeddingAlts: [
        "Vista aérea da praia da Fonte da Telha e da costa",
        "Caminho de areia pelas dunas até à praia",
        "Vista sobre o Atlântico a partir das falésias junto à praia",
        "Mesas à sombra no terraço de um restaurante junto à praia",
        "Ondas do Atlântico a chegar à costa, vistas de cima",
        "Espaço de descanso com vista para a praia da Fonte da Telha",
      ],
      venueAlts: [
        "Vista aérea do local do casamento entre os jardins arborizados",
        "Terraço ajardinado à sombra de um grande carvalho",
        "Entrada rosa-coral emoldurada por ciprestes",
        "Pátio do local iluminado ao anoitecer",
        "Zona de estar à sombra no jardim com bancos azuis",
        "Muro rosa-coral do jardim e portão de entrada",
      ],
      brunchAlt: "Mesa de brunch ao ar livre com fruta fresca, pastelaria e bebidas",
    },
  },
};

export function isLanguage(value: string | null): value is Language {
  return languageOptions.some((option) => option.value === value);
}

export function getBrowserLanguage(
  preferences: readonly string[],
  fallback: Language = "en",
): Language {
  for (const preference of preferences) {
    const baseLanguage = preference.trim().split(/[-_]/, 1)[0].toLowerCase();
    if (isLanguage(baseLanguage)) {
      return baseLanguage;
    }
  }

  return fallback;
}

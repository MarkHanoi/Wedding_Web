export const languageOptions = [
  { value: "en", label: "English" },
  { value: "es", label: "Español" },
  { value: "fr", label: "Français" },
  { value: "pt", label: "Português" },
] as const;

export type Language = (typeof languageOptions)[number]["value"];
export type GalleryKey = "preWedding" | "venue" | "brunch";
export type RSVPEvent = "friday" | "saturday" | "sunday";

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
    rsvpLink: string;
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
    dinnerIdeasLink: string;
    calendarLink: string;
    rsvpLink: string;
    days: DayCopy[];
  };
  location: {
    eyebrow: string;
    title: string;
    description: string;
    beachMapLink: string;
    weddingMapLink: string;
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
    days: { title: string; description: string }[];
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
    eventsLegend: string;
    events: { id: RSVPEvent; label: string }[];
    guestCountLabel: string;
    arrivalLabel: string;
    arrivalPlaceholder: string;
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
    travelLabel: string;
    travelAlts: string[];
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
      rsvpLink: "RSVP",
      scrollToStory: "Scroll to our story",
    },
    story: {
      title: "French girl meets Spanish boy",
      paragraphs: [
        "London, 2016. A nightclub. Terrible lighting, perfect timing.",
        "Then Sydney, Brisbane and a lot of suitcases. In 2022 we landed in Portugal and started building a house, the ultimate relationship stress test. We’re still talking, so we’re getting married.",
        "Jouy-en-Josas meets Córdoba, on neutral ground, because that’s good for a marriage.",
      ],
    },
    weekend: {
      eyebrow: "The weekend",
      title: "Three moments, everyone welcome",
      description: "Friday 18 to Sunday 20 June 2027, on Lisbon’s south coast. Please let us know which events you’ll be attending by selecting them in the RSVP.",
      mapLink: "Map",
      dinnerIdeasLink: "Dinner ideas",
      calendarLink: "Add to calendar",
      rsvpLink: "Tell us if you’re coming",
      days: [
        {
          date: "Friday · 18 June 2027",
          title: "Welcome drinks",
          description: "Standing drinks and bites on the beach. Not a dinner, so you’re free to eat out afterwards.",
          location: "Beach bar, Fonte da Telha · exact spot to be confirmed",
          events: [{ time: "Evening, time to be confirmed", name: "Welcome drinks and bites" }],
          gallery: "preWedding",
        },
        {
          date: "Saturday · 19 June 2027",
          title: "The wedding",
          description: "An open-air ceremony, then cocktail, dinner and a dance floor.",
          location: "Casa do Pinheiro Manso · Quinta do Peru · 2925-206 Azeitão",
          events: [
            { time: "5:30 PM", name: "Ceremony" },
            { time: "Time to be confirmed", name: "Cocktails, dinner and dancing" },
          ],
          gallery: "venue",
        },
        {
          date: "Sunday · 20 June 2027",
          title: "Brunch",
          description: "A slow goodbye, in the area.",
          location: "To be confirmed, near the wedding area",
          events: [{ time: "Midday, to be confirmed", name: "Brunch" }],
          gallery: "brunch",
        },
      ],
    },
    location: {
      eyebrow: "The place",
      title: "South Lisbon, close to the sea",
      description: "Friday’s welcome drinks are in the beach-bar area of Fonte da Telha, Costa da Caparica, Almada, Setúbal; the exact meeting point is still to be confirmed. Saturday’s wedding is at Casa do Pinheiro Manso, Quinta do Peru, 2925-206 Azeitão.",
      beachMapLink: "Fonte da Telha beach · open in Maps",
      weddingMapLink: "Casa do Pinheiro Manso · open in Maps",
    },
    travel: {
      eyebrow: "Travel",
      title: "Getting here, staying, exploring",
      description: "A few useful pointers for your time on Lisbon’s south coast.",
      items: [
        { title: "Getting here", description: "Fly into Lisbon (LIS). Fonte da Telha is south of the Tagus, around 40–60 minutes by road, more at rush hour; check the exact time in your map app. If you rent a car, pick it up at the airport and book early—June is busy. Portuguese motorways use electronic tolls, so ask the rental company for a toll device. From Córdoba and southern Spain, allow about six hours by road: via Badajoz and Évora towards Lisbon, or via Seville and Huelva, then the A22 along the Algarve and north. Check both routes in a map app before you leave. A car or taxi is easiest between venues; shuttle details will follow." },
        { title: "Where to stay", description: "We suggest staying in Azeitão, around Aroeira, or somewhere in between; Setúbal and Sesimbra are too far. In Azeitão, look at Turim Club d’Azeitão, guesthouses or quintas in the village; in between, consider Pousada Castelo de Palmela or local apartments and villas; around Aroeira/Fonte da Telha, look for villas and apartments near Friday’s drinks and the beach. Please book early." },
        { title: "Friday dinner (on your own)", description: "Friday is drinks and bites only, so here are ideas for dinner nearby. For a mid-range meal, try Piscina in Fonte da Telha (dishes to share), or Sotavento for seafood. For something more special, consider Casablanca Beach Lounge or a table in Lisbon. Please book ahead." },
        { title: "Things to do if you’re staying longer", description: "In Lisbon, explore Alfama, Belém, the viewpoints, LX Factory and Time Out Market; a ferry from Cacilhas is a lovely way to get across. Around Aroeira and Costa da Caparica, enjoy the beaches, the seafront boardwalk and surf lessons. In Azeitão and Arrábida, discover the nature park and its beaches, Azeitão cheese and tarts, wine cellars and Palmela Castle." },
      ],
    },
    faq: {
      eyebrow: "Good to know",
      title: "Questions",
      items: [
        { question: "Who is invited to what?", answer: "Everyone is welcome to all three events. Please let us know in the RSVP which ones you’ll join." },
        { question: "What if it’s windy or rainy?", answer: "We have a covered plan so the day stays beautiful." },
        { question: "Gifts?", answer: "Your presence is the gift. A contribution to our honeymoon is welcome." },
        { question: "Who do I contact?", answer: "We’ll add an email address and WhatsApp number here once confirmed." },
      ],
    },
    dressCode: {
      eyebrow: "What to wear",
      title: "Just come ready to relax and enjoy!",
      description: "",
      days: [
        { title: "Friday · Beach", description: "Relaxed and comfortable." },
        { title: "Saturday · Festive", description: "Not white or black. Choose shoes that work on grass and gravel." },
        { title: "Sunday · As you wish", description: "Come as you want." },
      ],
      swatchesLabel: "Suggested colours",
    },
    rsvp: {
      eyebrow: "RSVP",
      title: "Will you join us?",
      description: "Please reply for the weekend and select every event you plan to attend.",
      thankYou: "Thank you, {name}.",
      accepted: "We can’t wait to celebrate with you.",
      declined: "We’ll miss you, but thank you for letting us know.",
      nameLabel: "Your name",
      namePlaceholder: "Full name",
      attendanceLegend: "Will you attend?",
      accept: "Joyfully accepts",
      decline: "Regretfully declines",
      eventsLegend: "Which events will you join?",
      events: [
        { id: "friday", label: "Friday drinks" },
        { id: "saturday", label: "Saturday wedding" },
        { id: "sunday", label: "Sunday brunch" },
      ],
      guestCountLabel: "Number of guests, including yourself",
      arrivalLabel: "Coming from abroad? How do you plan to arrive?",
      arrivalPlaceholder: "Flight, car, travelling from Córdoba…",
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
    footer: "Clémence & Antonio · Portugal · 2027",
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
      travelLabel: "Travel and stay photos",
      travelAlts: [
        "Turquoise cove framed by green hills on the Arrábida coast",
        "Vineyard in Azeitão with the Serra da Arrábida mountains in the distance",
        "Historic Portuguese rooftops and a church overlooking the water",
        "Lisbon rooftops and church tower beneath dramatic clouds",
        "Traditional tiled Lisbon building with a restaurant at street level",
        "Aerial view of the wooded Arrábida coastline and its small coves",
        "Cliffs and clear water at a beach in Arrábida",
        "Aerial view of the sandbanks and calm sea near Setúbal",
      ],
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
      rsvpLink: "Confirmar asistencia",
      scrollToStory: "Desplazarse a nuestra historia",
    },
    story: {
      title: "Una francesa conoce a un español",
      paragraphs: [
        "Londres, 2016. Una discoteca. Iluminación terrible, el momento perfecto.",
        "Después llegaron Sídney, Brisbane y un montón de maletas. En 2022 llegamos a Portugal y empezamos a construir una casa: la prueba definitiva para una relación. Seguimos hablándonos, así que vamos a casarnos.",
        "Jouy-en-Josas se encuentra con Córdoba, en terreno neutral, porque así es mejor para un matrimonio.",
      ],
    },
    weekend: {
      eyebrow: "El fin de semana",
      title: "Tres momentos, todos bienvenidos",
      description: "Del viernes 18 al domingo 20 de junio de 2027, en la costa sur de Lisboa. Dinos a qué eventos asistirás seleccionándolos en el RSVP.",
      mapLink: "Mapa",
      dinnerIdeasLink: "Ideas para cenar",
      calendarLink: "Añadir al calendario",
      rsvpLink: "Dinos si vienes",
      days: [
        {
          date: "Viernes · 18 de junio de 2027",
          title: "Cóctel de bienvenida",
          description: "Bebidas y aperitivos de pie en la playa. No es una cena, así que podéis salir a cenar después.",
          location: "Chiringuito en Fonte da Telha · lugar exacto por confirmar",
          events: [{ time: "Por la tarde-noche, por confirmar", name: "Bebidas y aperitivos de bienvenida" }],
          gallery: "preWedding",
        },
        {
          date: "Sábado · 19 de junio de 2027",
          title: "La boda",
          description: "Ceremonia al aire libre, después cóctel, cena y pista de baile.",
          location: "Casa do Pinheiro Manso · Quinta do Peru · 2925-206 Azeitão",
          events: [
            { time: "17:30", name: "Ceremonia" },
            { time: "Horario por confirmar", name: "Cóctel, cena y baile" },
          ],
          gallery: "venue",
        },
        {
          date: "Domingo · 20 de junio de 2027",
          title: "Brunch",
          description: "Una despedida tranquila por la zona.",
          location: "Por confirmar, cerca de la zona de la boda",
          events: [{ time: "Mediodía, por confirmar", name: "Brunch" }],
          gallery: "brunch",
        },
      ],
    },
    location: {
      eyebrow: "El lugar",
      title: "Sur de Lisboa, cerca del mar",
      description: "Las bebidas de bienvenida del viernes serán en la zona de bares de playa de Fonte da Telha, Costa da Caparica, Almada, Setúbal; confirmaremos más adelante el punto de encuentro exacto. La boda del sábado será en Casa do Pinheiro Manso, Quinta do Peru, 2925-206 Azeitão.",
      beachMapLink: "Playa de Fonte da Telha · abrir en Maps",
      weddingMapLink: "Casa do Pinheiro Manso · abrir en Maps",
    },
    travel: {
      eyebrow: "Viaje",
      title: "Cómo llegar, dónde alojarse y qué descubrir",
      description: "Algunas ideas prácticas para vuestra estancia en la costa sur de Lisboa.",
      items: [
        { title: "Cómo llegar", description: "Vuela a Lisboa (LIS). Fonte da Telha está al sur del Tajo, a unos 40–60 minutos por carretera, más en hora punta; consulta el tiempo exacto en tu aplicación de mapas. Si alquilas un coche, recógelo en el aeropuerto y resérvalo pronto: junio es temporada alta. Las autopistas portuguesas tienen peajes electrónicos, así que pide un dispositivo de peaje a la compañía. Desde Córdoba y el sur de España, calcula unas seis horas por carretera: por Badajoz y Évora hacia Lisboa, o por Sevilla y Huelva, y después por la A22 a lo largo del Algarve hacia el norte. Comprueba ambas rutas en una aplicación de mapas antes de salir. Entre los lugares, lo más fácil es ir en coche o taxi; compartiremos más adelante los detalles del transporte." },
        { title: "Dónde alojarse", description: "Recomendamos alojarse en Azeitão, por Aroeira o en algún punto intermedio; Setúbal y Sesimbra quedan demasiado lejos. En Azeitão, podéis mirar Turim Club d’Azeitão, casas rurales o quintas del pueblo; a medio camino, la Pousada Castelo de Palmela o apartamentos y villas; por Aroeira/Fonte da Telha, villas y apartamentos cerca de las bebidas del viernes y de la playa. Reservad con antelación." },
        { title: "La cena del viernes (por vuestra cuenta)", description: "El viernes habrá bebidas y aperitivos, pero no cena, así que podéis salir a cenar después. Para una comida de precio medio, probad Piscina en Fonte da Telha (platos para compartir) o Sotavento para pescado y marisco. Para algo más especial, considerad Casablanca Beach Lounge o un restaurante en Lisboa. Reservad con antelación." },
        { title: "Qué hacer si os quedáis más días", description: "En Lisboa, podéis recorrer Alfama, Belém, los miradores, LX Factory y Time Out Market; el ferry desde Cacilhas es una forma agradable de cruzar. En Aroeira y Costa da Caparica, disfrutad de las playas, el paseo marítimo y las clases de surf. En Azeitão y Arrábida, descubrid el parque natural y sus playas, el queso y los dulces de Azeitão, las bodegas y el castillo de Palmela." },
      ],
    },
    faq: {
      eyebrow: "Información útil",
      title: "Preguntas",
      items: [
        { question: "¿Quién está invitado a qué?", answer: "Todo el mundo está invitado a los tres eventos. Dinos en el RSVP a cuáles te gustaría asistir." },
        { question: "¿Y si hace viento o llueve?", answer: "Tenemos un plan cubierto para que el día siga siendo especial." },
        { question: "¿Regalos?", answer: "Vuestra presencia es el mejor regalo. Si lo deseáis, podéis contribuir a nuestra luna de miel." },
        { question: "¿A quién puedo contactar?", answer: "Añadiremos aquí un correo electrónico y un número de WhatsApp cuando estén confirmados." },
      ],
    },
    dressCode: {
      eyebrow: "Qué ponerse",
      title: "¡Venid con ganas de relajaros y disfrutar!",
      description: "",
      days: [
        { title: "Viernes · Playa", description: "Informal y cómodo." },
        { title: "Sábado · Festivo", description: "Nada de blanco ni negro. Elegid zapatos adecuados para el césped y la grava." },
        { title: "Domingo · A vuestro gusto", description: "Venid como queráis." },
      ],
      swatchesLabel: "Colores sugeridos",
    },
    rsvp: {
      eyebrow: "Confirmación",
      title: "¿Nos acompañas?",
      description: "Confirma si asistirás y selecciona todos los eventos a los que vendrás.",
      thankYou: "Gracias, {name}.",
      accepted: "Estamos deseando celebrarlo contigo.",
      declined: "Te echaremos de menos. Gracias por avisarnos.",
      nameLabel: "Tu nombre",
      namePlaceholder: "Nombre y apellidos",
      attendanceLegend: "¿Asistirás?",
      accept: "Acepto con alegría",
      decline: "Lamentablemente, no podré asistir",
      eventsLegend: "¿A qué eventos asistirás?",
      events: [
        { id: "friday", label: "Bebidas del viernes" },
        { id: "saturday", label: "Boda del sábado" },
        { id: "sunday", label: "Brunch del domingo" },
      ],
      guestCountLabel: "Número de invitados, incluyéndote",
      arrivalLabel: "¿Vienes desde fuera? ¿Cómo tienes pensado llegar?",
      arrivalPlaceholder: "Avión, coche, desde Córdoba…",
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
    footer: "Clémence & Antonio · Portugal · 2027",
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
      travelLabel: "Fotos de viaje y alojamiento",
      travelAlts: [
        "Cala de aguas turquesas rodeada de colinas verdes en la costa de Arrábida",
        "Viñedo de Azeitão con las montañas de la Serra da Arrábida al fondo",
        "Tejados históricos y una iglesia junto al agua en una ciudad portuguesa",
        "Tejados de Lisboa y una torre bajo nubes dramáticas",
        "Edificio tradicional de azulejos en Lisboa con un restaurante a pie de calle",
        "Vista aérea de la costa boscosa de Arrábida y sus pequeñas calas",
        "Acantilados y aguas cristalinas en una playa de Arrábida",
        "Vista aérea de bancos de arena y aguas tranquilas cerca de Setúbal",
      ],
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
      rsvpLink: "Répondre à l’invitation",
    },
    story: {
      title: "Une Française rencontre un Espagnol",
      paragraphs: [
        "Londres, 2016. Une boîte de nuit. Un éclairage catastrophique, un timing parfait.",
        "Puis Sydney, Brisbane et beaucoup de valises. En 2022, on s’est installés au Portugal et on a commencé à construire une maison, le test ultime pour un couple. On se parle toujours, alors on se marie.",
        "Jouy-en-Josas rencontre Cordoue, en terrain neutre, parce que c’est mieux pour un mariage.",
      ],
    },
    weekend: {
      eyebrow: "Le week-end",
      title: "Trois moments, tout le monde est bienvenu",
      description: "Du vendredi 18 au dimanche 20 juin 2027, sur la côte sud de Lisbonne. Indiquez-nous les événements auxquels vous participerez en les sélectionnant dans le RSVP.",
      mapLink: "Carte",
      dinnerIdeasLink: "Idées de dîner",
      calendarLink: "Ajouter au calendrier",
      rsvpLink: "Dites-nous si vous venez",
      days: [
        {
          date: "Vendredi · 18 juin 2027",
          title: "Verre de bienvenue",
          description: "Boissons et bouchées debout sur la plage. Ce n’est pas un dîner, vous êtes donc libres d’aller dîner ensuite.",
          location: "Bar de plage, Fonte da Telha · lieu exact à confirmer",
          events: [{ time: "En soirée, à confirmer", name: "Verre et bouchées de bienvenue" }],
          gallery: "preWedding",
        },
        {
          date: "Samedi · 19 juin 2027",
          title: "Le mariage",
          description: "Une cérémonie en plein air, puis un cocktail, un dîner et une piste de danse.",
          location: "Casa do Pinheiro Manso · Quinta do Peru · 2925-206 Azeitão",
          events: [
            { time: "17 h 30", name: "Cérémonie" },
            { time: "Horaire à confirmer", name: "Cocktail, dîner et danse" },
          ],
          gallery: "venue",
        },
        {
          date: "Dimanche · 20 juin 2027",
          title: "Brunch",
          description: "Un au revoir tout en douceur, dans les environs.",
          location: "À confirmer, près du lieu du mariage",
          events: [{ time: "Midi, à confirmer", name: "Brunch" }],
          gallery: "brunch",
        },
      ],
    },
    location: {
      eyebrow: "Le lieu",
      title: "Au sud de Lisbonne, près de la mer",
      description: "Le verre de bienvenue du vendredi aura lieu dans la zone des bars de plage de Fonte da Telha, à Costa da Caparica, Almada, Setúbal ; le point de rendez-vous exact reste à confirmer. Le mariage du samedi aura lieu à Casa do Pinheiro Manso, Quinta do Peru, 2925-206 Azeitão.",
      beachMapLink: "Plage de Fonte da Telha · ouvrir dans Maps",
      weddingMapLink: "Casa do Pinheiro Manso · ouvrir dans Maps",
    },
    travel: {
      eyebrow: "Voyage",
      title: "Venir, séjourner, découvrir",
      description: "Quelques conseils pratiques pour votre séjour sur la côte sud de Lisbonne.",
      items: [
        { title: "Venir jusqu’ici", description: "Prenez un vol pour Lisbonne (LIS). Fonte da Telha se trouve au sud du Tage, à environ 40–60 minutes de route, davantage aux heures de pointe ; vérifiez le trajet exact sur votre application de cartes. Si vous louez une voiture, récupérez-la à l’aéroport et réservez tôt : juin est très fréquenté. Les autoroutes portugaises utilisent le télépéage ; demandez un badge à l’agence. Depuis Cordoue et le sud de l’Espagne, comptez environ six heures de route : par Badajoz et Évora vers Lisbonne, ou par Séville et Huelva, puis l’A22 le long de l’Algarve vers le nord. Vérifiez les deux itinéraires sur une application de cartes avant de partir. Une voiture ou un taxi est le plus simple entre les lieux ; les détails de la navette suivront." },
        { title: "Où séjourner", description: "Nous vous conseillons Azeitão, Aroeira ou un endroit entre les deux ; Setúbal et Sesimbra sont trop éloignées. À Azeitão, regardez le Turim Club d’Azeitão, les maisons d’hôtes ou les quintas du village ; entre les deux, la Pousada Castelo de Palmela, des appartements ou des villas ; vers Aroeira/Fonte da Telha, des villas et appartements près des boissons du vendredi et de la plage. Pensez à réserver tôt." },
        { title: "Dîner du vendredi (à votre charge)", description: "Le vendredi, il y aura uniquement des boissons et des bouchées, pas de dîner ; vous pourrez donc dîner à l’extérieur ensuite. Pour un repas à prix moyen, essayez Piscina à Fonte da Telha (plats à partager) ou Sotavento pour les fruits de mer. Pour une soirée plus spéciale, pensez à Casablanca Beach Lounge ou à une table à Lisbonne. Pensez à réserver." },
        { title: "À découvrir si vous prolongez votre séjour", description: "À Lisbonne : Alfama, Belém, les belvédères, LX Factory et Time Out Market ; le ferry depuis Cacilhas est une belle façon de traverser le fleuve. À Aroeira et Costa da Caparica : plages, promenade en bord de mer et cours de surf. À Azeitão et Arrábida : parc naturel et plages, fromage et tartes d’Azeitão, caves et château de Palmela." },
      ],
    },
    faq: {
      eyebrow: "À savoir",
      title: "Questions",
      items: [
        { question: "Qui est invité à quoi ?", answer: "Tout le monde est invité aux trois événements. Dites-nous dans le RSVP ceux auxquels vous souhaitez participer." },
        { question: "Et s’il y a du vent ou de la pluie ?", answer: "Nous avons prévu une solution couverte pour que la journée reste belle." },
        { question: "Des cadeaux ?", answer: "Votre présence est le plus beau des cadeaux. Une contribution à notre lune de miel est la bienvenue." },
        { question: "Qui dois-je contacter ?", answer: "Nous ajouterons ici une adresse e-mail et un numéro WhatsApp dès qu’ils seront confirmés." },
      ],
    },
    dressCode: {
      eyebrow: "Comment s’habiller",
      title: "Venez simplement pour vous détendre et profiter !",
      description: "",
      days: [
        { title: "Vendredi · Plage", description: "Décontracté et confortable." },
        { title: "Samedi · Festif", description: "Ni blanc ni noir. Choisissez des chaussures adaptées à l’herbe et au gravier." },
        { title: "Dimanche · Comme vous voulez", description: "Venez comme vous voulez." },
      ],
      swatchesLabel: "Couleurs suggérées",
    },
    rsvp: {
      eyebrow: "RSVP",
      title: "Serez-vous des nôtres ?",
      description: "Merci de répondre et de sélectionner tous les événements auxquels vous participerez.",
      thankYou: "Merci, {name}.",
      accepted: "Nous avons hâte de fêter cela avec vous.",
      declined: "Vous nous manquerez. Merci de nous avoir prévenus.",
      nameLabel: "Votre nom",
      namePlaceholder: "Nom et prénom",
      attendanceLegend: "Serez-vous présent(e) ?",
      accept: "Accepte avec joie",
      decline: "Décline avec regret",
      eventsLegend: "À quels événements participerez-vous ?",
      events: [
        { id: "friday", label: "Verre du vendredi" },
        { id: "saturday", label: "Mariage du samedi" },
        { id: "sunday", label: "Brunch du dimanche" },
      ],
      guestCountLabel: "Nombre d’invités, vous compris",
      arrivalLabel: "Vous venez de l’étranger ? Comment pensez-vous arriver ?",
      arrivalPlaceholder: "Avion, voiture, depuis Cordoue…",
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
    footer: "Clémence & Antonio · Portugal · 2027",
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
      travelLabel: "Photos de voyage et de séjour",
      travelAlts: [
        "Anse aux eaux turquoise bordée de collines verdoyantes sur la côte d’Arrábida",
        "Vignoble d’Azeitão avec la serra da Arrábida en arrière-plan",
        "Toits historiques et église au bord de l’eau dans une ville portugaise",
        "Toits de Lisbonne et clocher sous des nuages spectaculaires",
        "Immeuble lisboète couvert d’azulejos avec un restaurant au rez-de-chaussée",
        "Vue aérienne de la côte boisée d’Arrábida et de ses petites criques",
        "Falaises et eau limpide sur une plage d’Arrábida",
        "Vue aérienne des bancs de sable et des eaux calmes près de Setúbal",
      ],
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
      rsvpLink: "Confirmar presença",
    },
    story: {
      title: "Uma francesa conhece um espanhol",
      paragraphs: [
        "Londres, 2016. Uma discoteca. Iluminação péssima, timing perfeito.",
        "Depois Sydney, Brisbane e muitas malas. Em 2022 chegámos a Portugal e começámos a construir uma casa — o teste definitivo para uma relação. Ainda nos falamos, por isso vamos casar.",
        "Jouy-en-Josas encontra Córdoba, em terreno neutro, porque é melhor para um casamento.",
      ],
    },
    weekend: {
      eyebrow: "O fim de semana",
      title: "Três momentos, todos bem-vindos",
      description: "De sexta-feira, 18, a domingo, 20 de junho de 2027, na costa sul de Lisboa. Indique-nos a que eventos vai assistir, selecionando-os no RSVP.",
      mapLink: "Mapa",
      dinnerIdeasLink: "Ideias para jantar",
      calendarLink: "Adicionar ao calendário",
      rsvpLink: "Digam-nos se vêm",
      days: [
        {
          date: "Sexta-feira · 18 de junho de 2027",
          title: "Bebidas de boas-vindas",
          description: "Bebidas e petiscos de pé na praia. Não é um jantar, por isso podem sair para jantar depois.",
          location: "Bar de praia na Fonte da Telha · local exato por confirmar",
          events: [{ time: "À noite, por confirmar", name: "Bebidas e petiscos de boas-vindas" }],
          gallery: "preWedding",
        },
        {
          date: "Sábado · 19 de junho de 2027",
          title: "O casamento",
          description: "Cerimónia ao ar livre, seguida de cocktails, jantar e pista de dança.",
          location: "Casa do Pinheiro Manso · Quinta do Peru · 2925-206 Azeitão",
          events: [
            { time: "17:30", name: "Cerimónia" },
            { time: "Horário por confirmar", name: "Cocktails, jantar e dança" },
          ],
          gallery: "venue",
        },
        {
          date: "Domingo · 20 de junho de 2027",
          title: "Brunch",
          description: "Uma despedida tranquila pela zona.",
          location: "Por confirmar, perto da zona do casamento",
          events: [{ time: "Meio-dia, por confirmar", name: "Brunch" }],
          gallery: "brunch",
        },
      ],
    },
    location: {
      eyebrow: "O local",
      title: "No sul de Lisboa, perto do mar",
      description: "As bebidas de boas-vindas de sexta-feira serão na zona dos bares de praia da Fonte da Telha, Costa da Caparica, Almada, Setúbal; o ponto de encontro exato será confirmado mais tarde. O casamento de sábado será na Casa do Pinheiro Manso, Quinta do Peru, 2925-206 Azeitão.",
      beachMapLink: "Praia da Fonte da Telha · abrir no Maps",
      weddingMapLink: "Casa do Pinheiro Manso · abrir no Maps",
    },
    travel: {
      eyebrow: "Viagem",
      title: "Como chegar, onde ficar e o que descobrir",
      description: "Algumas sugestões práticas para a vossa estadia na costa sul de Lisboa.",
      items: [
        { title: "Como chegar", description: "Voe para Lisboa (LIS). A Fonte da Telha fica a sul do Tejo, a cerca de 40–60 minutos de carro, mais em hora de ponta; confirme o tempo exato numa aplicação de mapas. Se alugar um carro, levante-o no aeroporto e reserve cedo: junho é muito concorrido. As autoestradas portuguesas usam portagens eletrónicas; peça um dispositivo de portagem à empresa de aluguer. De Córdoba e do sul de Espanha, conte com cerca de seis horas de viagem: via Badajoz e Évora em direção a Lisboa, ou via Sevilha e Huelva, seguindo pela A22 ao longo do Algarve para norte. Confirme ambos os percursos numa aplicação de mapas antes de sair. Entre os locais, o mais fácil é ir de carro ou táxi; partilharemos mais tarde os detalhes do transporte." },
        { title: "Onde ficar", description: "Sugerimos ficar em Azeitão, na zona de Aroeira ou algures entre as duas; Setúbal e Sesimbra ficam demasiado longe. Em Azeitão, veja o Turim Club d’Azeitão, casas de hóspedes ou quintas da aldeia; a meio caminho, a Pousada Castelo de Palmela ou apartamentos e villas; perto de Aroeira/Fonte da Telha, villas e apartamentos junto às bebidas de sexta-feira e à praia. Reserve com antecedência." },
        { title: "Jantar de sexta-feira (por conta própria)", description: "Na sexta-feira haverá apenas bebidas e petiscos, por isso ficam livres para jantar fora depois. Para uma refeição de preço médio, experimentem o Piscina na Fonte da Telha (pratos para partilhar) ou o Sotavento, para peixe e marisco. Para algo mais especial, considerem o Casablanca Beach Lounge ou um restaurante em Lisboa. Reservem com antecedência." },
        { title: "O que fazer se ficarem mais tempo", description: "Em Lisboa, explorem Alfama, Belém, os miradouros, a LX Factory e o Time Out Market; o ferry de Cacilhas é uma forma agradável de atravessar o rio. Em Aroeira e na Costa da Caparica, aproveitem as praias, o passeio marítimo e as aulas de surf. Em Azeitão e na Arrábida, descubram o parque natural e as suas praias, o queijo e os doces de Azeitão, as caves e o Castelo de Palmela." },
      ],
    },
    faq: {
      eyebrow: "Informações",
      title: "Perguntas",
      items: [
        { question: "Quem está convidado para quê?", answer: "Todos são bem-vindos aos três eventos. Digam-nos no RSVP a quais gostariam de assistir." },
        { question: "E se estiver vento ou chover?", answer: "Temos uma alternativa coberta para que o dia continue a ser especial." },
        { question: "Presentes?", answer: "A vossa presença é o melhor presente. Uma contribuição para a nossa lua de mel é bem-vinda." },
        { question: "Quem devo contactar?", answer: "Adicionaremos aqui um endereço de e-mail e um número de WhatsApp quando estiverem confirmados." },
      ],
    },
    dressCode: {
      eyebrow: "O que vestir",
      title: "Venham prontos para relaxar e aproveitar!",
      description: "",
      days: [
        { title: "Sexta-feira · Praia", description: "Descontraído e confortável." },
        { title: "Sábado · Festivo", description: "Sem branco nem preto. Escolham sapatos adequados à relva e à gravilha." },
        { title: "Domingo · Como preferirem", description: "Venham como quiserem." },
      ],
      swatchesLabel: "Cores sugeridas",
    },
    rsvp: {
      eyebrow: "Confirmação",
      title: "Vão celebrar connosco?",
      description: "Por favor, confirmem a presença e selecionem todos os eventos a que vão assistir.",
      thankYou: "Obrigado, {name}.",
      accepted: "Estamos ansiosos por celebrar convosco.",
      declined: "Vamos sentir a vossa falta. Obrigado por nos avisarem.",
      nameLabel: "O seu nome",
      namePlaceholder: "Nome completo",
      attendanceLegend: "Vai estar presente?",
      accept: "Aceito com alegria",
      decline: "Lamento não poder estar presente",
      eventsLegend: "A que eventos vão assistir?",
      events: [
        { id: "friday", label: "Bebidas de sexta-feira" },
        { id: "saturday", label: "Casamento de sábado" },
        { id: "sunday", label: "Brunch de domingo" },
      ],
      guestCountLabel: "Número de convidados, incluindo você",
      arrivalLabel: "Vem do estrangeiro? Como planeia chegar?",
      arrivalPlaceholder: "Avião, carro, de Córdoba…",
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
    footer: "Clémence & Antonio · Portugal · 2027",
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
      travelLabel: "Fotografias de viagem e estadia",
      travelAlts: [
        "Enseada de águas turquesa rodeada pelas colinas verdes da costa da Arrábida",
        "Vinha em Azeitão com a Serra da Arrábida ao fundo",
        "Telhados históricos e uma igreja junto à água numa cidade portuguesa",
        "Telhados de Lisboa e uma torre de igreja sob nuvens dramáticas",
        "Edifício tradicional de azulejos em Lisboa com um restaurante ao nível da rua",
        "Vista aérea da costa arborizada da Arrábida e das suas pequenas enseadas",
        "Falésias e águas límpidas numa praia da Arrábida",
        "Vista aérea dos bancos de areia e das águas calmas perto de Setúbal",
      ],
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

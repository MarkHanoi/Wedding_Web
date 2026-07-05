export interface Institution {
  id: string;
  name: string;
  shortName: string;
  tagline: string;
  role: string;
  color: string;
}

export const INSTITUTIONS: Institution[] = [
  {
    id: "upm",
    name: "Universidad Politécnica de Madrid",
    shortName: "UPM",
    tagline: "Certifying Body · Título Propio · 36 ECTS",
    role: "degree",
    color: "#fde68a",
  },
  {
    id: "etsam",
    name: "E.T.S. Arquitectura de Madrid",
    shortName: "ETSAM",
    tagline: "Host Institution · Academic Infrastructure",
    role: "host",
    color: "#bbf7d0",
  },
  {
    id: "mit-senseable",
    name: "MIT Senseable City Lab",
    shortName: "MIT SCL",
    tagline: "Smart Cities · Urban AI · Sensing Infrastructure",
    role: "guest",
    color: "#bfdbfe",
  },
  {
    id: "mit-sap",
    name: "MIT School of Architecture + Planning",
    shortName: "MIT SA+P",
    tagline: "AI + Architecture Research · Computational Form",
    role: "guest",
    color: "#c7d2fe",
  },
  {
    id: "mit-media",
    name: "MIT Media Lab",
    shortName: "MIT Media",
    tagline: "Material Ecology · Biologically Inspired Design",
    role: "guest",
    color: "#ddd6fe",
  },
  {
    id: "ucl-bartlett",
    name: "UCL Bartlett School of Architecture",
    shortName: "UCL Bartlett",
    tagline: "Architectural Theory · The Digital Turn",
    role: "guest",
    color: "#fecaca",
  },
  {
    id: "umich-tcaup",
    name: "University of Michigan TCAUP",
    shortName: "UMich TCAUP",
    tagline: "Generative AI · Machine Learning in Architecture",
    role: "guest",
    color: "#fed7aa",
  },
];

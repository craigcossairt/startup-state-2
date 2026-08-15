export type PlaybookStageSlug =
  | "thinking-of-starting"
  | "starting"
  | "growing"
  | "closing";

export type PlaybookLink = {
  label: string;
  url: string;
};

export type PlaybookStep = {
  stepId: string;
  stage: PlaybookStageSlug;
  stepIndex: number;
  title: string;
  sourceUrl: string;
  summary: string;
  whatYouDo: string[];
  officialLinks: PlaybookLink[];
  resourceTopics: string[];
};

export type PlaybookStageCard = {
  slug: PlaybookStageSlug;
  label: string;
  shortLabel: string;
  accent: string;
  lead: string;
};

export type CatalogResource = {
  id: string;
  externalId: string | null;
  title: string;
  description: string | null;
  communities: string[];
  industries: string[];
  locations: string[];
  topics: string[];
  link: string | null;
  email: string | null;
};

export type CatalogStartup = {
  id: string;
  slug: string;
  name: string;
  website: string | null;
  linkedinUrl: string | null;
  description: string | null;
  fullAddress: string | null;
  city: string | null;
  region: string | null;
  lat: number | null;
  lng: number | null;
  sector: string;
  stage: string | null;
  employeesBucket: string;
  revenueBucket: string;
  foundingYear: number | null;
  isHiring: boolean;
  careersUrl: string | null;
};

export type NewsItem = {
  title: string;
  date: string;
  summary: string;
  url: string;
};

export type SwagItem = {
  src: string;
  title: string;
  caption: string;
  tag: string;
};

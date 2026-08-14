import type { SectorTag, UseOfFundsTag } from "@/lib/types/company-profile";

export const USE_OF_FUNDS_LABELS: Record<UseOfFundsTag, string> = {
  product_development: "Product development",
  pilots: "Pilots",
  scale_up: "Scale-up",
  r_and_d: "R&D",
  hiring: "Hiring",
  equipment: "Equipment",
  expansion: "Expansion",
  commercial_growth: "Commercial growth",
  manufacturing_scale: "Manufacturing scale",
};

export const SECTOR_LABELS: Record<SectorTag, string> = {
  healthcare: "Healthcare",
  ai: "AI",
  saas: "SaaS",
  aerospace: "Aerospace",
  manufacturing: "Manufacturing",
  defense: "Defense",
  water: "Water",
  climate: "Climate",
  environment: "Environment",
  infrastructure: "Infrastructure",
  cybersecurity: "Cybersecurity",
  marketplace: "Marketplace",
  education: "Education",
  youth: "Youth",
  workforce: "Workforce",
};

export const DEFAULT_HQ_COUNTRY = "US";
export const DEFAULT_HQ_STATE = "UT";

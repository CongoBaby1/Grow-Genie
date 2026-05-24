// ===== GROW GENIE TYPES =====

export type GrowStage = 'germination' | 'seedling' | 'vegetative' | 'flowering' | 'harvest';

export interface EnvironmentSettings {
  lightSchedule?: string;     // e.g. "18/6", "12/12", "20/4"
  lightType?: string;         // e.g. "LED", "HPS", "CMH"
  lightWattage?: number;        // e.g. 600
  tentSize?: string;            // e.g. "4x4"
  medium?: string;              // e.g. "Coco", "Soil", "Hydro", "Rockwool"
  potSize?: string;             // e.g. "3 gallon", "5 gallon"
  ventilation?: string;         // e.g. "6\" inline fan"
  notes?: string;
}

export interface Environment {
  id: string;
  name: string;
  type: 'tent' | 'room' | 'outdoor' | 'cabinet';
  settings?: EnvironmentSettings;
}

export interface Plant {
  id: string;
  name: string;
  strain: string;
  breeder?: string;
  environmentId: string;
  scheduleId?: string;          // linked nutrient schedule
  stage: GrowStage;
  day: number;
  week: number;
  startedAt: string; // ISO date
  heroPhotoUrl?: string;
  photos: PlantPhoto[];
  notes: string;
  archived: boolean;
}

export interface PlantPhoto {
  id: string;
  url: string;
  date: string; // ISO date
  caption?: string;
  isHero: boolean;
}

export type ActionType = 'water' | 'nutrients' | 'flush' | 'transplant' | 'trim' | 'top' | 'foliar' | 'defoliate' | 'pest' | 'note';

export interface ScheduleEntry {
  week: number;
  products: ProductDose[];
  note?: string;
}

export interface NutrientSchedule {
  id: string;
  name: string;
  targetStage: GrowStage;
  entries: ScheduleEntry[];
  brand?: string; // e.g. "Advanced Nutrients"
}

export interface FeedLog {
  id: string;
  plantId: string;
  type: ActionType;
  date: string; // ISO date
  products: ProductDose[];
  ph?: number;
  ec?: number;
  ppm?: number;
  waterAmount?: number; // ml
  runOff?: number; // ml
  temperature?: number; // °F
  humidity?: number; // %
  note: string;
  images?: string[];
}

export interface ProductDose {
  product: string; // e.g. "Advanced Nutrients - Big Bud"
  amount: number;
  unit: 'ml' | 'g' | 'tsp' | 'tbsp' | 'oz';
  perGallon?: boolean;
}

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface Grow {
  id: string;
  name: string;
  environments: Environment[];
  plants: Plant[];
  logs: FeedLog[];
}

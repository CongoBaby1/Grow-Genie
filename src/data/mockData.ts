import type { Grow, Environment, Plant, FeedLog } from '../types';

const today = new Date().toISOString().split('T')[0];
const offsetDays = (d: number) => {
  const dt = new Date();
  dt.setDate(dt.getDate() + d);
  return dt.toISOString().split('T')[0];
};

const started90DaysAgo = new Date();
started90DaysAgo.setDate(started90DaysAgo.getDate() - 90);
const started90 = started90DaysAgo.toISOString().split('T')[0];

const started45DaysAgo = new Date();
started45DaysAgo.setDate(started45DaysAgo.getDate() - 45);
const started45 = started45DaysAgo.toISOString().split('T')[0];

const started14DaysAgo = new Date();
started14DaysAgo.setDate(started14DaysAgo.getDate() - 14);
const started14 = started14DaysAgo.toISOString().split('T')[0];

export const mockEnvironments: Environment[] = [
  { id: 'env-big-tent', name: 'Big Tent (4x4)', type: 'tent' },
  { id: 'env-small-tent', name: 'Small Tent (2x2)', type: 'tent' },
  { id: 'env-outdoor', name: 'Backyard Plot', type: 'outdoor' },
];

export const mockPlants: Plant[] = [
  {
    id: 'plant-1',
    name: 'White Widow Auto #1',
    strain: 'White Widow Auto',
    breeder: 'Royal Queen Seeds',
    environmentId: 'env-big-tent',
    stage: 'flowering',
    day: 90,
    week: 13,
    startedAt: started90,
    heroPhotoUrl: 'https://images.unsplash.com/photo-1603909223429-69bb7101f420?w=800&h=600&fit=crop',
    photos: [
      { id: 'p1', url: 'https://images.unsplash.com/photo-1603909223429-69bb7101f420?w=400', date: offsetDays(-1), caption: 'Day 89 — buds swelling', isHero: true },
      { id: 'p2', url: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=400', date: offsetDays(-7), caption: 'Day 83 — frosty', isHero: false },
      { id: 'p3', url: 'https://images.unsplash.com/photo-1585338107529-13afc5f02586?w=400', date: offsetDays(-14), caption: 'Day 76 — stretching', isHero: false },
    ],
    notes: 'Heavy trichome production. Smells fruity with gas.',
    archived: false,
  },
  {
    id: 'plant-2',
    name: 'Gorilla Glue #4',
    strain: 'Gorilla Glue #4',
    breeder: 'GG Strains',
    environmentId: 'env-big-tent',
    stage: 'vegetative',
    day: 45,
    week: 7,
    startedAt: started45,
    heroPhotoUrl: 'https://images.unsplash.com/photo-1596566006778-a48b45a66b1c?w=800&h=600&fit=crop',
    photos: [
      { id: 'p4', url: 'https://images.unsplash.com/photo-1596566006778-a48b45a66b1c?w=400', date: offsetDays(-2), caption: 'Day 43 — vigorous growth', isHero: true },
    ],
    notes: 'Topped once. Showing 8 main colas.',
    archived: false,
  },
  {
    id: 'plant-3',
    name: 'Northern Lights Auto',
    strain: 'Northern Lights Auto',
    breeder: 'Sensi Seeds',
    environmentId: 'env-small-tent',
    stage: 'seedling',
    day: 14,
    week: 2,
    startedAt: started14,
    heroPhotoUrl: 'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?w=800&h=600&fit=crop',
    photos: [
      { id: 'p5', url: 'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?w=400', date: offsetDays(-1), caption: 'Day 13 — first true leaves', isHero: true },
    ],
    notes: 'Cotyledons healthy. First true leaves just emerging.',
    archived: false,
  },
  {
    id: 'plant-4',
    name: 'Blue Dream (Outdoor)',
    strain: 'Blue Dream',
    breeder: 'Humboldt Seed Co',
    environmentId: 'env-outdoor',
    stage: 'vegetative',
    day: 60,
    week: 9,
    startedAt: started90,
    heroPhotoUrl: 'https://images.unsplash.com/photo-1550989460-0adf9ea598e7?w=800&h=600&fit=crop',
    photos: [
      { id: 'p6', url: 'https://images.unsplash.com/photo-1550989460-0adf9ea598e7?w=400', date: offsetDays(-3), caption: 'Day 57 — sun power', isHero: true },
    ],
    notes: 'Outdoor weather has been perfect. Natural pests minimal.',
    archived: false,
  },
];

export const mockLogs: FeedLog[] = [
  {
    id: 'log-1',
    plantId: 'plant-1',
    type: 'water',
    date: offsetDays(-2),
    products: [],
    waterAmount: 2000,
    ph: 6.2,
    ec: 1.4,
    temperature: 72,
    humidity: 55,
    note: 'Regular watering, no nutes this round.',
    images: [],
  },
  {
    id: 'log-2',
    plantId: 'plant-1',
    type: 'nutrients',
    date: offsetDays(-5),
    products: [
      { product: 'Advanced Nutrients - Big Bud', amount: 5, unit: 'ml', perGallon: true },
      { product: 'Advanced Nutrients - Overdrive', amount: 2, unit: 'ml', perGallon: true },
    ],
    waterAmount: 2000,
    ph: 6.1,
    ec: 1.8,
    temperature: 73,
    humidity: 52,
    note: 'Bloom week 6 feeding. Buds getting dense.',
    images: [],
  },
  {
    id: 'log-3',
    plantId: 'plant-2',
    type: 'nutrients',
    date: offsetDays(-1),
    products: [
      { product: 'General Hydroponics - FloraGro', amount: 3, unit: 'ml', perGallon: true },
      { product: 'General Hydroponics - FloraMicro', amount: 2, unit: 'ml', perGallon: true },
      { product: 'General Hydroponics - CaliMagic', amount: 2, unit: 'ml', perGallon: true },
    ],
    waterAmount: 1500,
    ph: 6.3,
    ec: 1.2,
    temperature: 75,
    humidity: 60,
    note: 'Veg feeding. Healthy green growth.',
    images: [],
  },
  {
    id: 'log-4',
    plantId: 'plant-3',
    type: 'water',
    date: offsetDays(-1),
    products: [],
    waterAmount: 300,
    ph: 6.5,
    temperature: 78,
    humidity: 70,
    note: 'Light misting around dome.',
    images: [],
  },
  {
    id: 'log-5',
    plantId: 'plant-4',
    type: 'water',
    date: offsetDays(-3),
    products: [],
    waterAmount: 5000,
    temperature: 82,
    humidity: 45,
    note: 'Deep watering with rain barrel collection.',
    images: [],
  },
];

export const mockGrow: Grow = {
  id: 'grow-main',
  name: 'Summer 2026 Grow',
  environments: mockEnvironments,
  plants: mockPlants,
  logs: mockLogs,
};

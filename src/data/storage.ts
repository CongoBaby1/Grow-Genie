// ===== LOCALSTORAGE DATA SERVICE =====
import type { Grow, Plant, FeedLog, Environment, PlantPhoto } from '../types';
import { mockGrow } from './mockData';

const STORAGE_KEY = 'grow-genie-data';

// --- read / write ---

function load(): Grow {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw) as Grow;
  } catch { /* ignore */ }
  return seed();
}

function seed(): Grow {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(mockGrow));
  return { ...mockGrow };
}

function save(data: Grow) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

// --- helpers ---

let cache: Grow | null = null;

export function getGrow(): Grow {
  if (!cache) cache = load();
  return cache;
}

function mutate(fn: (d: Grow) => void) {
  const d = getGrow();
  fn(d);
  cache = d;
  save(d);
}

function uid(prefix = 'id') {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
}

// --- plants ---

export function addPlant(
  name: string,
  strain: string,
  breeder: string,
  environmentId: string,
  stage: Plant['stage'],
  startedAt: string,
  heroPhotoBase64?: string,
  notes = ''
): Plant {
  const plant: Plant = {
    id: uid('plant'),
    name,
    strain,
    breeder,
    environmentId,
    stage,
    day: 0,
    week: 0,
    startedAt,
    heroPhotoUrl: heroPhotoBase64,
    photos: heroPhotoBase64
      ? [{
          id: uid('photo'),
          url: heroPhotoBase64,
          date: startedAt,
          caption: 'Plant photo',
          isHero: true,
        }]
      : [],
    notes,
    archived: false,
  };
  recalcDayWeek(plant);
  mutate((d) => d.plants.push(plant));
  return plant;
}

export function updatePlant(
  id: string,
  patch: Partial<Pick<Plant, 'name' | 'strain' | 'breeder' | 'environmentId' | 'stage' | 'notes' | 'archived'>>
) {
  mutate((d) => {
    const p = d.plants.find((x) => x.id === id);
    if (!p) return;
    Object.assign(p, patch);
    recalcDayWeek(p);
  });
}

export function deletePlant(id: string) {
  mutate((d) => {
    d.plants = d.plants.filter((p) => p.id !== id);
    d.logs = d.logs.filter((l) => l.plantId !== id);
  });
}

// --- environments ---

export function addEnvironment(name: string, type: Environment['type']): Environment {
  const env: Environment = { id: uid('env'), name, type };
  mutate((d) => d.environments.push(env));
  return env;
}

// --- logs ---

export function addLog(
  plantId: string,
  type: FeedLog['type'],
  opts: Partial<Pick<FeedLog, 'products' | 'ph' | 'ec' | 'ppm' | 'waterAmount' | 'runOff' | 'temperature' | 'humidity' | 'note' | 'images'>> = {}
): FeedLog {
  const log: FeedLog = {
    id: uid('log'),
    plantId,
    type,
    date: new Date().toISOString().split('T')[0],
    products: opts.products ?? [],
    ph: opts.ph,
    ec: opts.ec,
    ppm: opts.ppm,
    waterAmount: opts.waterAmount,
    runOff: opts.runOff,
    temperature: opts.temperature,
    humidity: opts.humidity,
    note: opts.note ?? '',
    images: opts.images ?? [],
  };
  mutate((d) => d.logs.push(log));
  return log;
}

export function deleteLog(id: string) {
  mutate((d) => {
    d.logs = d.logs.filter((l) => l.id !== id);
  });
}

// --- photos ---

export function addPhoto(plantId: string, base64: string, caption?: string): PlantPhoto {
  const photo: PlantPhoto = {
    id: uid('photo'),
    url: base64,
    date: new Date().toISOString().split('T')[0],
    caption,
    isHero: false,
  };
  mutate((d) => {
    const p = d.plants.find((x) => x.id === plantId);
    if (p) p.photos.push(photo);
  });
  return photo;
}

export function setHeroPhoto(plantId: string, photoId: string) {
  mutate((d) => {
    const p = d.plants.find((x) => x.id === plantId);
    if (!p) return;
    p.photos.forEach((ph) => (ph.isHero = ph.id === photoId));
    const hero = p.photos.find((ph) => ph.id === photoId);
    if (hero) p.heroPhotoUrl = hero.url;
  });
}

// --- utils ---

function recalcDayWeek(plant: Plant) {
  const start = new Date(plant.startedAt);
  const now = new Date();
  const diff = Math.floor((now.getTime() - start.getTime()) / 86400000);
  plant.day = Math.max(0, diff);
  plant.week = Math.floor(plant.day / 7) + 1;
}

// Recalc all plants periodically
export function recalcAll() {
  mutate((d) => {
    for (const p of d.plants) recalcDayWeek(p);
  });
}

// Reset to mock data (debug)
export function resetToMock() {
  cache = seed();
}

import { wineCountries, type OpenedWineCountry, type WineCountryRegionGroup } from "./data/wineCountries";

export const regionGroupLabels: Record<WineCountryRegionGroup, string> = {
  Europe: "Европа",
  Caucasus: "Кавказ",
  Americas: "Новый свет",
  Africa: "Африка",
  Oceania: "Океания",
  "Middle East": "Ближний Восток",
};

export type RegionProgress = {
  key: WineCountryRegionGroup;
  label: string;
  opened: number;
  total: number;
};

export type TasteMapAchievement = {
  key: string;
  title: string;
  description: string;
  achieved: boolean;
  progress: number;
  target: number;
};

export function getRegionProgress(openedCountries: OpenedWineCountry[]): RegionProgress[] {
  const openedByRegion = new Map<WineCountryRegionGroup, number>();

  for (const country of openedCountries) {
    openedByRegion.set(country.regionGroup, (openedByRegion.get(country.regionGroup) ?? 0) + 1);
  }

  return Array.from(new Set(wineCountries.map((country) => country.regionGroup))).map((regionGroup) => ({
    key: regionGroup,
    label: regionGroupLabels[regionGroup],
    opened: openedByRegion.get(regionGroup) ?? 0,
    total: wineCountries.filter((country) => country.regionGroup === regionGroup).length,
  }));
}

export function getTasteMapAchievements(openedCountries: OpenedWineCountry[]): TasteMapAchievement[] {
  const regionProgress = getRegionProgress(openedCountries);
  const openedCodes = new Set(openedCountries.map((country) => country.code));
  const europeCount = regionProgress.find((item) => item.key === "Europe")?.opened ?? 0;
  const americasCount = regionProgress.find((item) => item.key === "Americas")?.opened ?? 0;
  const caucasusFootprint = ["GE", "AM", "MD"].filter((code) => openedCodes.has(code)).length;

  return [
    achievement("first-country", "Первый штрих на карте", "Открыть первую страну.", openedCountries.length, 1),
    achievement("europe-route", "Европейский маршрут", "Открыть три европейские страны.", europeCount, 3),
    achievement("new-world", "Новый свет", "Открыть две страны Америки.", americasCount, 2),
    achievement("caucasus-footprint", "Кавказский след", "Открыть Грузию, Армению или Молдову.", caucasusFootprint, 1),
    achievement("wine-globe", "Винный глобус", "Открыть десять стран.", openedCountries.length, 10),
    achievement("country-collector", "Коллекционер стран", "Открыть двадцать стран.", openedCountries.length, 20),
  ];
}

export function getNextTasteMapAchievement(openedCountries: OpenedWineCountry[]): TasteMapAchievement | null {
  return getTasteMapAchievements(openedCountries).find((item) => !item.achieved) ?? null;
}

function achievement(
  key: string,
  title: string,
  description: string,
  progress: number,
  target: number,
): TasteMapAchievement {
  return {
    key,
    title,
    description,
    achieved: progress >= target,
    progress: Math.min(progress, target),
    target,
  };
}

import type { TasteProfileCountItem } from "../../taste-profile/types";

export type WineCountryRegionGroup = "Europe" | "Caucasus" | "Americas" | "Africa" | "Oceania" | "Middle East";

export type WineCountry = {
  code: string;
  name: string;
  label: string;
  regionGroup: WineCountryRegionGroup;
  x: number;
  y: number;
  commonWineHint: string;
  aliases: string[];
};

export type OpenedWineCountry = WineCountry & {
  count: number;
  sourceName: string;
};

export const wineCountries: WineCountry[] = [
  country("FR", "France", "Франция", "Europe", 46, 38, "шардоне, бордо, шампанское", ["франция"]),
  country("IT", "Italy", "Италия", "Europe", 50, 43, "кьянти, пьемонт, просекко", ["италия"]),
  country("ES", "Spain", "Испания", "Europe", 42, 45, "риоха, кава, гарнача", ["испания"]),
  country("PT", "Portugal", "Португалия", "Europe", 39, 46, "винью верде, портвейн", ["португалия"]),
  country("DE", "Germany", "Германия", "Europe", 49, 34, "рислинг, пфальц, мозель", ["германия"]),
  country("AT", "Austria", "Австрия", "Europe", 52, 37, "грюнер вельтлинер", ["австрия"]),
  country("GR", "Greece", "Греция", "Europe", 56, 49, "ассиртико, ксиномавро", ["греция"]),
  country("HU", "Hungary", "Венгрия", "Europe", 54, 38, "токай, фурминт", ["венгрия"]),
  country("HR", "Croatia", "Хорватия", "Europe", 52, 41, "плавац мали", ["хорватия"]),
  country("SI", "Slovenia", "Словения", "Europe", 51, 40, "ребула, оранжевые вина", ["словения"]),
  country("RO", "Romania", "Румыния", "Europe", 57, 39, "фетяска, местные сорта", ["румыния"]),
  country("BG", "Bulgaria", "Болгария", "Europe", 58, 43, "мавруд, мелник", ["болгария"]),
  country("CZ", "Czech Republic", "Чехия", "Europe", 51, 35, "моравские белые вина", ["czechia", "чехия", "чешская республика"]),
  country("SK", "Slovakia", "Словакия", "Europe", 53, 36, "токайская зона", ["словакия"]),
  country("CH", "Switzerland", "Швейцария", "Europe", 48, 39, "шасла, альпийские вина", ["швейцария"]),
  country("MD", "Moldova", "Молдова", "Europe", 60, 38, "фетяска, рара нягрэ", ["молдова", "молдавия"]),
  country("GE", "Georgia", "Грузия", "Caucasus", 65, 44, "саперави, ркацители, квеври", ["грузия"]),
  country("AM", "Armenia", "Армения", "Caucasus", 66, 47, "арени, воскеат", ["армения"]),
  country("TR", "Turkey", "Турция", "Middle East", 61, 48, "каледжик карасы", ["турция"]),
  country("LB", "Lebanon", "Ливан", "Middle East", 63, 51, "долина Бекаа", ["ливан"]),
  country("IL", "Israel", "Израиль", "Middle East", 62, 53, "галилея, голаны", ["израиль"]),
  country("US", "USA", "США", "Americas", 18, 42, "калифорния, орегон", ["united states", "united states of america", "usa", "us", "сша", "соединенные штаты", "соединённые штаты"]),
  country("CA", "Canada", "Канада", "Americas", 18, 28, "айсвайн, онтарио", ["канада"]),
  country("MX", "Mexico", "Мексика", "Americas", 18, 53, "баха калифорния", ["мексика"]),
  country("CL", "Chile", "Чили", "Americas", 30, 75, "карменер, каберне", ["чили"]),
  country("AR", "Argentina", "Аргентина", "Americas", 33, 78, "мальбек, мендоса", ["аргентина"]),
  country("UY", "Uruguay", "Уругвай", "Americas", 36, 78, "таннат", ["уругвай"]),
  country("BR", "Brazil", "Бразилия", "Americas", 39, 68, "игристые серра гауша", ["бразилия"]),
  country("ZA", "South Africa", "ЮАР", "Africa", 55, 78, "шенен блан, пинотаж", ["south africa", "юар", "южная африка"]),
  country("AU", "Australia", "Австралия", "Oceania", 78, 73, "шираз, риверина, баросса", ["австралия"]),
  country("NZ", "New Zealand", "Новая Зеландия", "Oceania", 87, 79, "совиньон блан, пино нуар", ["new zealand", "новая зеландия"]),
];

const aliasToCode = new Map<string, string>(
  wineCountries.flatMap((item) => [
    [normalizeCountryText(item.code), item.code],
    [normalizeCountryText(item.name), item.code],
    [normalizeCountryText(item.label), item.code],
    ...item.aliases.map((alias) => [normalizeCountryText(alias), item.code] as [string, string]),
  ]),
);

export function getOpenedWineCountries(items: TasteProfileCountItem[]): OpenedWineCountry[] {
  const counts = new Map<string, { count: number; sourceName: string }>();

  for (const item of items) {
    const code = aliasToCode.get(normalizeCountryText(item.key));
    if (!code) {
      continue;
    }

    const existing = counts.get(code);
    counts.set(code, {
      count: (existing?.count ?? 0) + item.count,
      sourceName: existing?.sourceName ?? item.key,
    });
  }

  return wineCountries
    .filter((item) => counts.has(item.code))
    .map((item) => ({
      ...item,
      count: counts.get(item.code)?.count ?? 0,
      sourceName: counts.get(item.code)?.sourceName ?? item.name,
    }))
    .sort((left, right) => right.count - left.count || left.label.localeCompare(right.label));
}

export function getNextWineCountries(openedCountries: OpenedWineCountry[], limit = 6): WineCountry[] {
  const openedCodes = new Set(openedCountries.map((item) => item.code));
  const priority = ["FR", "IT", "ES", "PT", "DE", "GE", "AR", "CL", "ZA", "AU", "NZ", "GR"];
  const candidates = [...wineCountries]
    .filter((item) => !openedCodes.has(item.code))
    .sort((left, right) => priorityIndex(left.code, priority) - priorityIndex(right.code, priority));
  const selected: WineCountry[] = [];
  const usedRegionGroups = new Set<WineCountryRegionGroup>();

  for (const country of candidates) {
    if (selected.length >= limit) {
      break;
    }
    if (usedRegionGroups.has(country.regionGroup)) {
      continue;
    }

    selected.push(country);
    usedRegionGroups.add(country.regionGroup);
  }

  for (const country of candidates) {
    if (selected.length >= limit) {
      break;
    }
    if (!selected.some((item) => item.code === country.code)) {
      selected.push(country);
    }
  }

  return selected;
}

function country(
  code: string,
  name: string,
  label: string,
  regionGroup: WineCountryRegionGroup,
  x: number,
  y: number,
  commonWineHint: string,
  aliases: string[],
): WineCountry {
  return { code, name, label, regionGroup, x, y, commonWineHint, aliases };
}

function normalizeCountryText(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/ё/g, "е")
    .replace(/\./g, "")
    .replace(/-/g, " ")
    .replace(/\s+/g, " ");
}

function priorityIndex(code: string, priority: string[]): number {
  const index = priority.indexOf(code);
  return index === -1 ? priority.length : index;
}

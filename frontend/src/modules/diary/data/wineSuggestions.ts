export type WineSuggestion = {
  name: string;
  country: string;
  region: string;
  grape: string;
  style?: string;
};

type WineSuggestionGroup = {
  country: string;
  regions: string[];
  grapes: string[];
  stylesByGrape?: Record<string, string>;
  defaultStyle: string;
};

const baseSuggestions: WineSuggestion[] = [
  { name: "Prosecco Valdobbiadene", country: "Italy", region: "Veneto", grape: "Glera", style: "Sparkling" },
  { name: "Champagne Brut", country: "France", region: "Champagne", grape: "Chardonnay / Pinot Noir / Meunier", style: "Sparkling" },
  { name: "Cremant de Bourgogne", country: "France", region: "Burgundy", grape: "Chardonnay / Pinot Noir", style: "Sparkling" },
  { name: "Cava Brut", country: "Spain", region: "Catalonia", grape: "Macabeo / Xarel-lo / Parellada", style: "Sparkling" },
  { name: "Franciacorta", country: "Italy", region: "Lombardy", grape: "Chardonnay / Pinot Noir", style: "Sparkling" },
  { name: "Chablis", country: "France", region: "Burgundy", grape: "Chardonnay", style: "White" },
  { name: "Sancerre", country: "France", region: "Loire Valley", grape: "Sauvignon Blanc", style: "White" },
  { name: "Pouilly-Fume", country: "France", region: "Loire Valley", grape: "Sauvignon Blanc", style: "White" },
  { name: "Muscadet Sevre et Maine", country: "France", region: "Loire Valley", grape: "Melon de Bourgogne", style: "White" },
  { name: "Gewurztraminer Alsace", country: "France", region: "Alsace", grape: "Gewurztraminer", style: "White" },
  { name: "Riesling Kabinett", country: "Germany", region: "Mosel", grape: "Riesling", style: "White" },
  { name: "Riesling Trocken", country: "Germany", region: "Rheingau", grape: "Riesling", style: "White" },
  { name: "Gruner Veltliner Wachau", country: "Austria", region: "Wachau", grape: "Gruner Veltliner", style: "White" },
  { name: "Vinho Verde", country: "Portugal", region: "Minho", grape: "Loureiro / Alvarinho", style: "White" },
  { name: "Albarino Rias Baixas", country: "Spain", region: "Galicia", grape: "Albarino", style: "White" },
  { name: "Vermentino di Sardegna", country: "Italy", region: "Sardinia", grape: "Vermentino", style: "White" },
  { name: "Soave Classico", country: "Italy", region: "Veneto", grape: "Garganega", style: "White" },
  { name: "Marlborough Sauvignon Blanc", country: "New Zealand", region: "Marlborough", grape: "Sauvignon Blanc", style: "White" },
  { name: "Chenin Blanc Stellenbosch", country: "South Africa", region: "Stellenbosch", grape: "Chenin Blanc", style: "White" },
  { name: "Chardonnay Sonoma Coast", country: "USA", region: "California", grape: "Chardonnay", style: "White" },
  { name: "Provence Rose", country: "France", region: "Provence", grape: "Grenache / Cinsault", style: "Rose" },
  { name: "Tavel Rose", country: "France", region: "Rhone Valley", grape: "Grenache / Cinsault", style: "Rose" },
  { name: "Txakoli Rose", country: "Spain", region: "Basque Country", grape: "Hondarrabi Beltza", style: "Rose" },
  { name: "Chianti Classico", country: "Italy", region: "Tuscany", grape: "Sangiovese", style: "Red" },
  { name: "Brunello di Montalcino", country: "Italy", region: "Tuscany", grape: "Sangiovese", style: "Red" },
  { name: "Barolo", country: "Italy", region: "Piedmont", grape: "Nebbiolo", style: "Red" },
  { name: "Barbaresco", country: "Italy", region: "Piedmont", grape: "Nebbiolo", style: "Red" },
  { name: "Amarone della Valpolicella", country: "Italy", region: "Veneto", grape: "Corvina / Rondinella", style: "Red" },
  { name: "Etna Rosso", country: "Italy", region: "Sicily", grape: "Nerello Mascalese", style: "Red" },
  { name: "Rioja Crianza", country: "Spain", region: "Rioja", grape: "Tempranillo", style: "Red" },
  { name: "Ribera del Duero", country: "Spain", region: "Castilla y Leon", grape: "Tempranillo", style: "Red" },
  { name: "Priorat", country: "Spain", region: "Catalonia", grape: "Garnacha / Carinena", style: "Red" },
  { name: "Toro", country: "Spain", region: "Castilla y Leon", grape: "Tempranillo", style: "Red" },
  { name: "Douro Tinto", country: "Portugal", region: "Douro", grape: "Touriga Nacional / Touriga Franca", style: "Red" },
  { name: "Bordeaux Rouge", country: "France", region: "Bordeaux", grape: "Merlot / Cabernet Sauvignon", style: "Red" },
  { name: "Cotes du Rhone", country: "France", region: "Rhone Valley", grape: "Grenache / Syrah", style: "Red" },
  { name: "Beaujolais Villages", country: "France", region: "Beaujolais", grape: "Gamay", style: "Red" },
  { name: "Pinot Noir Bourgogne", country: "France", region: "Burgundy", grape: "Pinot Noir", style: "Red" },
  { name: "Malbec Mendoza", country: "Argentina", region: "Mendoza", grape: "Malbec", style: "Red" },
  { name: "Bonarda Mendoza", country: "Argentina", region: "Mendoza", grape: "Bonarda", style: "Red" },
  { name: "Carmenere Colchagua", country: "Chile", region: "Colchagua Valley", grape: "Carmenere", style: "Red" },
  { name: "Cabernet Sauvignon Maipo", country: "Chile", region: "Maipo Valley", grape: "Cabernet Sauvignon", style: "Red" },
  { name: "Cabernet Sauvignon Napa Valley", country: "USA", region: "California", grape: "Cabernet Sauvignon", style: "Red" },
  { name: "Pinot Noir Oregon", country: "USA", region: "Oregon", grape: "Pinot Noir", style: "Red" },
  { name: "Zinfandel Lodi", country: "USA", region: "California", grape: "Zinfandel", style: "Red" },
  { name: "Shiraz Barossa Valley", country: "Australia", region: "Barossa Valley", grape: "Shiraz", style: "Red" },
  { name: "Pinotage Stellenbosch", country: "South Africa", region: "Stellenbosch", grape: "Pinotage", style: "Red" },
  { name: "Mukuzani", country: "Georgia", region: "Kakheti", grape: "Saperavi", style: "Red" },
  { name: "Kindzmarauli", country: "Georgia", region: "Kakheti", grape: "Saperavi", style: "Red semi-sweet" },
  { name: "Khvanchkara", country: "Georgia", region: "Racha", grape: "Aleksandrouli / Mujuretuli", style: "Red semi-sweet" },
  { name: "Tokaji Late Harvest", country: "Hungary", region: "Tokaj", grape: "Furmint", style: "Dessert" },
  { name: "Lambrusco Emilia", country: "Italy", region: "Emilia-Romagna", grape: "Lambrusco", style: "Sparkling red" },
  { name: "Port Ruby", country: "Portugal", region: "Douro", grape: "Touriga Nacional / Tinta Roriz", style: "Fortified" },
  { name: "Sherry Fino", country: "Spain", region: "Jerez", grape: "Palomino", style: "Fortified" },
  { name: "Madeira Medium Dry", country: "Portugal", region: "Madeira", grape: "Sercial / Verdelho", style: "Fortified" },
];

const wineSuggestionGroups: WineSuggestionGroup[] = [
  {
    country: "France",
    regions: ["Bordeaux", "Medoc", "Saint-Emilion", "Pomerol", "Graves"],
    grapes: ["Merlot", "Cabernet Sauvignon", "Cabernet Franc", "Sauvignon Blanc", "Semillon"],
    defaultStyle: "Red",
    stylesByGrape: { "Sauvignon Blanc": "White", Semillon: "White" },
  },
  {
    country: "France",
    regions: ["Burgundy", "Chablis", "Cote de Beaune", "Cote de Nuits", "Maconnais"],
    grapes: ["Chardonnay", "Pinot Noir", "Aligote", "Gamay"],
    defaultStyle: "Red",
    stylesByGrape: { Chardonnay: "White", Aligote: "White" },
  },
  {
    country: "France",
    regions: ["Loire Valley", "Sancerre", "Anjou", "Vouvray", "Muscadet"],
    grapes: ["Sauvignon Blanc", "Chenin Blanc", "Cabernet Franc", "Melon de Bourgogne", "Pinot Noir"],
    defaultStyle: "White",
    stylesByGrape: { "Cabernet Franc": "Red", "Pinot Noir": "Red" },
  },
  {
    country: "France",
    regions: ["Rhone Valley", "Cote Rotie", "Hermitage", "Chateauneuf-du-Pape", "Tavel"],
    grapes: ["Syrah", "Grenache", "Marsanne", "Roussanne", "Grenache / Cinsault"],
    defaultStyle: "Red",
    stylesByGrape: { Marsanne: "White", Roussanne: "White", "Grenache / Cinsault": "Rose" },
  },
  {
    country: "France",
    regions: ["Alsace", "Provence", "Languedoc", "Roussillon"],
    grapes: ["Riesling", "Gewurztraminer", "Pinot Gris", "Grenache", "Carignan", "Cinsault"],
    defaultStyle: "White",
    stylesByGrape: { Grenache: "Red", Carignan: "Red", Cinsault: "Rose" },
  },
  {
    country: "Italy",
    regions: ["Tuscany", "Chianti", "Montalcino", "Montepulciano", "Bolgheri"],
    grapes: ["Sangiovese", "Merlot", "Cabernet Sauvignon", "Vermentino", "Trebbiano"],
    defaultStyle: "Red",
    stylesByGrape: { Vermentino: "White", Trebbiano: "White" },
  },
  {
    country: "Italy",
    regions: ["Piedmont", "Barolo", "Barbaresco", "Langhe", "Asti"],
    grapes: ["Nebbiolo", "Barbera", "Dolcetto", "Moscato", "Cortese"],
    defaultStyle: "Red",
    stylesByGrape: { Moscato: "Dessert", Cortese: "White" },
  },
  {
    country: "Italy",
    regions: ["Veneto", "Valpolicella", "Soave", "Friuli", "Alto Adige"],
    grapes: ["Corvina", "Garganega", "Pinot Grigio", "Sauvignon Blanc", "Ribolla Gialla"],
    defaultStyle: "White",
    stylesByGrape: { Corvina: "Red" },
  },
  {
    country: "Italy",
    regions: ["Sicily", "Etna", "Sardinia", "Puglia", "Emilia-Romagna"],
    grapes: ["Nero d'Avola", "Nerello Mascalese", "Vermentino", "Primitivo", "Lambrusco"],
    defaultStyle: "Red",
    stylesByGrape: { Vermentino: "White", Lambrusco: "Sparkling red" },
  },
  {
    country: "Spain",
    regions: ["Rioja", "Ribera del Duero", "Toro", "Priorat", "Navarra", "Jumilla"],
    grapes: ["Tempranillo", "Garnacha", "Monastrell", "Graciano", "Viura"],
    defaultStyle: "Red",
    stylesByGrape: { Viura: "White" },
  },
  {
    country: "Spain",
    regions: ["Rias Baixas", "Rueda", "Penedes", "Catalonia", "Jerez"],
    grapes: ["Albarino", "Verdejo", "Xarel-lo", "Macabeo", "Palomino"],
    defaultStyle: "White",
    stylesByGrape: { "Xarel-lo": "Sparkling", Macabeo: "Sparkling", Palomino: "Fortified" },
  },
  {
    country: "Portugal",
    regions: ["Douro", "Dao", "Alentejo", "Vinho Verde", "Madeira"],
    grapes: ["Touriga Nacional", "Touriga Franca", "Tinta Roriz", "Alvarinho", "Arinto", "Verdelho"],
    defaultStyle: "Red",
    stylesByGrape: { Alvarinho: "White", Arinto: "White", Verdelho: "Fortified" },
  },
  {
    country: "Germany",
    regions: ["Mosel", "Rheingau", "Pfalz", "Rheinhessen"],
    grapes: ["Riesling", "Spatburgunder", "Silvaner", "Gewurztraminer", "Muller-Thurgau"],
    defaultStyle: "White",
    stylesByGrape: { Spatburgunder: "Red" },
  },
  {
    country: "Austria",
    regions: ["Wachau", "Kamptal", "Kremstal", "Burgenland"],
    grapes: ["Gruner Veltliner", "Riesling", "Zweigelt", "Blaufrankisch", "Welschriesling"],
    defaultStyle: "White",
    stylesByGrape: { Zweigelt: "Red", Blaufrankisch: "Red" },
  },
  {
    country: "Georgia",
    regions: ["Kakheti", "Kartli", "Imereti", "Racha"],
    grapes: ["Saperavi", "Rkatsiteli", "Kisi", "Mtsvane", "Tsolikouri", "Aleksandrouli"],
    defaultStyle: "Orange",
    stylesByGrape: { Saperavi: "Red", Aleksandrouli: "Red semi-sweet" },
  },
  {
    country: "Greece",
    regions: ["Santorini", "Naoussa", "Nemea", "Crete"],
    grapes: ["Assyrtiko", "Xinomavro", "Agiorgitiko", "Vidiano", "Moschofilero"],
    defaultStyle: "White",
    stylesByGrape: { Xinomavro: "Red", Agiorgitiko: "Red" },
  },
  {
    country: "Moldova",
    regions: ["Codru", "Valul lui Traian", "Stefan Voda", "Purcari"],
    grapes: ["Feteasca Alba", "Feteasca Regala", "Feteasca Neagra", "Rara Neagra", "Viorica"],
    defaultStyle: "White",
    stylesByGrape: { "Feteasca Neagra": "Red", "Rara Neagra": "Red" },
  },
  {
    country: "Armenia",
    regions: ["Areni", "Vayots Dzor", "Armavir", "Aragatsotn"],
    grapes: ["Areni Noir", "Voskehat", "Kangun", "Karmrahyut"],
    defaultStyle: "Red",
    stylesByGrape: { Voskehat: "White", Kangun: "White" },
  },
  {
    country: "USA",
    regions: ["Napa Valley", "Sonoma Coast", "Russian River Valley", "Willamette Valley", "Lodi", "Walla Walla"],
    grapes: ["Cabernet Sauvignon", "Merlot", "Pinot Noir", "Chardonnay", "Zinfandel", "Syrah"],
    defaultStyle: "Red",
    stylesByGrape: { Chardonnay: "White" },
  },
  {
    country: "Chile",
    regions: ["Maipo Valley", "Colchagua Valley", "Casablanca Valley", "Aconcagua Valley", "Maule Valley"],
    grapes: ["Cabernet Sauvignon", "Carmenere", "Merlot", "Sauvignon Blanc", "Chardonnay", "Pais"],
    defaultStyle: "Red",
    stylesByGrape: { "Sauvignon Blanc": "White", Chardonnay: "White" },
  },
  {
    country: "Argentina",
    regions: ["Mendoza", "Uco Valley", "Salta", "Patagonia", "San Juan"],
    grapes: ["Malbec", "Bonarda", "Cabernet Sauvignon", "Torrontes", "Chardonnay"],
    defaultStyle: "Red",
    stylesByGrape: { Torrontes: "White", Chardonnay: "White" },
  },
  {
    country: "South Africa",
    regions: ["Stellenbosch", "Swartland", "Franschhoek", "Walker Bay"],
    grapes: ["Chenin Blanc", "Sauvignon Blanc", "Chardonnay", "Pinotage", "Syrah", "Cabernet Sauvignon"],
    defaultStyle: "White",
    stylesByGrape: { Pinotage: "Red", Syrah: "Red", "Cabernet Sauvignon": "Red" },
  },
  {
    country: "Australia",
    regions: ["Barossa Valley", "Margaret River", "Yarra Valley", "Hunter Valley", "Clare Valley"],
    grapes: ["Shiraz", "Cabernet Sauvignon", "Chardonnay", "Riesling", "Semillon", "Grenache"],
    defaultStyle: "Red",
    stylesByGrape: { Chardonnay: "White", Riesling: "White", Semillon: "White" },
  },
  {
    country: "New Zealand",
    regions: ["Marlborough", "Central Otago", "Hawke's Bay", "Martinborough", "Gisborne"],
    grapes: ["Sauvignon Blanc", "Pinot Noir", "Chardonnay", "Riesling", "Pinot Gris"],
    defaultStyle: "White",
    stylesByGrape: { "Pinot Noir": "Red" },
  },
  {
    country: "Hungary",
    regions: ["Tokaj", "Eger", "Villany", "Balaton"],
    grapes: ["Furmint", "Harslevelu", "Kekfrankos", "Kadarka", "Muscat"],
    defaultStyle: "White",
    stylesByGrape: { Kekfrankos: "Red", Kadarka: "Red", Muscat: "Dessert" },
  },
  {
    country: "Uruguay",
    regions: ["Canelones", "Maldonado", "Colonia"],
    grapes: ["Tannat", "Albarino", "Merlot", "Cabernet Franc"],
    defaultStyle: "Red",
    stylesByGrape: { Albarino: "White" },
  },
];

export const wineSuggestions: WineSuggestion[] = buildWineSuggestions();

function buildWineSuggestions(): WineSuggestion[] {
  const suggestions = [...baseSuggestions];

  for (const group of wineSuggestionGroups) {
    for (const region of group.regions) {
      for (const grape of group.grapes) {
        suggestions.push({
          name: `${region} ${grape}`,
          country: group.country,
          region,
          grape,
          style: group.stylesByGrape?.[grape] ?? group.defaultStyle,
        });
      }
    }
  }

  return uniqueSuggestions(suggestions).slice(0, 500);
}

function uniqueSuggestions(suggestions: WineSuggestion[]): WineSuggestion[] {
  const seen = new Set<string>();

  return suggestions.filter((suggestion) => {
    const key = `${suggestion.name}|${suggestion.country}|${suggestion.region}|${suggestion.grape}`.toLowerCase();
    if (seen.has(key)) {
      return false;
    }
    seen.add(key);
    return true;
  });
}

import { wineCountries, type OpenedWineCountry } from "./data/wineCountries";

type TasteWorldMapProps = {
  openedCountries: OpenedWineCountry[];
};

const continents = [
  {
    key: "north-america",
    label: "North America",
    path: "M123 151 C141 91 221 67 284 98 C331 121 351 168 335 210 C317 259 248 278 191 251 C137 226 105 197 123 151 Z",
  },
  {
    key: "south-america",
    label: "South America",
    path: "M250 283 C293 258 342 280 352 326 C362 374 326 448 284 461 C244 474 218 421 228 371 C234 340 221 301 250 283 Z",
  },
  {
    key: "europe",
    label: "Europe",
    path: "M430 145 C464 112 522 111 557 140 C586 164 580 207 544 225 C505 244 444 230 421 198 C409 181 412 162 430 145 Z",
  },
  {
    key: "africa",
    label: "Africa",
    path: "M502 238 C553 211 615 239 630 298 C647 367 598 443 536 436 C478 429 449 355 469 297 C477 273 481 249 502 238 Z",
  },
  {
    key: "asia",
    label: "Asia",
    path: "M586 137 C663 86 804 99 870 159 C929 213 890 297 803 300 C742 303 704 257 641 264 C585 270 536 230 550 184 C555 166 566 150 586 137 Z",
  },
  {
    key: "oceania",
    label: "Oceania",
    path: "M749 372 C806 339 900 358 925 418 C894 466 800 474 754 437 C733 420 727 390 749 372 Z",
  },
];

export function TasteWorldMap({ openedCountries }: TasteWorldMapProps) {
  const openedCodes = new Set(openedCountries.map((item) => item.code));
  const openedByCode = new Map(openedCountries.map((item) => [item.code, item]));

  return (
    <div className="taste-world-map" role="img" aria-label={`Открыто стран на винной карте: ${openedCountries.length}`}>
      <svg viewBox="0 0 1000 520" aria-hidden="true" focusable="false">
        <rect className="taste-world-map__sea" x="0" y="0" width="1000" height="520" rx="30" />
        {/* TODO: exact country polygon fill can become v2.1 if bundle size and Telegram WebView performance stay healthy. */}
        {continents.map((continent) => (
          <path key={continent.key} className="taste-world-map__continent" d={continent.path}>
            <title>{continent.label}</title>
          </path>
        ))}

        {wineCountries.map((country) => {
          const opened = openedCodes.has(country.code);
          const openedCountry = openedByCode.get(country.code);

          return (
            <g key={country.code} className={opened ? "taste-world-map__marker taste-world-map__marker--opened" : "taste-world-map__marker"}>
              <title>
                {opened
                  ? `${country.label}: открыто, записей ${openedCountry?.count ?? 0}`
                  : `${country.label}: пока не открыто. ${country.commonWineHint}`}
              </title>
              {opened && <circle className="taste-world-map__marker-halo" cx={country.x * 10} cy={country.y * 5.2} r="18" />}
              <circle cx={country.x * 10} cy={country.y * 5.2} r={opened ? 8.5 : 5.25} />
            </g>
          );
        })}
      </svg>
      <div className="taste-world-map__legend" aria-label="Легенда карты">
        <span>
          <i className="taste-world-map__legend-dot taste-world-map__legend-dot--opened" /> Открыто
        </span>
        <span>
          <i className="taste-world-map__legend-dot" /> Пока не открыто
        </span>
      </div>
    </div>
  );
}

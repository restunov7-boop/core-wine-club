import type { OpenedWineCountry } from "./data/wineCountries";

type TasteWorldMapProps = {
  openedCountries: OpenedWineCountry[];
};

const continents = [
  {
    key: "north-america",
    label: "North America",
    path: "M108 142 C128 92 190 72 242 87 C286 99 322 128 345 168 C365 203 349 240 313 255 C279 269 241 250 205 256 C168 262 124 240 107 201 C99 181 98 163 108 142 Z M291 249 C326 246 348 267 346 298 C344 323 313 334 290 318 C269 304 266 260 291 249 Z",
  },
  {
    key: "south-america",
    label: "South America",
    path: "M289 298 C324 282 363 301 371 339 C382 392 345 461 303 475 C270 486 244 449 250 406 C254 374 230 343 250 318 C260 306 274 304 289 298 Z",
  },
  {
    key: "europe",
    label: "Europe",
    path: "M420 157 C446 124 496 113 533 130 C570 146 590 177 578 205 C565 236 520 238 486 229 C448 219 414 196 420 157 Z",
  },
  {
    key: "africa",
    label: "Africa",
    path: "M505 232 C547 209 608 229 630 281 C658 347 612 435 552 443 C499 450 464 393 470 330 C474 286 476 248 505 232 Z",
  },
  {
    key: "asia",
    label: "Asia",
    path: "M575 147 C642 92 777 93 855 143 C920 185 931 248 879 281 C828 314 759 289 707 275 C654 260 607 281 568 251 C532 223 535 180 575 147 Z",
  },
  {
    key: "oceania",
    label: "Oceania",
    path: "M746 382 C798 347 884 362 918 411 C897 457 819 470 769 443 C739 426 724 399 746 382 Z M900 450 C924 443 948 454 956 473 C936 489 905 487 891 468 C887 461 891 454 900 450 Z",
  },
];

export function TasteWorldMap({ openedCountries }: TasteWorldMapProps) {
  return (
    <div className="taste-world-map" role="img" aria-label={`Открыто стран на винной карте: ${openedCountries.length}`}>
      <svg viewBox="0 0 1000 520" aria-hidden="true" focusable="false">
        <rect className="taste-world-map__sea" x="0" y="0" width="1000" height="520" rx="30" />
        {continents.map((continent) => (
          <path key={continent.key} className="taste-world-map__continent" d={continent.path}>
            <title>{continent.label}</title>
          </path>
        ))}

        {openedCountries.map((country) => {
          return (
            <g key={country.code} className="taste-world-map__marker taste-world-map__marker--opened">
              <title>
                {`${country.label}: открыто, записей ${country.count}`}
              </title>
              <circle className="taste-world-map__marker-halo" cx={country.x * 10} cy={country.y * 5.2} r="18" />
              <circle cx={country.x * 10} cy={country.y * 5.2} r="8.5" />
            </g>
          );
        })}
      </svg>
      <div className="taste-world-map__legend" aria-label="Легенда карты">
        <span>
          <i className="taste-world-map__legend-dot taste-world-map__legend-dot--opened" /> Открыто
        </span>
        <span>
          <i className="taste-world-map__legend-dot" /> Континенты
        </span>
      </div>
    </div>
  );
}

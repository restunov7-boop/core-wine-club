import { wineCountries, type OpenedWineCountry } from "./data/wineCountries";

type TasteWorldMapProps = {
  openedCountries: OpenedWineCountry[];
};

export function TasteWorldMap({ openedCountries }: TasteWorldMapProps) {
  const openedCodes = new Set(openedCountries.map((item) => item.code));
  const openedByCode = new Map(openedCountries.map((item) => [item.code, item]));

  return (
    <div className="taste-world-map" role="img" aria-label={`Открыто стран на винной карте: ${openedCountries.length}`}>
      <svg viewBox="0 0 1000 520" aria-hidden="true" focusable="false">
        <rect className="taste-world-map__sea" x="0" y="0" width="1000" height="520" rx="28" />
        {/* TODO: replace stylized continent silhouettes with exact country polygons in map v2.1 if bundle size stays healthy. */}
        <path className="taste-world-map__land" d="M96 158 C122 95 214 82 281 121 C337 154 326 219 280 247 C218 285 140 258 103 216 C85 196 84 181 96 158 Z" />
        <path className="taste-world-map__land" d="M213 270 C258 246 319 259 343 305 C371 358 330 446 279 454 C229 462 207 395 223 349 C234 319 188 296 213 270 Z" />
        <path className="taste-world-map__land" d="M418 122 C493 72 607 92 681 145 C732 183 707 239 638 251 C570 262 514 237 465 255 C406 276 352 243 364 194 C370 169 389 140 418 122 Z" />
        <path className="taste-world-map__land" d="M493 253 C548 231 622 263 632 326 C643 394 588 461 528 443 C474 427 453 355 473 301 C477 288 483 266 493 253 Z" />
        <path className="taste-world-map__land" d="M691 248 C751 208 855 221 895 282 C929 333 891 389 832 381 C765 372 736 314 686 307 C651 302 655 273 691 248 Z" />
        <path className="taste-world-map__land" d="M746 378 C805 349 889 366 917 421 C890 469 804 473 758 438 C736 421 727 393 746 378 Z" />

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
              <circle cx={country.x * 10} cy={country.y * 5.2} r={opened ? 9 : 5.5} />
              {opened && <circle className="taste-world-map__marker-ring" cx={country.x * 10} cy={country.y * 5.2} r="15" />}
            </g>
          );
        })}
      </svg>
      <div className="taste-world-map__legend" aria-hidden="true">
        <span>
          <i className="taste-world-map__legend-dot taste-world-map__legend-dot--opened" /> Открыто
        </span>
        <span>
          <i className="taste-world-map__legend-dot" /> Пока нет
        </span>
      </div>
    </div>
  );
}

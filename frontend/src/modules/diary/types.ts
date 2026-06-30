export type WineColor = "red" | "white" | "rose" | "sparkling" | "orange" | "dessert" | "unknown";
export type Sweetness = "dry" | "semi_dry" | "semi_sweet" | "sweet" | "unknown";

export type TastingNoteListItem = {
  id: string;
  wine_name: string;
  producer: string | null;
  country: string | null;
  region: string | null;
  wine_color: WineColor | null;
  rating: number | null;
  tasted_at: string | null;
  would_buy_again: boolean | null;
  created_at: string;
};

export type TastingNoteDetail = TastingNoteListItem & {
  grape: string | null;
  vintage: number | null;
  sweetness: Sweetness | null;
  occasion: string | null;
  price_text: string | null;
  aroma_notes: string[] | null;
  taste_notes: string[] | null;
  pairing: string | null;
  personal_note: string | null;
  visibility: "private";
  updated_at: string;
};

export type TastingNotePayload = {
  wine_name: string;
  producer?: string | null;
  country?: string | null;
  region?: string | null;
  grape?: string | null;
  vintage?: number | null;
  wine_color?: WineColor | null;
  sweetness?: Sweetness | null;
  rating?: number | null;
  occasion?: string | null;
  price_text?: string | null;
  tasted_at?: string | null;
  aroma_notes?: string[] | null;
  taste_notes?: string[] | null;
  pairing?: string | null;
  personal_note?: string | null;
  would_buy_again?: boolean | null;
};

export type TastingNotesListResponse = {
  items: TastingNoteListItem[];
  total: number;
};

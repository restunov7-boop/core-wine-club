export type WineShelfStatus = "want_to_try" | "tried" | "liked" | "not_for_me" | "buy_again";

export type WineShelfItem = {
  id: string;
  diary_note_id: string | null;
  wine_name: string;
  country: string | null;
  region: string | null;
  grape: string | null;
  style: string | null;
  status: WineShelfStatus;
  personal_note: string | null;
  created_at: string;
  updated_at: string;
};

export type WineShelfItemPayload = {
  diary_note_id?: string | null;
  wine_name: string;
  country?: string | null;
  region?: string | null;
  grape?: string | null;
  style?: string | null;
  status: WineShelfStatus;
  personal_note?: string | null;
};

export type WineShelfItemUpdatePayload = Partial<WineShelfItemPayload>;

export type WineShelfListResponse = {
  items: WineShelfItem[];
  total: number;
};

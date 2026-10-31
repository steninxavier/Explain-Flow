export type NarrationRequest = {
  text: string;
  language: "en" | "de";
  voiceId: string;
};

export type CharacterAlignment = {
  characters: string[];
  characterStartTimesSeconds: number[];
  characterEndTimesSeconds: number[];
};

export type NarrationResult = {
  audio: Uint8Array;
  alignment: CharacterAlignment;
};

export interface NarrationProvider {
  generate(request: NarrationRequest): Promise<NarrationResult>;
}

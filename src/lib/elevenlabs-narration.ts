import { Buffer } from "node:buffer";
import type { CharacterAlignment, NarrationProvider, NarrationRequest, NarrationResult } from "./narration";

type ElevenLabsVoice = {
  voice_id: string;
  name: string;
  category?: string;
  verified_languages?: Array<{
    language?: string;
    model_id?: string;
  }>;
};

export class ElevenLabsNarrationProvider implements NarrationProvider {
  constructor(
    private readonly apiKey: string,
    private readonly modelId: string,
    private readonly speechSpeed = 0.9
  ) {}

  async selectStandardVoice(language: "en" | "de"): Promise<ElevenLabsVoice> {
    const response = await fetch("https://api.elevenlabs.io/v1/voices", {
      headers: { "xi-api-key": this.apiKey }
    });

    if (!response.ok) {
      throw new Error(`ElevenLabs voice lookup failed (${response.status}).`);
    }

    const payload = (await response.json()) as { voices?: ElevenLabsVoice[] };
    const voices = payload.voices ?? [];
    const standardVoices = voices.filter((voice) => voice.category === "premade");
    const voicesForLanguage = standardVoices.filter((voice) =>
      voice.verified_languages?.some(
        (verifiedLanguage) =>
          verifiedLanguage.language === language && verifiedLanguage.model_id === "eleven_multilingual_v2"
      )
    );
    const preferredNames = language === "de"
      ? ["lily", "daniel", "brian", "roger", "bill"]
      : ["rachel", "sarah", "alice", "matilda", "charlotte"];
    const candidates = voicesForLanguage.length > 0 ? voicesForLanguage : standardVoices;
    const selected =
      preferredNames
        .map((name) => candidates.find((voice) => voice.name.toLowerCase().startsWith(name)))
        .find((voice): voice is ElevenLabsVoice => Boolean(voice)) ??
      candidates[0];

    if (!selected) {
      throw new Error(`No standard ElevenLabs voice is available for ${language}.`);
    }

    return selected;
  }

  async generate(request: NarrationRequest): Promise<NarrationResult> {
    const response = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${encodeURIComponent(request.voiceId)}/with-timestamps?output_format=mp3_44100_128`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "xi-api-key": this.apiKey
        },
        body: JSON.stringify({
          text: request.text,
          model_id: this.modelId,
          voice_settings: {
            stability: 0.58,
            similarity_boost: 0.75,
            style: 0.18,
            speed: this.speechSpeed
          }
        })
      }
    );

    if (!response.ok) {
      throw new Error(`ElevenLabs narration request failed (${response.status}).`);
    }

    const payload = (await response.json()) as {
      audio_base64?: string;
      alignment?: {
        characters?: string[];
        character_start_times_seconds?: number[];
        character_end_times_seconds?: number[];
      } | null;
    };

    if (!payload.audio_base64 || !payload.alignment?.characters || !payload.alignment.character_start_times_seconds || !payload.alignment.character_end_times_seconds) {
      throw new Error("ElevenLabs narration response did not include usable audio timing data.");
    }

    const alignment: CharacterAlignment = {
      characters: payload.alignment.characters,
      characterStartTimesSeconds: payload.alignment.character_start_times_seconds,
      characterEndTimesSeconds: payload.alignment.character_end_times_seconds
    };

    if (
      alignment.characters.length === 0 ||
      alignment.characters.length !== alignment.characterStartTimesSeconds.length ||
      alignment.characters.length !== alignment.characterEndTimesSeconds.length
    ) {
      throw new Error("ElevenLabs narration response returned inconsistent timing data.");
    }

    return { audio: new Uint8Array(Buffer.from(payload.audio_base64, "base64")), alignment };
  }
}

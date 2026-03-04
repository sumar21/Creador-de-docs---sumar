const STOPWORDS = new Set([
  "a",
  "al",
  "algo",
  "algun",
  "alguna",
  "algunas",
  "alguno",
  "algunos",
  "ante",
  "bajo",
  "cabe",
  "cada",
  "como",
  "con",
  "contra",
  "cual",
  "cuales",
  "cuando",
  "de",
  "del",
  "desde",
  "donde",
  "dos",
  "el",
  "ella",
  "ellas",
  "ellos",
  "en",
  "entre",
  "era",
  "erais",
  "eran",
  "eras",
  "eres",
  "es",
  "esa",
  "esas",
  "ese",
  "eso",
  "esos",
  "esta",
  "estaba",
  "estado",
  "estais",
  "estamos",
  "estan",
  "estar",
  "estas",
  "este",
  "esto",
  "estos",
  "ha",
  "hace",
  "hacia",
  "han",
  "hasta",
  "hay",
  "la",
  "las",
  "le",
  "les",
  "lo",
  "los",
  "mas",
  "me",
  "mi",
  "mis",
  "mucho",
  "muchos",
  "muy",
  "no",
  "nos",
  "nosotros",
  "o",
  "os",
  "otra",
  "otro",
  "para",
  "pero",
  "por",
  "que",
  "se",
  "sea",
  "segun",
  "ser",
  "si",
  "sin",
  "sobre",
  "son",
  "su",
  "sus",
  "te",
  "tenia",
  "tengo",
  "ti",
  "tu",
  "tus",
  "un",
  "una",
  "uno",
  "unos",
  "y",
  "the",
  "and",
  "for",
  "from",
  "with",
  "that",
  "this",
  "was",
  "were",
  "are",
  "you",
  "your",
  "their",
  "them",
  "our",
  "out",
  "into",
  "about",
  "have",
  "has",
  "had",
]);

const MAX_SUMMARY_BULLETS = 6;
const MIN_SENTENCE_LENGTH = 32;
const MAX_SENTENCE_LENGTH = 260;

function normalizeWhitespace(text: string): string {
  return text
    .replace(/\r/g, "\n")
    .replace(/[^\S\n]+/g, " ")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function splitSentences(text: string): string[] {
  const normalized = text.replace(/\n+/g, " ").replace(/\s+/g, " ").trim();
  const chunks = normalized.match(/[^.!?]+[.!?]?/g) ?? [];

  return chunks.map((chunk) => chunk.trim()).filter((chunk) => chunk.length >= MIN_SENTENCE_LENGTH);
}

function normalizeToken(token: string): string {
  return token
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function tokenize(sentence: string): string[] {
  return (
    sentence
      .split(/[^A-Za-z0-9ÁÉÍÓÚáéíóúÜüÑñ]+/)
      .map((token) => normalizeToken(token))
      .filter((token) => token.length > 2 && !STOPWORDS.has(token))
  );
}

function clipSentence(sentence: string): string {
  if (sentence.length <= MAX_SENTENCE_LENGTH) {
    return sentence;
  }

  return `${sentence.slice(0, MAX_SENTENCE_LENGTH - 1).trimEnd()}…`;
}

export function summarizeExtractedText(input: string): string {
  const cleanText = normalizeWhitespace(input);

  if (!cleanText) {
    return "";
  }

  if (cleanText.length <= 480) {
    return cleanText;
  }

  const sentences = splitSentences(cleanText);
  if (sentences.length === 0) {
    return clipSentence(cleanText);
  }

  const frequencies = new Map<string, number>();

  for (const sentence of sentences) {
    for (const token of tokenize(sentence)) {
      frequencies.set(token, (frequencies.get(token) ?? 0) + 1);
    }
  }

  const ranked = sentences
    .map((sentence, index) => {
      const tokens = tokenize(sentence);
      const score = tokens.reduce((total, token) => total + (frequencies.get(token) ?? 0), 0);

      return {
        sentence,
        index,
        score: tokens.length > 0 ? score / tokens.length : 0,
      };
    })
    .sort((left, right) => right.score - left.score)
    .slice(0, MAX_SUMMARY_BULLETS)
    .sort((left, right) => left.index - right.index);

  const bullets = ranked.map((item) => `- ${clipSentence(item.sentence)}`);
  if (bullets.length === 0) {
    return clipSentence(cleanText);
  }

  return ["Resumen del documento importado:", "", "Puntos clave:", ...bullets].join("\n");
}

export function normalizeExtractedText(input: string): string {
  return normalizeWhitespace(input);
}

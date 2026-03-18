import { get_encoding, type Tiktoken } from "tiktoken";

/**
 * Token counting using tiktoken's cl100k_base encoding.
 *
 * cl100k_base is the encoding used by GPT-4, GPT-4o, and text-embedding-3.
 * It's not the exact tokenizer for Claude, Gemini, or other models — each
 * provider uses their own BPE vocabulary. However, modern BPE tokenizers
 * produce counts within ~15% of each other for English prose and code,
 * making cl100k_base a solid universal estimator.
 *
 * This is dramatically more accurate than a chars-per-token heuristic,
 * especially for structured content (JSON, YAML, markdown) where character
 * ratios vary wildly.
 */

let _encoder: Tiktoken | null = null;

function getEncoder(): Tiktoken {
  if (!_encoder) {
    _encoder = get_encoding("cl100k_base");
  }
  return _encoder;
}

/**
 * Free the WASM encoder when done. Call at process exit to avoid leaks.
 */
export function freeEncoder(): void {
  if (_encoder) {
    _encoder.free();
    _encoder = null;
  }
}

export function countTokens(text: string): number {
  return getEncoder().encode(text).length;
}

export function formatTokens(count: number): string {
  if (count >= 1000) {
    return `${(count / 1000).toFixed(1)}k`;
  }
  return String(count);
}

export function pct(part: number, total: number): string {
  if (total === 0) return "0.0%";
  return `${((part / total) * 100).toFixed(1)}%`;
}

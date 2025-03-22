/**
 * Approximates GPT token counting
 * Note: This is a simplified estimation. For production use,
 * consider using the tiktoken library for more accurate counting.
 */
export function countTokens(text: string): number {
  console.log("[tokenizer] countTokens called", {
    textLength: text?.length || 0,
  });
  if (!text) return 0;

  // Simple approximation: ~4 characters per token for English text
  // This is a very rough estimate; actual tokenization is more complex
  const tokens = Math.ceil(text.length / 4);
  console.log("[tokenizer] Calculated tokens:", tokens);
  return tokens;
}

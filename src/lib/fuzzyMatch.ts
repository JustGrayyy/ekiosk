export const VALID_SECTIONS = [
  "Prowess",
  "Fortitude",
  "Integrity",
  "Resilience",
  "Valor",
  "Harmony",
];

function levenshteinDistance(a: string, b: string): number {
  const m = a.length;
  const n = b.length;
  const dp: number[][] = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));

  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      dp[i][j] = Math.min(
        dp[i - 1][j] + 1,
        dp[i][j - 1] + 1,
        dp[i - 1][j - 1] + cost
      );
    }
  }

  return dp[m][n];
}

function similarity(a: string, b: string): number {
  const maxLen = Math.max(a.length, b.length);
  if (maxLen === 0) return 1;
  return 1 - levenshteinDistance(a, b) / maxLen;
}

export function findClosestSection(
  input: string,
  sections: string[] = VALID_SECTIONS
): { corrected: string; wasAutoCorrected: boolean } {
  if (!input.trim()) return { corrected: "", wasAutoCorrected: false };

  const normalized = input.trim().toLowerCase();

  // Exact match (case-insensitive)
  const exact = sections.find((s) => s.toLowerCase() === normalized);
  if (exact) return { corrected: exact, wasAutoCorrected: false };

  // Fuzzy match
  let bestMatch = "";
  let bestScore = 0;

  for (const section of sections) {
    const score = similarity(normalized, section.toLowerCase());
    if (score > bestScore) {
      bestScore = score;
      bestMatch = section;
    }
  }

  if (bestScore >= 0.8) {
    return { corrected: bestMatch, wasAutoCorrected: true };
  }

  return { corrected: "", wasAutoCorrected: false };
}

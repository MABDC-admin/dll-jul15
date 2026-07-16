export function getCurrentTerm(): string {
  const month = new Date().getMonth(); // 0-11
  
  // Philippine Academic Calendar (approximate mapping)
  // Jul (6), Aug (7), Sep (8), Oct (9) -> 1st Term
  // Nov (10), Dec (11), Jan (0) -> 2nd Term
  // Feb (1), Mar (2), Apr (3), May (4), Jun (5) -> 3rd Term
  
  if (month >= 6 && month <= 9) return '1st Term';
  if (month >= 10 || month === 0) return '2nd Term';
  return '3rd Term';
}

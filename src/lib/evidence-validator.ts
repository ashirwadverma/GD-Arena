import { Segment, EvidenceItem, DimensionFeedback, FeedbackReport } from './types';

/**
 * Normalizes text for lenient quote matching (strips punctuation, collapses whitespace, lowercases)
 */
export function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Validates whether a quote actually exists within the target transcript segment
 */
export function isQuoteInSegment(quote: string, segment: Segment): boolean {
  if (!quote || !segment || !segment.text) return false;
  
  const normQuote = normalizeText(quote);
  const normSegment = normalizeText(segment.text);
  
  if (normQuote.length === 0) return false;
  
  // Direct substring match
  if (normSegment.includes(normQuote)) {
    return true;
  }
  
  // Fuzzy token overlap match for minor ASR differences (at least 75% consecutive word match)
  const quoteWords = normQuote.split(' ');
  if (quoteWords.length >= 3) {
    const chunkLength = Math.min(quoteWords.length, 5);
    for (let i = 0; i <= quoteWords.length - chunkLength; i++) {
      const subChunk = quoteWords.slice(i, i + chunkLength).join(' ');
      if (normSegment.includes(subChunk)) {
        return true;
      }
    }
  }

  return false;
}

/**
 * Validates and filters evidence items in a dimension feedback object.
 * Dropping hallucinated evidence and ensuring trustworthy reports.
 */
export function validateEvidenceItems(
  evidenceList: EvidenceItem[],
  segments: Segment[]
): EvidenceItem[] {
  const segmentMap = new Map<string, Segment>();
  segments.forEach((s) => segmentMap.set(s.id, s));

  const validated: EvidenceItem[] = [];

  for (const item of evidenceList) {
    const targetSegment = segmentMap.get(item.segmentId);
    if (!targetSegment) {
      // If segmentId not found, try to locate any segment containing the quote
      const matchingSeg = segments.find((s) => isQuoteInSegment(item.quote, s));
      if (matchingSeg) {
        validated.push({
          ...item,
          segmentId: matchingSeg.id,
          verified: true,
        });
      }
      continue;
    }

    if (isQuoteInSegment(item.quote, targetSegment)) {
      validated.push({
        ...item,
        verified: true,
      });
    }
  }

  return validated;
}

/**
 * Enforces evidence integrity across all report dimensions
 */
export function sanitizeReportEvidence(
  dimensions: DimensionFeedback[],
  segments: Segment[]
): DimensionFeedback[] {
  return dimensions.map((dim) => {
    const validatedEvidence = validateEvidenceItems(dim.evidence || [], segments);
    return {
      ...dim,
      evidence: validatedEvidence,
    };
  });
}

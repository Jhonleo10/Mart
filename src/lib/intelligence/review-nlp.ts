import type { ReviewSummary } from "@/lib/intelligence/types";

const POSITIVE_WORDS = new Set([
  "great", "excellent", "love", "easy", "fast", "helpful", "reliable", "intuitive",
  "powerful", "flexible", "responsive", "smooth", "best", "amazing", "good", "solid",
  "efficient", "simple", "worth", "recommend", "perfect", "outstanding", "friendly",
]);

const NEGATIVE_WORDS = new Set([
  "bad", "slow", "difficult", "hard", "confusing", "expensive", "bug", "bugs", "poor",
  "lacking", "missing", "frustrating", "complicated", "issue", "issues", "problem",
  "problems", "disappointing", "limited", "crash", "unstable", "support", "delay",
]);

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((w) => w.length > 2);
}

function sentimentScore(comments: string[]): number {
  if (comments.length === 0) return 0;
  let pos = 0;
  let neg = 0;
  for (const comment of comments) {
    for (const word of tokenize(comment)) {
      if (POSITIVE_WORDS.has(word)) pos++;
      if (NEGATIVE_WORDS.has(word)) neg++;
    }
  }
  const total = pos + neg;
  if (total === 0) return 0.5;
  return Math.round((pos / total) * 100) / 100;
}

export function summarizeReviews(
  reviews: { rating: number; comment: string | null }[],
  productFeatures: string[] = [],
  suitableFor: string[] = [],
): ReviewSummary {
  const withComments = reviews.filter((r) => r.comment && r.comment.trim().length > 5);
  const comments = withComments.map((r) => r.comment!);
  const avgRating =
    reviews.length > 0 ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length : 0;

  const wordFreq = new Map<string, number>();
  const positiveSnippets: string[] = [];
  const negativeSnippets: string[] = [];

  for (const review of withComments) {
    const tokens = tokenize(review.comment!);
    let posHits = 0;
    let negHits = 0;
    for (const t of tokens) {
      wordFreq.set(t, (wordFreq.get(t) ?? 0) + 1);
      if (POSITIVE_WORDS.has(t)) posHits++;
      if (NEGATIVE_WORDS.has(t)) negHits++;
    }
    if (review.rating >= 4 && posHits > negHits)
      positiveSnippets.push(review.comment!.slice(0, 120));
    if (review.rating <= 3 && negHits > posHits)
      negativeSnippets.push(review.comment!.slice(0, 120));
  }

  const stopWords = new Set([
    "the", "and", "for", "with", "this", "that", "have", "has", "was", "are", "our", "very",
  ]);

  const mentionedFeatures = productFeatures
    .map((feature) => {
      const key = feature.toLowerCase();
      const count = comments.reduce((sum, c) => {
        return sum + (c.toLowerCase().includes(key) ? 1 : 0);
      }, 0);
      return { feature, count };
    })
    .filter((m) => m.count > 0)
    .sort((a, b) => b.count - a.count)
    .slice(0, 6);

  const topWords = [...wordFreq.entries()]
    .filter(([w]) => !stopWords.has(w) && w.length > 3)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([w]) => w);

  const sentiment = sentimentScore(comments);

  const thingsUsersLove =
    positiveSnippets.length > 0
      ? [...new Set(positiveSnippets)].slice(0, 4).map((s) => s.trim())
      : avgRating >= 4
        ? ["Users consistently rate this product highly", "Strong overall satisfaction scores"]
        : ["Positive themes include ease of use and reliability"];

  const commonComplaints =
    negativeSnippets.length > 0
      ? [...new Set(negativeSnippets)].slice(0, 3).map((s) => s.trim())
      : avgRating < 3.5 && reviews.length > 2
        ? ["Some users mention onboarding or support friction"]
        : [];

  const bestSuitedFor =
    suitableFor.length > 0
      ? suitableFor
      : topWords.length > 0
        ? [`Teams discussing ${topWords.slice(0, 3).join(", ")}`]
        : ["Businesses evaluating software in this category"];

  let overallVerdict = "Mixed feedback — request a demo to validate fit.";
  if (avgRating >= 4.2 && reviews.length >= 5)
    overallVerdict = "Strong consensus — widely recommended by buyers on the platform.";
  else if (avgRating >= 3.5)
    overallVerdict = "Generally positive with some areas to validate during a demo.";
  else if (reviews.length === 0)
    overallVerdict = "No reviews yet — be among the first to share feedback after your demo.";

  const overallSummary =
    reviews.length === 0
      ? "This product has not received written reviews yet. Ratings and demos can help you decide."
      : `Based on ${reviews.length} review${reviews.length !== 1 ? "s" : ""}, buyers mention ${topWords.slice(0, 4).join(", ") || "core product capabilities"} frequently. Sentiment is ${sentiment >= 0.6 ? "positive" : sentiment >= 0.45 ? "balanced" : "mixed"}.`;

  return {
    overallSummary,
    thingsUsersLove,
    commonComplaints,
    mentionedFeatures,
    bestSuitedFor,
    overallVerdict,
    sentimentScore: sentiment,
    reviewCount: reviews.length,
    avgRating: Math.round(avgRating * 10) / 10,
  };
}

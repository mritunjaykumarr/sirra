export interface OutboundParams {
  product?: string;
  market: string;
}

/**
 * Builds an outbound marketplace URL with standardized UTM parameters.
 * If the URL is '#' or empty, it returns the URL untouched.
 * Any existing query parameters and hash fragments are preserved.
 */
export function buildOutboundUrl(url: string, params: OutboundParams): string {
  if (!url || url.trim() === "" || url.trim() === "#") {
    return url || "#";
  }

  try {
    const parsed = new URL(url);
    parsed.searchParams.set("utm_source", "sirra-site");
    parsed.searchParams.set("utm_medium", "referral");
    parsed.searchParams.set("utm_campaign", params.product || "collection");
    parsed.searchParams.set("utm_content", params.market);
    return parsed.toString();
  } catch {
    // If URL parsing fails (e.g. malformed or relative non-hash), return original
    return url;
  }
}


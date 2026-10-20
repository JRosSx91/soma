/**
 * Presentation-only parser for catalog `referenceSource` strings.
 * Does not mutate seeds, invent bibliography, or mark sources as verified.
 */

export type CatalogReferenceStatus = "pending" | "unverified" | "insufficient";

export interface PresentedCatalogReference {
  /** Original catalog string, unchanged. */
  raw: string;
  /** Visible citation with the technical marker removed. */
  displayText: string;
  status: CatalogReferenceStatus;
  hadNeedsVerificationMarker: boolean;
}

const NEEDS_VERIFICATION = /\[\s*needs[\s-]*verification\s*\]/gi;

export function presentCatalogReference(raw: string | null | undefined): PresentedCatalogReference {
  const original = typeof raw === "string" ? raw : "";
  const hadNeedsVerificationMarker = hasNeedsVerificationMarker(original);
  const displayText = cleanDisplayText(original);

  if (hadNeedsVerificationMarker) {
    return {
      raw: original,
      displayText,
      status: "pending",
      hadNeedsVerificationMarker,
    };
  }

  if (!displayText) {
    return {
      raw: original,
      displayText: "",
      status: "insufficient",
      hadNeedsVerificationMarker,
    };
  }

  if (!hasBibliographicCue(displayText) && looksLikeUnsourcedPhysiology(displayText)) {
    return {
      raw: original,
      displayText,
      status: "insufficient",
      hadNeedsVerificationMarker,
    };
  }

  return {
    raw: original,
    displayText,
    status: "unverified",
    hadNeedsVerificationMarker,
  };
}

export function presentAnatomySource(source: {
  citation: string;
  href: string;
  verified: boolean;
}): {
  citation: string;
  href: string;
  useVerifiedLinkStyle: boolean;
} {
  return {
    citation: source.citation,
    href: source.href,
    useVerifiedLinkStyle: source.verified === true,
  };
}

function hasNeedsVerificationMarker(value: string): boolean {
  NEEDS_VERIFICATION.lastIndex = 0;
  return NEEDS_VERIFICATION.test(value);
}

function cleanDisplayText(value: string): string {
  NEEDS_VERIFICATION.lastIndex = 0;
  return value
    .replace(NEEDS_VERIFICATION, " ")
    .replace(/\s+/g, " ")
    .replace(/\s+([.,;:])/g, "$1")
    .trim();
}

function hasBibliographicCue(text: string): boolean {
  if (/\b(?:19|20)\d{2}\b/.test(text)) return true;
  if (/\bet al\./i.test(text)) return true;
  if (/\b[A-Z][A-Za-z'`-]+ &\s+[A-Z]/.test(text)) return true;
  if (
    /\b(AASLD|NIDA|NIDDK|ACG|ATS|AHA|ADA|AAO|AAD|IARC|NIAAA|USDHHS|ALF|NCBI|OpenStax|StatPearls|UpToDate)\b/i.test(
      text,
    )
  ) {
    return true;
  }
  if (
    /\b(guidelines?|statement|research report|monographs?|surgeon general|goodman)\b/i.test(text)
  ) {
    return true;
  }
  return false;
}

function looksLikeUnsourcedPhysiology(text: string): boolean {
  return /\b(resolves?|recover(?:s|y)?|improves?|regenerat(?:e|es|ion)|normalizes?|reverses?|irreversible|inflammation|mucos|function|effects?|motility|irritation)\b/i.test(
    text,
  );
}

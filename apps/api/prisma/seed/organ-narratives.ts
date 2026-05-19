import type { PrismaClient } from "@prisma/client";

/**
 * Seeds organ-level narrative profiles describing tissue and cellular
 * recovery processes for non-neural organs.
 *
 * Unlike neurotransmitter symptoms, these descriptions focus on
 * observable physiological events (cilia function, hepatocyte
 * regeneration, mucosal healing) rather than subjective experience.
 *
 * References:
 *   - U.S. Surgeon General. The Health Consequences of Smoking,
 *     2014 & 2020 reports.
 *   - American Liver Foundation; AASLD guidelines on alcohol-related
 *     liver disease, 2019.
 *   - NIDDK / NIH Pancreatitis publications.
 *   - NIDA Research Reports (substance-specific).
 *   - Reviews: Goodman & Gilman's 14th ed.; UpToDate clinical topics.
 */

type Phase = "during_use" | "acute_withdrawal" | "post_acute" | "normalizing";

interface PhaseDefinition {
  phase: Phase;
  startDay: number;
  endDay: number | null;
}

interface NarrativeDefinition {
  organId: string;
  substanceId: string;
  confidenceLevel: "high" | "medium" | "low";
  referenceSource: string;
}

const PHASE_RANGES: Record<Phase, { startDay: number; endDay: number | null }> =
  {
    during_use: { startDay: 0, endDay: 0 },
    acute_withdrawal: { startDay: 1, endDay: 7 },
    post_acute: { startDay: 8, endDay: 56 },
    normalizing: { startDay: 57, endDay: null },
  };

const STANDARD_PHASES: PhaseDefinition[] = [
  { phase: "during_use", ...PHASE_RANGES.during_use },
  { phase: "acute_withdrawal", ...PHASE_RANGES.acute_withdrawal },
  { phase: "post_acute", ...PHASE_RANGES.post_acute },
  { phase: "normalizing", ...PHASE_RANGES.normalizing },
];

/**
 * The narrative profiles. Each (organ, substance) combination gets
 * the four standard phases. The narrativeKey is computed as
 * `<organId>.<substanceId>.<phase>`.
 */
const NARRATIVES: NarrativeDefinition[] = [
  // ----- Liver -----
  {
    organId: "liver",
    substanceId: "alcohol",
    confidenceLevel: "high",
    referenceSource: "AASLD 2019; ALF clinical reviews",
  },

  // ----- Kidneys -----
  {
    organId: "kidneys",
    substanceId: "cocaine",
    confidenceLevel: "medium",
    referenceSource:
      "NIDA Cocaine Research Report; UpToDate renal complications",
  },
  {
    organId: "kidneys",
    substanceId: "alcohol",
    confidenceLevel: "medium",
    referenceSource: "AASLD 2019; UpToDate alcohol and renal function",
  },

  // ----- Pancreas -----
  {
    organId: "pancreas",
    substanceId: "alcohol",
    confidenceLevel: "high",
    referenceSource: "NIDDK; ACG guidelines on alcoholic pancreatitis",
  },

  // ----- Stomach -----
  {
    organId: "stomach",
    substanceId: "alcohol",
    confidenceLevel: "high",
    referenceSource: "ACG guidelines on gastritis; Goodman & Gilman 14th ed.",
  },
  {
    organId: "stomach",
    substanceId: "nicotine",
    confidenceLevel: "medium",
    referenceSource:
      "U.S. Surgeon General 2014; clinical reviews on tobacco GI effects",
  },

  // ----- Lungs -----
  {
    organId: "lungs",
    substanceId: "nicotine",
    confidenceLevel: "high",
    referenceSource: "U.S. Surgeon General 2020; ATS guidelines",
  },
  {
    organId: "lungs",
    substanceId: "cannabis",
    confidenceLevel: "medium",
    referenceSource: "NIDA Marijuana Research Report; ATS clinical reviews",
  },

  // ----- Bronchi -----
  {
    organId: "bronchi",
    substanceId: "nicotine",
    confidenceLevel: "high",
    referenceSource: "U.S. Surgeon General 2020; ATS guidelines",
  },
  {
    organId: "bronchi",
    substanceId: "cannabis",
    confidenceLevel: "medium",
    referenceSource: "NIDA Marijuana Research Report",
  },
  // Caffeine narratives
  {
    organId: "heart",
    substanceId: "caffeine",
    confidenceLevel: "medium",
    referenceSource: "AHA 2019 statement; Cano-Marquina et al. 2013",
  },
  {
    organId: "stomach",
    substanceId: "caffeine",
    confidenceLevel: "medium",
    referenceSource: "ACG 2020; clinical reviews on caffeine and gastric acid",
  },
  // ----- Intestines -----
  {
    organId: "intestines",
    substanceId: "alcohol",
    confidenceLevel: "medium",
    referenceSource: "Bishehsari et al. (2017); NIAAA reviews on gut-liver axis",
  },
  {
    organId: "intestines",
    substanceId: "cannabis",
    confidenceLevel: "medium",
    referenceSource: "NIDA Marijuana Research Report; CB1 and GI motility reviews",
  },
  {
    organId: "intestines",
    substanceId: "caffeine",
    confidenceLevel: "medium",
    referenceSource: "ACG 2020; clinical reviews on caffeine and colonic motility",
  },

  // ----- Spleen -----
  {
    organId: "spleen",
    substanceId: "alcohol",
    confidenceLevel: "low",
    referenceSource: "AASLD 2019; reviews on portal hypertension and splenomegaly",
  },

  // ----- Oral mucosa -----
  {
    organId: "oral-mucosa",
    substanceId: "alcohol",
    confidenceLevel: "medium",
    referenceSource: "IARC Monographs; ADA clinical reviews on alcohol and oral health",
  },
  {
    organId: "oral-mucosa",
    substanceId: "nicotine",
    confidenceLevel: "high",
    referenceSource: "U.S. Surgeon General 2014; ADA tobacco cessation guidelines",
  },
  {
    organId: "oral-mucosa",
    substanceId: "cannabis",
    confidenceLevel: "medium",
    referenceSource: "NIDA Marijuana Research Report; ADA clinical reviews",
  },

  // ----- Nasal mucosa -----
  {
    organId: "nasal-mucosa",
    substanceId: "cocaine",
    confidenceLevel: "high",
    referenceSource: "NIDA Cocaine Research Report; ENT clinical reviews on intranasal cocaine damage",
  },
  {
    organId: "nasal-mucosa",
    substanceId: "nicotine",
    confidenceLevel: "medium",
    referenceSource: "U.S. Surgeon General 2014; ENT reviews on tobacco nasal effects",
  },
  {
    organId: "nasal-mucosa",
    substanceId: "cannabis",
    confidenceLevel: "low",
    referenceSource: "NIDA Marijuana Research Report; limited literature on nasal effects",
  },

  // ----- Teeth -----
  {
    organId: "teeth",
    substanceId: "alcohol",
    confidenceLevel: "low",
    referenceSource: "ADA reviews on alcohol and dental erosion; Goodman & Gilman 14th ed.",
  },
  {
    organId: "teeth",
    substanceId: "nicotine",
    confidenceLevel: "medium",
    referenceSource: "U.S. Surgeon General 2014; ADA tobacco and periodontal disease reviews",
  },
  {
    organId: "teeth",
    substanceId: "cannabis",
    confidenceLevel: "low",
    referenceSource: "ADA reviews on cannabis and oral health; limited literature",
  },
  {
    organId: "teeth",
    substanceId: "cocaine",
    confidenceLevel: "medium",
    referenceSource: "NIDA Cocaine Research Report; dental erosion from cocaine reviews",
  },

  // ----- Eyes -----
  {
    organId: "eyes",
    substanceId: "alcohol",
    confidenceLevel: "medium",
    referenceSource: "Clinical reviews on alcohol and ocular health; AAO guidelines",
  },
  {
    organId: "eyes",
    substanceId: "nicotine",
    confidenceLevel: "medium",
    referenceSource: "U.S. Surgeon General 2014; AAO reviews on smoking and macular degeneration",
  },
  {
    organId: "eyes",
    substanceId: "cannabis",
    confidenceLevel: "high",
    referenceSource: "Flach (2002); clinical reviews on cannabis and intraocular pressure",
  },
  {
    organId: "eyes",
    substanceId: "cocaine",
    confidenceLevel: "medium",
    referenceSource: "NIDA Cocaine Research Report; AAO reviews on cocaine ocular effects",
  },
  {
    organId: "skin",
    substanceId: "alcohol",
    confidenceLevel: "medium",
    referenceSource: "Clinical reviews on alcohol and dermatology; AAD guidelines",
  },
  {
    organId: "skin",
    substanceId: "cocaine",
    confidenceLevel: "medium",
    referenceSource: "NIDA Cocaine Research Report; dermatology reviews on stimulant skin effects",
  },
];

function buildNarrativeKey(
  organId: string,
  substanceId: string,
  phase: Phase,
): string {
  return `${organId}.${substanceId}.${phase}`;
}

export async function seedOrganNarratives(prisma: PrismaClient): Promise<void> {
  // Idempotent: wipe and recreate. These are static reference data.
  await prisma.organNarrativePhase.deleteMany();
  await prisma.organNarrativeProfile.deleteMany();

  for (const narrative of NARRATIVES) {
    await prisma.organNarrativeProfile.create({
      data: {
        organId: narrative.organId,
        substanceId: narrative.substanceId,
        confidenceLevel: narrative.confidenceLevel,
        referenceSource: narrative.referenceSource,
        phases: {
          create: STANDARD_PHASES.map((phaseDef) => ({
            phase: phaseDef.phase,
            startDay: phaseDef.startDay,
            endDay: phaseDef.endDay,
            narrativeKey: buildNarrativeKey(
              narrative.organId,
              narrative.substanceId,
              phaseDef.phase,
            ),
          })),
        },
      },
    });
  }
}

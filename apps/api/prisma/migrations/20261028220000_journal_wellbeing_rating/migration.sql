-- JRN-01E: optional 0–10 wellbeing self-rating. Existing rows stay NULL.

ALTER TABLE "JournalEntry" ADD COLUMN "wellbeingRating" INTEGER;

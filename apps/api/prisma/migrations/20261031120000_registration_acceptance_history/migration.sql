-- Append-only special-category events: drop unique (userId, purpose) so a later
-- grant or withdrawal can be inserted without overwriting earlier evidence.
DROP INDEX "RegistrationAcceptance_userId_purpose_key";

CREATE INDEX "RegistrationAcceptance_userId_purpose_acceptedAt_idx" ON "RegistrationAcceptance"("userId", "purpose", "acceptedAt");

import "reflect-metadata";
import assert from "node:assert/strict";
import { test } from "node:test";
import { plainToInstance } from "class-transformer";
import { validateSync } from "class-validator";
import { CreateFeedbackDto } from "./create-feedback.dto.js";

const BODY = "The save button does nothing after I write a note.";

function validate(plain: Record<string, unknown>) {
  const dto = plainToInstance(CreateFeedbackDto, plain);
  return { dto, errors: validateSync(dto) };
}

test("CreateFeedbackDto accepts a trimmed bug report", () => {
  const { dto, errors } = validate({
    category: "bug",
    title: "  Save fails  ",
    body: `  ${BODY}  `,
  });
  assert.equal(errors.length, 0);
  assert.equal(dto.title, "Save fails");
  assert.equal(dto.body, BODY);
});

test("CreateFeedbackDto rejects unknown categories and extra fields via whitelist", () => {
  const { errors } = validate({
    category: "feature",
    title: "Save fails",
    body: BODY,
  });
  assert.ok(errors.length > 0);
});

test("CreateFeedbackDto rejects short title and short body after trim", () => {
  assert.ok(
    validate({ category: "bug", title: "  Hi  ", body: BODY }).errors.length >
      0,
  );
  assert.ok(
    validate({
      category: "suggestion",
      title: "Dark mode",
      body: "  too short  ",
    }).errors.length > 0,
  );
});

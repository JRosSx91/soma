import { isLegalNoticePublished, LEGAL_NOTICE_STATUS } from "@soma/shared-types";

/** Placeholders shared by ES and EN legal catalogs (values come from env). */
export const LEGAL_CONTROLLER_MARKERS = {
  name: "[NOMBRE DEL RESPONSABLE]",
  address: "[DOMICILIO A EFECTOS LEGALES]",
  email: "[CORREO DE CONTACTO]",
  taxIdEs: "[NIF / documento de identificación, si se publica]",
  taxIdEn: "[NIF / identity document, if published]",
  phoneEs: "[TELÉFONO, si se quiere publicar]",
  phoneEn: "[TELÉFONO, if published]",
  dpoEs: "[DELEGADO DE PROTECCIÓN DE DATOS, si aplica; si no, “no designado”]",
  dpoEn: "[DELEGADO DE PROTECCIÓN DE DATOS, if applicable; otherwise “not appointed”]",
  pendingEs: "[PENDIENTE DE COMPLETAR]",
  pendingEn: "[TO BE COMPLETED]",
} as const;

const OPTIONAL_CLAUSES: ReadonlyArray<{
  markers: readonly string[];
  labeled: readonly string[];
  value: keyof Pick<LegalControllerFields, "taxId" | "phone" | "dpo">;
}> = [
  {
    value: "taxId",
    markers: [LEGAL_CONTROLLER_MARKERS.taxIdEs, LEGAL_CONTROLLER_MARKERS.taxIdEn],
    labeled: [
      ` ${LEGAL_CONTROLLER_MARKERS.taxIdEs}`,
      ` ${LEGAL_CONTROLLER_MARKERS.taxIdEn}`,
    ],
  },
  {
    value: "phone",
    markers: [LEGAL_CONTROLLER_MARKERS.phoneEs, LEGAL_CONTROLLER_MARKERS.phoneEn],
    labeled: [
      ` Teléfono: ${LEGAL_CONTROLLER_MARKERS.phoneEs}.`,
      ` Telephone: ${LEGAL_CONTROLLER_MARKERS.phoneEn}.`,
    ],
  },
  {
    value: "dpo",
    markers: [LEGAL_CONTROLLER_MARKERS.dpoEs, LEGAL_CONTROLLER_MARKERS.dpoEn],
    labeled: [
      ` Delegado de protección de datos: ${LEGAL_CONTROLLER_MARKERS.dpoEs}.`,
      ` Data protection officer: ${LEGAL_CONTROLLER_MARKERS.dpoEn}.`,
    ],
  },
];

export type LegalControllerFields = {
  name: string;
  address: string;
  email: string;
  taxId: string;
  phone: string;
  dpo: string;
};

const EMPTY_CONTROLLER: LegalControllerFields = {
  name: "",
  address: "",
  email: "",
  taxId: "",
  phone: "",
  dpo: "",
};

function envText(key: string): string {
  const meta = import.meta as ImportMeta & { env?: Record<string, unknown> };
  const value = meta.env?.[key];
  return typeof value === "string" ? value.trim() : "";
}

export function readLegalControllerFromEnv(): LegalControllerFields {
  return {
    name: envText("VITE_LEGAL_CONTROLLER_NAME"),
    address: envText("VITE_LEGAL_CONTROLLER_ADDRESS"),
    email: envText("VITE_LEGAL_CONTROLLER_EMAIL"),
    taxId: envText("VITE_LEGAL_CONTROLLER_TAX_ID"),
    phone: envText("VITE_LEGAL_CONTROLLER_PHONE"),
    dpo: envText("VITE_LEGAL_CONTROLLER_DPO"),
  };
}

export function hasRequiredLegalController(
  fields: LegalControllerFields,
): boolean {
  return fields.name.length > 0 && fields.address.length > 0 && fields.email.length > 0;
}

/**
 * Documents are publishable only when the legal status is published *and*
 * required controller identity is present. Missing env must not be treated
 * as a published notice (hiding markers is not enough).
 */
export function areLegalDocumentsPublishable(
  status: string = LEGAL_NOTICE_STATUS,
  fields: LegalControllerFields = readLegalControllerFromEnv(),
): boolean {
  return isLegalNoticePublished(status) && hasRequiredLegalController(fields);
}

function replaceAll(haystack: string, needle: string, replacement: string): string {
  return haystack.split(needle).join(replacement);
}

function tidyCopy(text: string): string {
  return text
    .replace(/[ \t]{2,}/g, " ")
    .replace(/ +\./g, ".")
    .replace(/ +,/g, ",")
    .replace(/\n{3,}/g, "\n\n")
    .trimEnd();
}

export function applyLegalControllerCopy(
  text: string,
  fields: LegalControllerFields = EMPTY_CONTROLLER,
  options: { publishable?: boolean } = {},
): string {
  let out = text;
  const publishable = options.publishable === true;

  if (fields.name) {
    out = replaceAll(out, LEGAL_CONTROLLER_MARKERS.name, fields.name);
  }
  if (fields.address) {
    out = replaceAll(out, LEGAL_CONTROLLER_MARKERS.address, fields.address);
  }
  if (fields.email) {
    out = replaceAll(out, LEGAL_CONTROLLER_MARKERS.email, fields.email);
  }

  for (const clause of OPTIONAL_CLAUSES) {
    const value = fields[clause.value];
    if (value) {
      for (const marker of clause.markers) {
        out = replaceAll(out, marker, value);
      }
      continue;
    }
    for (const labeled of clause.labeled) {
      out = replaceAll(out, labeled, "");
    }
    for (const marker of clause.markers) {
      out = replaceAll(out, marker, "");
    }
  }

  if (publishable) {
    const leftover = [
      LEGAL_CONTROLLER_MARKERS.name,
      LEGAL_CONTROLLER_MARKERS.address,
      LEGAL_CONTROLLER_MARKERS.email,
      LEGAL_CONTROLLER_MARKERS.taxIdEs,
      LEGAL_CONTROLLER_MARKERS.taxIdEn,
      LEGAL_CONTROLLER_MARKERS.phoneEs,
      LEGAL_CONTROLLER_MARKERS.phoneEn,
      LEGAL_CONTROLLER_MARKERS.dpoEs,
      LEGAL_CONTROLLER_MARKERS.dpoEn,
      LEGAL_CONTROLLER_MARKERS.pendingEs,
      LEGAL_CONTROLLER_MARKERS.pendingEn,
    ];
    for (const marker of leftover) {
      out = replaceAll(out, marker, "");
    }
  }

  return tidyCopy(out);
}

/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL?: string;
  readonly VITE_LEGAL_CONTROLLER_NAME?: string;
  readonly VITE_LEGAL_CONTROLLER_ADDRESS?: string;
  readonly VITE_LEGAL_CONTROLLER_EMAIL?: string;
  readonly VITE_LEGAL_CONTROLLER_TAX_ID?: string;
  readonly VITE_LEGAL_CONTROLLER_PHONE?: string;
  readonly VITE_LEGAL_CONTROLLER_DPO?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

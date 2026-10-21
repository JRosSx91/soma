import { Injectable, OnModuleInit } from "@nestjs/common";
import { resolveRegistrationMode } from "./registration-mode.js";

/** Fail fast on invalid/missing production registration mode. */
@Injectable()
export class RegistrationModeBootstrap implements OnModuleInit {
  onModuleInit(): void {
    resolveRegistrationMode();
  }
}

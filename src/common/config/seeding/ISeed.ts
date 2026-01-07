import { Modules } from "@root/src/modules/Modules";

export interface ISeed {
  moduleName: Modules;
  key: string;
  value: unknown;
}

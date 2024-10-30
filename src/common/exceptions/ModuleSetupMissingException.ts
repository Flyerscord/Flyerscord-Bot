export default class ModuleSetupMissingException implements Error {
  name: string = "ModuleSetupMissing";
  message: string = "Setup method implementation is missing!";
}

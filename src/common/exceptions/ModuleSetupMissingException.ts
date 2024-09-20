export default class ModuleSetupMissingException implements Error {
    public name: string = "ModuleSetupMissing";
    public message: string = "Setup method implementation is missing!";

}
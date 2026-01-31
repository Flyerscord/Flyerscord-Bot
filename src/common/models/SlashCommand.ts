import ClientManager from "@common/managers/ClientManager";
import {
  Attachment,
  AutocompleteFocusedOption,
  AutocompleteInteraction,
  ChatInputCommandInteraction,
  Interaction,
  InteractionContextType,
  PermissionsBitField,
  SlashCommandBuilder,
  User,
} from "discord.js";
import Stumper from "stumper";
import Command, { ICommandConfig } from "./Command";

type RoleParamType = NonNullable<ReturnType<ChatInputCommandInteraction["options"]["getRole"]>>;
type ChannelParamType = NonNullable<ReturnType<ChatInputCommandInteraction["options"]["getChannel"]>>;
type MemberParamType = NonNullable<ReturnType<ChatInputCommandInteraction["options"]["getMember"]>>;

export default abstract class SlashCommand extends Command {
  readonly data: SlashCommandBuilder;

  readonly description: string;

  constructor(name: string, description: string, options: ICommandConfig = {}) {
    super(name.toLowerCase(), options.ephemeral ?? false, options.deferReply ?? true);
    this.description = description;

    this.data = new SlashCommandBuilder().setName(this.name).setDescription(this.description).setContexts([InteractionContextType.Guild]);
  }

  async run(interaction: ChatInputCommandInteraction): Promise<void> {
    Stumper.info(`Running command: ${this.name} User: ${interaction.user.id}`, "common:SlashCommand:run");
    await this.setupReplies(interaction);
    await this.execute(interaction);
  }

  protected abstract execute(interaction: ChatInputCommandInteraction): Promise<void>;

  /**
   * Returns the parameter value or the default value if the parameter is null.
   * @param val - The value to return, or null if the parameter was not provided
   * @param defaultValue - The default value to return if val is null
   * @returns The value if not null, otherwise the default value
   */
  protected returnParamValue<T>(paramName: string, val: T | null, defaultValue?: T): T {
    // If the value is null, this mean that that default value was provided\
    // If the default value was not provided, this mean that the value is not null
    if (val === null) {
      if (defaultValue === undefined) {
        Stumper.error(
          `Implementation error: default value is undefined for not required parameter ${paramName}`,
          "common:SlashCommand:returnParamValue",
        );
        throw new Error(`Implementation error: default value is undefined for not required parameter ${paramName}`);
      }
      return defaultValue!;
    }
    return val;
  }

  /**
   * Gets a string parameter value from the interaction.
   * @param interaction - The command interaction
   * @param paramName - The name of the parameter to retrieve
   * @param defaultValue - Optional default value if the parameter is not provided
   * @returns The string value of the parameter
   */
  protected getStringParamValue(interaction: ChatInputCommandInteraction, paramName: string, defaultValue?: string): string {
    const val = interaction.options.getString(paramName, defaultValue == undefined);
    return this.returnParamValue(paramName, val, defaultValue);
  }

  /**
   * Gets a role parameter value from the interaction.
   * @param interaction - The command interaction
   * @param paramName - The name of the parameter to retrieve
   * @param defaultValue - Optional default value if the parameter is not provided
   * @returns The role value of the parameter
   */
  protected getRoleParamValue(interaction: ChatInputCommandInteraction, paramName: string, defaultValue?: RoleParamType): RoleParamType {
    const val = interaction.options.getRole(paramName, defaultValue == undefined);
    return this.returnParamValue(paramName, val, defaultValue);
  }

  /**
   * Gets a boolean parameter value from the interaction.
   * @param interaction - The command interaction
   * @param paramName - The name of the parameter to retrieve
   * @param defaultValue - Optional default value if the parameter is not provided
   * @returns The boolean value of the parameter
   */
  protected getBooleanParamValue(interaction: ChatInputCommandInteraction, paramName: string, defaultValue?: boolean): boolean {
    const val = interaction.options.getBoolean(paramName, defaultValue == undefined);
    return this.returnParamValue(paramName, val, defaultValue);
  }

  /**
   * Gets a channel parameter value from the interaction.
   * @param interaction - The command interaction
   * @param paramName - The name of the parameter to retrieve
   * @param defaultValue - Optional default value if the parameter is not provided
   * @returns The channel value of the parameter
   */
  protected getChannelParamValue(interaction: ChatInputCommandInteraction, paramName: string, defaultValue?: ChannelParamType): ChannelParamType {
    const val = interaction.options.getChannel(paramName, defaultValue == undefined);
    return this.returnParamValue(paramName, val, defaultValue);
  }

  /**
   * Gets an attachment parameter value from the interaction.
   * @param interaction - The command interaction
   * @param paramName - The name of the parameter to retrieve
   * @param defaultValue - Optional default value if the parameter is not provided
   * @returns The attachment value of the parameter
   */
  protected getAttachmentParamValue(interaction: ChatInputCommandInteraction, paramName: string, defaultValue?: Attachment): Attachment {
    const val = interaction.options.getAttachment(paramName, defaultValue == undefined);
    return this.returnParamValue(paramName, val, defaultValue);
  }

  /**
   * Gets an integer parameter value from the interaction.
   * @param interaction - The command interaction
   * @param paramName - The name of the parameter to retrieve
   * @param defaultValue - Optional default value if the parameter is not provided
   * @returns The integer value of the parameter
   */
  protected getIntegerParamValue(interaction: ChatInputCommandInteraction, paramName: string, defaultValue?: number): number {
    const val = interaction.options.getInteger(paramName, defaultValue == undefined);
    return this.returnParamValue(paramName, val, defaultValue);
  }

  /**
   * Gets a member parameter value from the interaction.
   * @param interaction - The command interaction
   * @param paramName - The name of the parameter to retrieve
   * @param defaultValue - Optional default value if the parameter is not provided
   * @returns The member value of the parameter, or undefined if not found
   */
  protected getMemberParamValue(
    interaction: ChatInputCommandInteraction,
    paramName: string,
    defaultValue?: MemberParamType,
  ): MemberParamType | undefined {
    const val = interaction.options.getMember(paramName);
    return this.returnParamValue(paramName, val, defaultValue);
  }

  /**
   * Gets a user parameter value from the interaction.
   * @param interaction - The command interaction
   * @param paramName - The name of the parameter to retrieve
   * @param defaultValue - Optional default value if the parameter is not provided
   * @returns The user value of the parameter
   */
  protected getUserParamValue(interaction: ChatInputCommandInteraction, paramName: string, defaultValue?: User): User {
    const val = interaction.options.getUser(paramName, defaultValue == undefined);
    return this.returnParamValue(paramName, val, defaultValue);
  }

  /**
   * Checks if the interaction is for a specific subcommand.
   * @param interaction - The command interaction
   * @param subCommandName - The name of the subcommand to check for
   * @returns True if the interaction is for the specified subcommand
   */
  protected isSubCommand(interaction: ChatInputCommandInteraction, subCommandName: string): boolean {
    return interaction.options.getSubcommand() == subCommandName;
  }

  /**
   * Checks if the interaction is for a specific subcommand group.
   * @param interaction - The command interaction
   * @param subCommandGroupName - The name of the subcommand group to check for
   * @returns True if the interaction is for the specified subcommand group
   */
  protected isSubCommandGroup(interaction: ChatInputCommandInteraction, subCommandGroupName: string): boolean {
    return interaction.options.getSubcommandGroup() == subCommandGroupName;
  }

  /**
   * Returns a JSON string representation of the command.
   * @returns JSON string of this command
   */
  toString(): string {
    return JSON.stringify(this);
  }
}

export abstract class AutocompleteSlashCommand extends SlashCommand {
  constructor(name: string, description: string, options: ICommandConfig = {}) {
    super(name, description, options);

    this.registerAutoCompleteListener();
  }

  /**
   * Gets the list of autocomplete options for the current interaction.
   * @param interaction - The autocomplete interaction
   * @returns A complete list of all possible options for the autocomplete. The list will be filtered automatically. Undefined if autocomplete is not compatible with the command.
   */
  protected abstract getAutoCompleteOptions(interaction: AutocompleteInteraction): Promise<string[] | undefined>;

  private registerAutoCompleteListener(): void {
    const client = ClientManager.getInstance().client;
    client.on("interactionCreate", async (interaction: Interaction) => {
      if (!interaction.isAutocomplete()) return;
      interaction as AutocompleteInteraction;

      if (interaction.commandName != this.name) return;

      let options = await this.getAutoCompleteOptions(interaction);
      if (!options) return;

      options = this.filterList(options, this.getFocusedOption(interaction).value);

      await this.sendAutoCompleteOptions(interaction, options);
    });
  }

  private async sendAutoCompleteOptions(interaction: AutocompleteInteraction, options: string[]): Promise<void> {
    if (options.length > 25) {
      options = options.slice(0, 24);
    }
    await interaction.respond(options.map((option) => ({ name: option, value: option })));
  }

  private filterList(list: string[], value: string): string[] {
    return list.filter((ele) => ele.toLowerCase().startsWith(value.toLowerCase()));
  }

  /**
   * Gets the name of the currently focused autocomplete option.
   * @param interaction - The autocomplete interaction
   * @returns The name of the focused option
   */
  protected getFocusedOptionName(interaction: AutocompleteInteraction): string {
    return interaction.options.getFocused(true).name;
  }

  /**
   * Gets the currently focused autocomplete option with its value.
   * @param interaction - The autocomplete interaction
   * @returns The focused option object containing name and value
   */
  protected getFocusedOption(interaction: AutocompleteInteraction): AutocompleteFocusedOption {
    return interaction.options.getFocused(true);
  }

  /**
   * Gets a string option value from the autocomplete interaction.
   * @param interaction - The autocomplete interaction
   * @param paramName - The name of the parameter to retrieve
   * @param defaultValue - Optional default value if the parameter is not provided
   * @returns The string value of the option
   */
  protected getStringOptionValue(interaction: AutocompleteInteraction, paramName: string, defaultValue?: string): string {
    const val = interaction.options.getString(paramName, defaultValue == undefined);
    return this.returnParamValue(paramName, val, defaultValue);
  }

  /**
   * Gets a boolean option value from the autocomplete interaction.
   * @param interaction - The autocomplete interaction
   * @param paramName - The name of the parameter to retrieve
   * @param defaultValue - Optional default value if the parameter is not provided
   * @returns The boolean value of the option
   */
  protected getBooleanOptionValue(interaction: AutocompleteInteraction, paramName: string, defaultValue?: boolean): boolean {
    const val = interaction.options.getBoolean(paramName, defaultValue == undefined);
    return this.returnParamValue(paramName, val, defaultValue);
  }

  /**
   * Gets an integer option value from the autocomplete interaction.
   * @param interaction - The autocomplete interaction
   * @param paramName - The name of the parameter to retrieve
   * @param defaultValue - Optional default value if the parameter is not provided
   * @returns The integer value of the option
   */
  protected getIntegerOptionValue(interaction: AutocompleteInteraction, paramName: string, defaultValue?: number): number {
    const val = interaction.options.getInteger(paramName, defaultValue == undefined);
    return this.returnParamValue(paramName, val, defaultValue);
  }

  /**
   * Gets the subcommand from the autocomplete interaction if one exists.
   * @param interaction - The autocomplete interaction
   * @returns The subcommand name, or null if no subcommand is present
   */
  protected getSubCommand(interaction: AutocompleteInteraction): string | null {
    return interaction.options.getSubcommand(false);
  }
}

export abstract class AdminSlashCommand extends SlashCommand {
  constructor(name: string, description: string, options: ICommandConfig = {}) {
    super(name, description, options);

    this.data.setDefaultMemberPermissions(PermissionsBitField.Flags.Administrator);
  }
}

export abstract class AdminAutocompleteSlashCommand extends AutocompleteSlashCommand {
  constructor(name: string, description: string, options: ICommandConfig = {}) {
    super(name, description, options);

    this.data.setDefaultMemberPermissions(PermissionsBitField.Flags.Administrator);
  }
}

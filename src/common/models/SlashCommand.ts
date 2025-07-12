/* eslint-disable @typescript-eslint/no-explicit-any */
import ClientManager from "@common/managers/ClientManager";
import {
  AutocompleteFocusedOption,
  AutocompleteInteraction,
  ChatInputCommandInteraction,
  Interaction,
  PermissionsBitField,
  SlashCommandBuilder,
} from "discord.js";

export default abstract class SlashCommand {
  readonly data: SlashCommandBuilder;

  readonly name: string;
  readonly description: string;

  constructor(name: string, description: string) {
    this.name = name.toLowerCase();
    this.description = description;

    this.data = new SlashCommandBuilder().setName(this.name).setDescription(this.description).setDMPermission(false);
  }

  abstract execute(interaction: ChatInputCommandInteraction): Promise<void>;

  protected getParamValue(interaction: ChatInputCommandInteraction, type: PARAM_TYPES, paramName: string): any | null {
    let val: any = undefined;
    switch (type) {
      case PARAM_TYPES.STRING:
        val = interaction.options.getString(paramName);
        break;
      case PARAM_TYPES.ROLE:
        val = interaction.options.getRole(paramName);
        break;
      case PARAM_TYPES.BOOLEAN:
        val = interaction.options.getBoolean(paramName);
        break;
      case PARAM_TYPES.CHANNEL:
        val = interaction.options.getChannel(paramName);
        break;
      case PARAM_TYPES.ATTACHMENT:
        val = interaction.options.getAttachment(paramName);
        break;
      case PARAM_TYPES.INTEGER:
        val = interaction.options.getInteger(paramName);
        break;
      case PARAM_TYPES.MEMBER:
        val = interaction.options.getMember(paramName);
        break;
      case PARAM_TYPES.USER:
        val = interaction.options.getUser(paramName);
        break;
    }
    return val;
  }

  protected isSubCommand(interaction: ChatInputCommandInteraction, subCommandName: string): boolean {
    return interaction.options.getSubcommand() == subCommandName;
  }

  protected isSubCommandGroup(interaction: ChatInputCommandInteraction, subCommandGroupName: string): boolean {
    return interaction.options.getSubcommandGroup() == subCommandGroupName;
  }

  toString(): string {
    return JSON.stringify(this);
  }
}

export abstract class AutocompleteSlashCommand extends SlashCommand {
  constructor(name: string, description: string) {
    super(name, description);

    this.registerAutoCompleteListener();
  }

  /**
   *
   * @param interaction: The AutocompleteInteraction
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

  protected getFocusedOptionName(interaction: AutocompleteInteraction): string {
    return interaction.options.getFocused(true).name;
  }

  protected getFocusedOption(interaction: AutocompleteInteraction): AutocompleteFocusedOption {
    return interaction.options.getFocused(true);
  }

  protected getOptionValue(interaction: AutocompleteInteraction, type: OPTION_TYPES, paramName: string): string | boolean | number | null {
    switch (type) {
      case OPTION_TYPES.STRING:
        return interaction.options.getString(paramName);
      case OPTION_TYPES.BOOLEAN:
        return interaction.options.getBoolean(paramName);
      case OPTION_TYPES.INTEGER:
        return interaction.options.getInteger(paramName);
    }
  }

  protected getSubCommand(interaction: AutocompleteInteraction): string | null {
    return interaction.options.getSubcommand(false);
  }
}

export abstract class AdminSlashCommand extends SlashCommand {
  constructor(name: string, description: string) {
    super(name, description);

    this.data.setDefaultMemberPermissions(PermissionsBitField.Flags.Administrator);
  }
}

export abstract class AdminAutocompleteSlashCommand extends AutocompleteSlashCommand {
  constructor(name: string, description: string) {
    super(name, description);

    this.data.setDefaultMemberPermissions(PermissionsBitField.Flags.Administrator);
  }
}

export enum PARAM_TYPES {
  STRING,
  INTEGER,
  BOOLEAN,
  ROLE,
  CHANNEL,
  USER,
  MEMBER,
  ATTACHMENT,
}

export enum OPTION_TYPES {
  STRING,
  INTEGER,
  BOOLEAN,
}

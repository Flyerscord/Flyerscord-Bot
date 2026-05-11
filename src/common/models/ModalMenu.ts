import {
  LabelBuilder,
  ModalBuilder,
  ModalSubmitInteraction,
  StringSelectMenuBuilder,
  StringSelectMenuOptionBuilder,
  TextDisplayBuilder,
  TextInputBuilder,
  TextInputStyle,
} from "discord.js";
import Stumper from "stumper";
import Command from "./Command";

export interface ITextInputOptions {
  required?: boolean;
  inputPlaceholder?: string;
  inputValue?: string;
  minLength?: number;
  maxLength?: number;
}

export interface IStringSelectOptions {
  required?: boolean;
  minSelections?: number;
  maxSelections?: number;
  placeholder?: string;
}

export default abstract class ModalMenu extends Command {
  readonly data: ModalBuilder;

  readonly title: string;

  protected currentId = 0;

  constructor(name: string, title: string) {
    super(name, true, true);
    this.title = title;

    this.data = new ModalBuilder().setCustomId(this.name).setTitle(this.title);
  }

  async run(interaction: ModalSubmitInteraction): Promise<void> {
    Stumper.info(`Running modal submit for ${this.name.split("-")[0]}`, "common:ModalMenu:run");
    this.replies.setInteraction(interaction);
    await this.replies.deferReply();
    await this.execute(interaction);
  }

  protected abstract execute(interaction: ModalSubmitInteraction): Promise<void>;

  getModal(): ModalBuilder {
    return this.data;
  }

  protected getTextInputValue(interaction: ModalSubmitInteraction, customId: string): string {
    return interaction.fields.getTextInputValue(customId);
  }

  protected getStringSelectValue(interaction: ModalSubmitInteraction, customId: string): string[] {
    return interaction.fields.getStringSelectValues(customId) as string[];
  }

  protected createTextInputWithLabel(
    id: string,
    label: string,
    description: string,
    style: TextInputStyle,
    options: ITextInputOptions = {},
  ): LabelBuilder {
    const { required = false } = options;
    const input = new TextInputBuilder().setCustomId(id).setStyle(style).setRequired(required);

    if (options.inputPlaceholder) {
      input.setPlaceholder(options.inputPlaceholder);
    }

    if (options.inputValue) {
      input.setValue(options.inputValue);
    }

    if (options.minLength) {
      input.setMinLength(options.minLength);
    }

    if (options.maxLength) {
      input.setMaxLength(options.maxLength);
    }

    return new LabelBuilder().setId(this.currentId++).setLabel(label).setDescription(description).setTextInputComponent(input);
  }

  protected createTextDisplay(content: string): TextDisplayBuilder {
    return new TextDisplayBuilder().setId(this.currentId++).setContent(content);
  }

  protected createStringSelectWithLabel(
    id: string,
    label: string,
    description: string,
    choices: string[],
    options: IStringSelectOptions = {},
  ): LabelBuilder {
    const input = new StringSelectMenuBuilder().setCustomId(id);

    if (options.required) {
      input.setRequired(options.required);
    }

    if (options.minSelections) {
      input.setMinValues(options.minSelections);
    }

    if (options.maxSelections) {
      input.setMaxValues(options.maxSelections);
    }

    if (options.placeholder) {
      input.setPlaceholder(options.placeholder);
    }

    input.addOptions(choices.map((choice) => new StringSelectMenuOptionBuilder().setLabel(choice).setValue(choice)));

    return new LabelBuilder().setId(this.currentId++).setLabel(label).setDescription(description).setStringSelectMenuComponent(input);
  }
}

import {
  ActionRowData,
  APIAttachment,
  APIMessageTopLevelComponent,
  Attachment,
  AttachmentBuilder,
  AttachmentPayload,
  BufferResolvable,
  ButtonInteraction,
  CommandInteraction,
  EmbedBuilder,
  JSONEncodable,
  Message,
  MessageActionRowComponentBuilder,
  MessageActionRowComponentData,
  MessageFlagsBitField,
  ModalSubmitInteraction,
  TopLevelComponentData,
} from "discord.js";
import { AsyncLocalStorage } from "node:async_hooks";
import Stream from "node:stream";
import Stumper from "stumper";

type RepliableInteraction = CommandInteraction | ModalSubmitInteraction | ButtonInteraction;

export class InteractionReplies {
  private readonly interactionStore = new AsyncLocalStorage<RepliableInteraction>();
  private ephemeral: boolean;
  private source: string;

  private readonly defaults: Required<IInteractionReplieOptions>;

  constructor(source: string, ephemeral: boolean = false) {
    this.ephemeral = ephemeral;
    this.source = source;

    this.defaults = {
      ephemeral: false,
      files: [],
      components: [],
      content: "",
      embeds: [],
    };
  }

  /**
   * Runs `callback` with `interaction` bound as the active interaction for this instance, scoped to
   * the current async context. This keeps concurrent invocations (e.g. two overlapping button clicks
   * handled by the same singleton handler) from clobbering each other's interaction.
   * @param interaction - The interaction to bind for the duration of `callback`
   * @param callback - The work to run with `interaction` bound
   * @returns Whatever `callback` resolves to
   */
  async run<T>(interaction: RepliableInteraction, callback: () => Promise<T>): Promise<T> {
    return this.interactionStore.run(interaction, callback);
  }

  async deferReply(): Promise<void> {
    const interaction = this.getInteraction();
    if (!interaction) return;

    if (!interaction.deferred) {
      if (this.ephemeral) {
        await interaction.deferReply({ flags: MessageFlagsBitField.Flags.Ephemeral });
      } else {
        await interaction.deferReply();
      }
    } else {
      Stumper.error(`Interaction ${interaction.id} is already deferred!`, this.source);
    }
  }

  async reply(content: string | IInteractionReplieOptions = {}): Promise<Message | undefined> {
    const interaction = this.getInteraction();
    if (!interaction) return;

    let options: IInteractionReplieOptions;
    if (typeof content === "string") {
      options = { content: content };
    } else {
      options = content;
    }

    const opts = this.getDefaultOptions(options);

    if (!this.checkOptions(opts)) {
      Stumper.error(`Invalid options provided to reply!`, this.source);
      return;
    }

    const addEphemeral = this.ephemeral || opts.ephemeral;

    if (!interaction.deferred) {
      if (addEphemeral) {
        await interaction.reply({
          components: opts.components,
          files: opts.files,
          embeds: opts.embeds,
          content: opts.content,
          flags: MessageFlagsBitField.Flags.Ephemeral,
        });
      } else {
        await interaction.reply({
          components: opts.components,
          files: opts.files,
          embeds: opts.embeds,
          content: opts.content,
        });
      }
      return;
    }

    if (interaction.replied) {
      Stumper.error(`Interaction ${interaction.id} has already replied!`, this.source);
      return;
    }

    if (addEphemeral) {
      return await interaction.followUp({
        components: opts.components,
        files: opts.files,
        embeds: opts.embeds,
        content: opts.content,
        flags: MessageFlagsBitField.Flags.Ephemeral,
      });
    }

    return await interaction.editReply({ components: opts.components, files: opts.files, embeds: opts.embeds, content: opts.content });
  }

  isDeferred(): boolean {
    return this.getInteraction()?.deferred ?? false;
  }

  isReplied(): boolean {
    return this.getInteraction()?.replied ?? false;
  }

  private getInteraction(): RepliableInteraction | undefined {
    return this.interactionStore.getStore();
  }

  private getDefaultOptions(input: IInteractionReplieOptions): Required<IInteractionReplieOptions> {
    return {
      ephemeral: input.ephemeral ?? this.defaults.ephemeral,
      files: input.files ?? this.defaults.files,
      components: input.components ?? this.defaults.components,
      content: input.content ?? this.defaults.content,
      embeds: input.embeds ?? this.defaults.embeds,
    };
  }

  private checkOptions(options: Required<IInteractionReplieOptions>): boolean {
    if (options.content == "" && options.embeds.length == 0 && options.files.length == 0 && options.components.length == 0) {
      return false;
    }
    return true;
  }
}

export function createReplies(source: string, ephemeral: boolean = false): InteractionReplies {
  return new InteractionReplies(source, ephemeral);
}

export interface IInteractionReplieOptions {
  content?: string;
  embeds?: EmbedBuilder[];
  ephemeral?: boolean;
  files?: readonly (BufferResolvable | Stream | JSONEncodable<APIAttachment> | Attachment | AttachmentBuilder | AttachmentPayload)[];
  components?: readonly (
    | JSONEncodable<APIMessageTopLevelComponent>
    | TopLevelComponentData
    | ActionRowData<MessageActionRowComponentData | MessageActionRowComponentBuilder>
    | APIMessageTopLevelComponent
  )[];
}

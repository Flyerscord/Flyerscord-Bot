import {
  ActionRowData,
  APIAttachment,
  APIMessageTopLevelComponent,
  Attachment,
  AttachmentBuilder,
  AttachmentPayload,
  BufferResolvable,
  CommandInteraction,
  EmbedBuilder,
  JSONEncodable,
  Message,
  MessageActionRowComponentBuilder,
  MessageActionRowComponentData,
  TopLevelComponentData,
} from "discord.js";
import Stream from "node:stream";
import Stumper from "stumper";

class InteractionReplies {
  private interaction: CommandInteraction;
  private ephemeral: boolean;
  readonly source: string;

  private readonly defaults: Required<IInteractionReplieOptions>;

  constructor(interaction: CommandInteraction, source: string, ephemeral: boolean = false) {
    this.interaction = interaction;
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

  async deferReply(): Promise<void> {
    if (!this.interaction.deferred) {
      if (this.ephemeral) {
        await this.interaction.deferReply({ ephemeral: true });
      } else {
        await this.interaction.deferReply();
      }
    } else {
      Stumper.error(`Interaction ${this.interaction.id} is already deferred!`, this.source);
    }
  }

  async reply(content: string | IInteractionReplieOptions = {}): Promise<Message | undefined> {
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

    if (!this.interaction.deferred) {
      Stumper.error(`Interaction ${this.interaction.id} is not deferred!`, this.source);
      return;
    }

    if (this.interaction.replied) {
      Stumper.error(`Interaction ${this.interaction.id} has already replied!`, this.source);
      return;
    }

    const addEphemeral = this.ephemeral || opts.ephemeral;

    if (addEphemeral) {
      return await this.interaction.followUp({
        components: opts.components,
        files: opts.files,
        embeds: opts.embeds,
        content: opts.content,
        ephemeral: true,
      });
    }

    return await this.interaction.editReply({ components: opts.components, files: opts.files, embeds: opts.embeds, content: opts.content });
  }

  isDeferred(): boolean {
    return this.interaction.replied;
  }

  isReplied(): boolean {
    return this.interaction.replied;
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

export async function createReplies(interaction: CommandInteraction, source: string, ephemeral: boolean = false): Promise<InteractionReplies> {
  const replies = new InteractionReplies(interaction, source, ephemeral);
  await replies.deferReply();
  return replies;
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

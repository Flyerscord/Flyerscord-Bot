import { Modules } from "@modules/Modules";
import { ActionRowBuilder, ButtonBuilder, ButtonStyle } from "discord.js";

export function createButton(module: Modules, id: string, label: string, style: ButtonStyle): ButtonBuilder {
  return new ButtonBuilder().setCustomId(`${module}:${id}`).setLabel(label).setStyle(style);
}

export function createRow(buttons: ButtonBuilder[]): ActionRowBuilder<ButtonBuilder> {
  return new ActionRowBuilder<ButtonBuilder>().addComponents(...buttons);
}

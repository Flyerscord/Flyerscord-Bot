import { ActionRowBuilder, MessageActionRowComponentBuilder } from "discord.js";
import BeginnerSignupButton from "../commands/buttons/BeginnerSignupButton";
import IntermediateSignupButton from "../commands/buttons/IntermediateSignupButton";
import ExpertSignupButton from "../commands/buttons/ExpertSignupButton";
import CommissionerSignupButton from "../commands/buttons/CommissionerSignupButton";
import LeaveSignupButton from "../commands/buttons/LeaveSignupButton";

/**
 * Builds the row of signup buttons (one per skill level, plus commissioner and leave) posted with the
 * signup embed. Each button's label/style/customId lives on its own handler class; this just picks
 * the display order.
 */
export function getSignupButtonsRow(): ActionRowBuilder<MessageActionRowComponentBuilder> {
  return new ActionRowBuilder<MessageActionRowComponentBuilder>().addComponents(
    new BeginnerSignupButton().button,
    new IntermediateSignupButton().button,
    new ExpertSignupButton().button,
    new CommissionerSignupButton().button,
    new LeaveSignupButton().button,
  );
}

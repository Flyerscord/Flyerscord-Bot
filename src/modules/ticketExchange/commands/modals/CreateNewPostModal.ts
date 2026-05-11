import ModalMenu from "@common/models/ModalMenu";
import { ModalSubmitInteraction, TextInputStyle } from "discord.js";

export default class CreateNewPostModal extends ModalMenu {
  constructor(prevOpponent: string, prevDate: string, prevPrice: string) {
    super("CreateNewPostModal", "Create New Post");

    const infoText = this.createTextDisplay("Make sure you follow the instructions and match specified formats!");

    const opponentInput = this.createTextInputWithLabel(
      "newPostOpponent",
      "Opponent",
      "The name of the team the Flyers are playing",
      TextInputStyle.Short,
      {
        inputValue: prevOpponent,
      },
    );
    const dateInput = this.createTextInputWithLabel("newPostDate", "Date", "Please use the format MM/DD/YY", TextInputStyle.Short, {
      inputValue: prevDate,
    });
    const priceInput = this.createTextInputWithLabel("newPostPrice", "Price", "Total price for all of the tickets", TextInputStyle.Short, {
      inputValue: prevPrice,
    });

    this.data.addTextDisplayComponents([infoText]).addLabelComponents([opponentInput, dateInput, priceInput]);
  }

  protected async execute(interaction: ModalSubmitInteraction): Promise<void> {
    const opponent = this.getStringSelectValue(interaction, "newPostOpponent");
    const date = this.getStringSelectValue(interaction, "newPostDate");
    const price = this.getStringSelectValue(interaction, "newPostPrice");

    // Check if the opponent is valid with the NHL API

    // Check if there is actually a game against the opponent on the date
    // Get the game start time

    // Validate the price

    // Save the values in the database
  }
}

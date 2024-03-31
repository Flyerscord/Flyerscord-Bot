import { CustomTextCommand } from "../../models/TextCommand";

export default class ZebrasTextCommand extends CustomTextCommand {
  constructor() {
    super("zebras", "Zebra, zebra, short and stout: find your head and pull it out!");
  }
}

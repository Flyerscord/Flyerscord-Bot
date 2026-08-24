import { ButtonStyle } from "discord.js";
import SkillLevelSignupButtonBase from "./base/SkillLevelSignupButtonBase";
import { SkillLevel } from "../../db/schema";

export default class IntermediateSignupButton extends SkillLevelSignupButtonBase {
  constructor() {
    super(SkillLevel.INTERMEDIATE, ButtonStyle.Primary);
  }
}

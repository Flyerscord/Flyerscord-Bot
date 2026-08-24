import { ButtonStyle } from "discord.js";
import SkillLevelSignupButtonBase from "./base/SkillLevelSignupButtonBase";
import { SkillLevel } from "../../db/schema";

export default class ExpertSignupButton extends SkillLevelSignupButtonBase {
  constructor() {
    super(SkillLevel.EXPERT, ButtonStyle.Danger);
  }
}

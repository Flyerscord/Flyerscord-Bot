import { ButtonStyle } from "discord.js";
import SkillLevelSignupButtonBase from "./base/SkillLevelSignupButtonBase";
import { SkillLevel } from "../../db/schema";

export default class BeginnerSignupButton extends SkillLevelSignupButtonBase {
  constructor() {
    super(SkillLevel.BEGINNER, ButtonStyle.Success);
  }
}

import { Message } from "discord.js";
import LevelsDB from "../providers/Levels.Database";
import Time from "../../../common/utils/Time";
import LevelExpDB from "../providers/LevelExp.Database";

// Get a whole number between 15 and 25 (inclusive)
export function getExpAmount(): number {
    return Math.floor(Math.random() * 11) + 15;
}

export function addMessage(message: Message): void {
    const MESSAGE_THRESHOLD = 1 * 60 * 1000;
    const db = LevelsDB.getInstance();
    const userId = message.author.id;

    db.addNewUser(userId);
    const userLevel = db.getUser(userId)!;

    if (Time.timeSince(userLevel.timeOfLastMessage) >= MESSAGE_THRESHOLD) {
        userLevel.messageCount++;
        userLevel.timeOfLastMessage = Time.getCurrentTime().getTime();
        userLevel.totalExp += getExpAmount();
        if (checkForLevelUp(userLevel.currentLevel, userLevel.totalExp)) {
            // TODO: Trigger a message to send when the user levels up
            userLevel.currentLevel++;
        }
        db.updateUser(userId, userLevel);
    }
}

export function checkForLevelUp(currentLevel: number, exp: number): boolean {
    const db = LevelExpDB.getInstance();
    const expToNextLevel = db.getExpUntilNextLevel(currentLevel, exp);
    return expToNextLevel >= 0;
}

// TODO: Implement this
export function sendLevelUpMessage(currentLevel: number): void { }
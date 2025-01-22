import { AtpAgent } from "@atproto/api";
import Config from "../../../common/config/Config";
import { IBlueSkyAccount } from "../interfaces/IBlueSkyAccount";
import { IPost } from "../interfaces/IPost";
import Stumper from "stumper";

// https://docs.bsky.app/docs/tutorials/user-lists#add-a-user-to-a-list
export default class BlueSky {
  private static instance: BlueSky;

  private agent: AtpAgent;

  constructor() {
    this.agent = new AtpAgent({ service: "https://bsky.social" });

    this.login();
  }

  static getInstance(): BlueSky {
    return this.instance || (this.instance = new this());
  }

  private async login(): Promise<void> {
    const username = Config.getConfig().bluesky.username;
    const password = Config.getConfig().bluesky.password;

    await this.agent.login({ identifier: username, password: password });
  }

  async getUserDid(accountTag: string): Promise<string> {
    try {
      const resp = await this.agent.getProfile({ actor: accountTag });
      return resp.data.did;
    } catch (error) {
      Stumper.caughtError(error, "blueSky:BlueSky:getUserDid");
    }
    return "";
  }

  async checkAccountForNewPosts(account: IBlueSkyAccount): Promise<IPost[]> {
    const posts: IPost[] = [];

    const agentDid = this.agent.session?.did;

    if (!agentDid) {
      throw new Error("Agent did not exist!");
    }

    const userDid = await this.getUserDid(account.account);

    this.agent.com.atproto.repo.createRecord({
      repo: agentDid,
      collection: "app.bsky.graph.listitem",
      record: {
        $type: "app.bsky.graph.listitem",
        subject: userDid,
        list: listUri,
        createdAt: new Date().toISOString(),
      },
    });

    return posts;
  }

  async addAccountToList(account: IBlueSkyAccount): Promise<void> {}

  async removeAccountFromList(account: IBlueSkyAccount): Promise<void> {}
}

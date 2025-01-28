import { AtpAgent, AtUri } from "@atproto/api";
import Config from "../../../common/config/Config";
import { IPost } from "../interfaces/IPost";
import Stumper from "stumper";
import { IBlueSkyAccount } from "../interfaces/IBlueSkyAccount";
import { AccountNotinListException } from "../exceptions/AccountNotInListException";

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

  async checkAccountForNewPosts(): Promise<IPost[]> {
    const posts: IPost[] = [];

    const listUri = await this.createListUri();

    try {
      const response = await this.agent.app.bsky.feed.getListFeed({ list: listUri });
      if (response.success) {
        for (const item of response.data.feed) {
          // item.
        }
      }
    } catch (error) {
      Stumper.caughtError(error, "blueSky:BlueSky:checkAccountForNewPosts");
      return [];
    }

    return posts;
  }

  async addAccountToList(account: string): Promise<void> {
    const agentDid = this.agent.session?.did;

    if (!agentDid) {
      Stumper.error("Agent did not exist!", "blueSky:BlueSky:addAccountToList");
      throw new Error("Agent did not exist!");
    }

    const userDid = await this.getUserDid(account);
    const listUri = this.createListUri();

    await this.agent.com.atproto.repo.createRecord({
      repo: agentDid,
      collection: "app.bsky.graph.listitem",
      record: {
        $type: "app.bsky.graph.listitem",
        subject: userDid,
        list: listUri,
        createdAt: new Date().toISOString(),
      },
    });
  }

  async removeAccountFromList(account: string): Promise<void> {
    const accounts = await this.getListAccounts();

    const listItemUri = accounts.find((a) => a.userHandle == account)?.uri;
    if (!listItemUri) {
      Stumper.error(`Account ${account} not found in list!`, "blueSky:BlueSky:removeAccountFromList");
      throw new AccountNotinListException();
    }

    const { host, collection, rkey } = new AtUri(listItemUri);
    await this.agent.com.atproto.repo.deleteRecord({ repo: host, collection, rkey });
  }

  async getListAccounts(): Promise<IBlueSkyAccount[]> {
    const listUri = await this.createListUri();

    const accounts: IBlueSkyAccount[] = [];

    try {
      const response = await this.agent.app.bsky.graph.getList({ list: listUri });

      if (response.success) {
        for (const item of response.data.items) {
          accounts.push({
            userHandle: item.subject.handle,
            userDid: item.subject.did,
            displayName: item.subject.displayName || "",
            uri: item.uri,
          });
        }
      }
    } catch (error) {
      Stumper.caughtError(error, "blueSky:BlueSky:getListAccounts");
      return [];
    }
    return accounts;
  }

  private async createListUri(): Promise<string> {
    const listId = Config.getConfig().bluesky.listId;
    const userDid = await this.getUserDid(Config.getConfig().bluesky.username);
    return `at://did:plc:${userDid}/app.bsky.feed.list/${listId}`;
  }
}

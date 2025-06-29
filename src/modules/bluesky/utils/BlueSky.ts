import { IPost } from "../interfaces/IPost";
import Stumper from "stumper";
import { IBlueSkyAccount } from "../interfaces/IBlueSkyAccount";
import { AccountNotinListException } from "../exceptions/AccountNotInListException";
import BlueSkyDB from "../providers/BlueSky.Database";
import { AtpAgent, AtUri } from "@atproto/api";
import { AccountDoesNotExistException } from "../exceptions/AccountDoesNotExistException";
import { Singleton } from "@common/models/Singleton";
import ConfigManager from "@common/config/ConfigManager";

export default class BlueSky extends Singleton {
  private agent: AtpAgent;

  private userDid: string;

  constructor() {
    super();
    this.userDid = "";
    this.agent = new AtpAgent({ service: "https://bsky.social" });

    this.login();
  }

  private async login(): Promise<void> {
    const config = ConfigManager.getInstance().getConfig("BlueSky");
    const username = config.username;
    const password = config.password;

    try {
      const resp = await this.agent.login({ identifier: username, password: password });
      this.userDid = resp.data.did;
      Stumper.info("Login successful!", "blueSky:BlueSky:login");
    } catch (e) {
      Stumper.error("Login failed!", "blueSky:BlueSky:login");
      throw e;
    }
  }

  async getUserDid(accountTag: string): Promise<string> {
    try {
      accountTag = this.sanitizeHandle(accountTag);
      const resp = await this.agent.app.bsky.actor.getProfile({ actor: accountTag });
      return resp.data.did;
    } catch (error) {
      Stumper.caughtError(error, "blueSky:BlueSky:getUserDid");
    }
    return "";
  }

  async checkForNewPosts(): Promise<IPost[]> {
    const postDatas: IPost[] = [];

    const db = BlueSkyDB.getInstance();

    const lastPost = db.getLastPostTime();

    const listUri = this.createListUri();

    try {
      const response = await this.agent.app.bsky.feed.getListFeed({ list: listUri, limit: 30 });
      if (response.success) {
        const data = response.data;
        const sortedPosts = data.feed.sort(
          // Oldest to newest
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (a, b) => new Date((a.post.record as any).createdAt).getTime() - new Date((b.post.record as any).createdAt).getTime(),
        );
        if (lastPost == "") {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          db.setLastPostTime((sortedPosts[sortedPosts.length - 1].post.record as any).createdAt);
          return [];
        }

        const timeOfLastPost = new Date(lastPost).getTime();
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const newPosts = sortedPosts.filter((post) => new Date((post.post.record as any).createdAt).getTime() > timeOfLastPost);

        for (const post of newPosts) {
          // Only add posts that are not replies
          if (!post.reply) {
            const postData: IPost = {
              account: post.post.author.handle,
              postId: post.post.cid,
              url: `https://bsky.app/profile/${post.post.author.handle}/post/${post.post.uri.split("/").pop()}`,
            };
            postDatas.push(postData);
          }
        }
        if (newPosts.length > 0) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          db.setLastPostTime((newPosts[newPosts.length - 1].post.record as any).createdAt);
        }
      }
    } catch (error) {
      Stumper.caughtError(error, "blueSky:BlueSky:checkAccountForNewPosts");
      return [];
    }

    return postDatas;
  }

  async addAccountToList(account: string): Promise<void> {
    const userDid = await this.getUserDid(account);
    if (userDid == "") {
      throw new AccountDoesNotExistException(account);
    }
    const listUri = this.createListUri();
    try {
      await this.agent.com.atproto.repo.createRecord({
        repo: this.userDid,
        collection: "app.bsky.graph.listitem",
        record: {
          $type: "app.bsky.graph.listitem",
          subject: userDid,
          list: listUri,
          createdAt: new Date().toISOString(),
        },
      });
    } catch (error) {
      Stumper.caughtError(error, "blueSky:BlueSky:addAccountToList");
      throw error;
    }
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
    const listUri = this.createListUri();

    const accounts: IBlueSkyAccount[] = [];
    const limit = 100;
    let cursor = "";
    let totalItems = 0;

    try {
      do {
        const resp = await this.agent.app.bsky.graph.getList({ list: listUri, limit: limit, cursor: cursor });
        const response = resp.data;

        for (const item of response.items) {
          accounts.push({
            userHandle: item.subject.handle,
            userDid: item.subject.did,
            displayName: item.subject.displayName || "",
            uri: item.uri,
          });
        }

        cursor = response.cursor || "";
        totalItems = response.list.listItemCount || 0;
      } while (totalItems > accounts.length);
    } catch (error) {
      Stumper.caughtError(error, "blueSky:BlueSky:getListAccounts");
    }
    return accounts;
  }

  private createListUri(): string {
    const listId = ConfigManager.getInstance().getConfig("BlueSky").listId;
    return `at://${this.userDid}/app.bsky.graph.list/${listId}`;
  }

  private sanitizeHandle(input: string): string {
    return input
      .trim()
      .replace(/^@/, "") // Remove leading @
      .replace(/[\u200B-\u200F\u202A-\u202E\u2060-\u206F]+/g, ""); // Strip invisible unicode
  }
}

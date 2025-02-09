import Config from "../../../common/config/Config";
import { IPost } from "../interfaces/IPost";
import Stumper from "stumper";
import { IBlueSkyAccount } from "../interfaces/IBlueSkyAccount";
import { AccountNotinListException } from "../exceptions/AccountNotInListException";
import BlueSkyDB from "../providers/BlueSky.Database";
import AxiosWrapper from "./AxiosWrapper";

export default class BlueSky {
  private static instance: BlueSky;

  private accessJwt: string;
  private refreshJwt: string;
  private userDid: string;

  constructor() {
    this.login();
  }

  static getInstance(): BlueSky {
    return this.instance || (this.instance = new this());
  }

  private async login(): Promise<void> {
    const username = Config.getConfig().bluesky.username;
    const password = Config.getConfig().bluesky.password;

    const resp = await AxiosWrapper.post("com.atproto.server.createSession", { identifier: username, password: password });

    if (resp.status != 200) {
      Stumper.error("Login failed!", "blueSky:BlueSky:login");
      throw new Error("Login failed!");
    } else {
      Stumper.info("Login successful!", "blueSky:BlueSky:login");
      this.accessJwt = resp.data.accessJwt;
      this.refreshJwt = resp.data.refreshJwt;
    }
  }

  private async refreshAccessToken(): Promise<void> {
    const resp = await AxiosWrapper.post("com.atproto.server.refreshSession", {
      accessJwt: this.accessJwt,
      refreshJwt: this.refreshJwt,
      handle: Config.getConfig().bluesky.username,
      did: this.userDid,
    });
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

  async checkForNewPosts(): Promise<IPost[]> {
    const postDatas: IPost[] = [];

    const db = BlueSkyDB.getInstance();

    const lastPost = db.getLastPostId();

    const listUri = await this.createListUri();

    try {
      const response = await this.agent.app.bsky.feed.getListFeed({ list: listUri });
      console.log(response);
      if (response.success) {
        const sortedPosts = response.data.feed.sort((a, b) => (b.post.record as any).createdAt - (a.post.record as any).createdAt);
        for (const post of sortedPosts) {
          console.log(post.post.record);
          if (lastPost == "") {
            db.setLastPostId(post.post.cid);
            break;
          }

          if (post.post.cid != lastPost) {
            const postData: IPost = {
              account: post.post.author.handle,
              postId: post.post.cid,
              url: `https://bsky.app/profile/${post.post.author.handle}/post/${post.post.uri.split("/").pop()}`,
            };
            postDatas.push(postData);
          } else {
            break;
          }
        }
      }
    } catch (error) {
      Stumper.caughtError(error, "blueSky:BlueSky:checkAccountForNewPosts");
      return [];
    }

    return postDatas;
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
      const response = await this.agent.app.bsky.graph.getList({ list: listUri, limit: 100 });
      console.log(response);
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
    console.log(`at://${userDid}/app.bsky.graph.list/${listId}`);
    return `at://${userDid}/app.bsky.feed.graph/${listId}`;
  }
}

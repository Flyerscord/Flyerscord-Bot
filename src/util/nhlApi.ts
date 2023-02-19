import axios from "axios";
import IHttpResponse from "../interfaces/HttpResponse";
import Logger from "./Logger";

export default class NHLApi {
  private static readonly baseurl = "https://statsapi.web.nhl.com/api/v1";

  static async get(endpoint: string): Promise<IHttpResponse> {
    const url = this.createUrl(endpoint);
    const res = await axios.get(url);

    const httpRes: IHttpResponse = {
      data: res.data,
      statusCode: res.status,
      headers: res.headers,
    };

    if (res.status != 200) {
      Logger.error(`Status code: ${res.status} from endpoint: ${endpoint}`, "NHLAPI:get");
    }

    return httpRes;
  }

  private static createUrl(endpoint: string): string {
    return `${this.baseurl}/${endpoint}`;
  }
}

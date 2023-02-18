import axios from "axios";
import IHttpResponse from "../interfaces/HttpResponse";

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

    return httpRes;
  }

  private static createUrl(endpoint: string): string {
    return `${this.baseurl}/${endpoint}`;
  }
}

/* eslint-disable @typescript-eslint/no-explicit-any */
import axios, { AxiosResponse } from "axios";

export default class AxiosWrapper {
  private static readonly baseUrl: string = "https://bsky.social/xrpc/";

  static async post(endpoint: string, data: unknown): Promise<AxiosResponse<any, any>> {
    return await axios.post(this.createApiUrl(endpoint), data, { headers: { "Content-Type": "application/json" } });
  }

  static async get(endpoint: string, params: string): Promise<AxiosResponse<any, any>> {
    return await axios.get(this.createApiUrl(endpoint), { params: params, headers: { "Content-Type": "application/json" } });
  }

  static createApiUrl(endpoint: string): string {
    return `${this.baseUrl}${endpoint}`;
  }
}

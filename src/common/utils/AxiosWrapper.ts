/* eslint-disable @typescript-eslint/no-explicit-any */
import axios, { AxiosInstance, AxiosResponse } from "axios";
import Stumper from "stumper";
import { RequestFailedException } from "../exceptions/RequestFailedException";

export default class AxiosWrapper {
  private readonly baseUrl: string;
  private readonly name: string;

  private accessJwt: string;
  private refreshToken: string;
  private refreshTokenEndpoint: string;
  private axiosInstance: AxiosInstance;

  constructor(name: string, baseUrl: string) {
    this.baseUrl = baseUrl;
    this.name = name;

    this.accessJwt = "";
    this.refreshToken = "";
    this.refreshTokenEndpoint = "";

    this.axiosInstance = axios.create({
      baseURL: this.baseUrl,
      headers: { "Content-Type": "application/json" },
    });
  }

  setAccessJwt(accessJwt: string, refreshToken: string, refreshTokenEndpoint?: string): void {
    this.accessJwt = accessJwt;
    this.refreshToken = refreshToken;
    if (refreshTokenEndpoint) {
      this.refreshTokenEndpoint = refreshTokenEndpoint;
    }
    this.axiosInstance.defaults.headers.Authorization = `Bearer ${this.accessJwt}`;

    this.scheduleTokenRefresh();
  }

  async post(endpoint: string, data: Record<string, any>): Promise<any> {
    Stumper.debug(`Sending POST request to ${endpoint}`, `common:AxiosWrapper(${this.name}):post`);
    const response = await this.axiosInstance.post(endpoint, data);
    return this.getData(endpoint, response);
  }

  async get(endpoint: string, params?: Record<string, any>): Promise<any> {
    Stumper.debug(`Sending GET request to ${endpoint}`, `common:AxiosWrapper(${this.name}):get`);
    const response = await this.axiosInstance.get(endpoint, { params });
    return this.getData(endpoint, response);
  }

  private getData(endpoint: string, response: AxiosResponse<any, any>): any {
    if (response.status !== 200) {
      throw new RequestFailedException(endpoint, response.status);
    }

    Stumper.debug(`Request to ${endpoint} was successful!`, `common:AxiosWrapper(${this.name}):getData`);

    return response.data;
  }

  private async refreshJwt(): Promise<void> {
    const resp = await this.post(this.refreshTokenEndpoint, { refresh_token: this.refreshToken });
    this.setAccessJwt(resp.access_token, resp.refresh_token);
  }

  private async scheduleTokenRefresh(): Promise<void> {
    try {
      const [, payload] = this.accessJwt.split(".");
      const { exp } = JSON.parse(atob(payload));

      const expiresInMs = exp * 1000 - Date.now();
      const refreshTimeMs = expiresInMs - 5 * 60 * 1000; // Refresh 5 minutes before expiry

      if (refreshTimeMs > 0) {
        Stumper.info(
          `Scheduling token refresh in ${Math.round(refreshTimeMs / 1000)} seconds`,
          `common:AxiosWrapper(${this.name}):scheduleTokenRefresh`,
        );

        setTimeout(async () => {
          try {
            await this.refreshJwt();
            Stumper.info("Token refreshed successfully", `common:AxiosWrapper(${this.name}):scheduleTokenRefresh`);
          } catch (err) {
            Stumper.caughtError(err, `common:AxiosWrapper(${this.name}):scheduleTokenRefresh`);
          }
        }, refreshTimeMs);
      } else {
        Stumper.warning("Token already expired, refreshing now...", `common:AxiosWrapper(${this.name}):scheduleTokenRefresh`);
        try {
          await this.refreshJwt();
          Stumper.info("Token refreshed successfully", `common:AxiosWrapper(${this.name}):scheduleTokenRefresh`);
        } catch (err) {
          Stumper.caughtError(err, `common:AxiosWrapper(${this.name}):scheduleTokenRefresh`);
        }
      }
    } catch (err) {
      Stumper.error("Error parsing accessJwt", `common:AxiosWrapper(${this.name}):scheduleTokenRefresh`);
      Stumper.caughtError(err, `common:AxiosWrapper(${this.name}):scheduleTokenRefresh`);
    }
  }
}

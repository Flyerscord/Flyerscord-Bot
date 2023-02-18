import { AxiosResponseHeaders, RawAxiosResponseHeaders } from "axios";

export default interface IHttpResponse {
  data: any;
  statusCode: number;
  headers: RawAxiosResponseHeaders | AxiosResponseHeaders;
}

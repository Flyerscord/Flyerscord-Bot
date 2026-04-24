export default interface IBotHealth {
  status: string;
  message: string;
  version: string;
  uptime?: number;
  botUptime?: number;
}

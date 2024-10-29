export default interface IBotHealth {
  status: string;
  message: string;
  uptime?: number;
  botUptime?: number;
}

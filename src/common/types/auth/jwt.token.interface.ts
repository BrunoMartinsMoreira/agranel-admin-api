export interface JwtTokenInterface {
  access_token: string;
  refresh_token?: string;
  name: string;
  email: string;
  id: string;
}

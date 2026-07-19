export interface AuthUser {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
}

export interface AuthUserResponse {
  user: AuthUser;
}

export interface ApiErrorShape {
  detail?: string;
}
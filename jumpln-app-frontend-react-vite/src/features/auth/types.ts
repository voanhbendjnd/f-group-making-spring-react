export interface LoginRequest {
  username: string; // Email
  password: string;
}

export interface UserDetails {
  id: number;
  email: string;
  name: string | null;
  authorities: string[];
}

export interface LoginResponse {
  accessToken: string;
  user: UserDetails;
}

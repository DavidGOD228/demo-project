export interface JwtPayload {
  id: string;
}

export interface JwtStrategyAuth {
  id: string;
  authToken: string;
  role: string;
}

export interface ConfirmPasswordResponse {
  authToken: string;
  onBoarded?: boolean;
}

export interface JwtPayload {
  id: string;
}

export interface JwtStrategyAuth {
  id: string;
}

export interface ConfirmPasswordResponse {
  authToken: string;
}

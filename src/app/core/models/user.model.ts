// Matches the REAL backend DTOs (dto/RegisterRequest.java, dto/LoginRequest.java,
// dto/AuthenticationResponse.java) - AuthenticationResponse only returns a token,
// no name/email, so the UI decodes the JWT payload for display purposes.

export interface RegisterRequest {
  firstName: string;
  lastName: string;
  email: string;
  mobile: string; // must match ^[6-9]\d{9}$ on the backend
  password: string; // backend requires 8-20 chars
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthenticationResponse {
  token: string;
}

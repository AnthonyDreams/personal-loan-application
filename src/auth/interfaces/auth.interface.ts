export interface JwtSign {
    access_token: string;
    // refresh_token: string; // Uncomment when refresh token is implemented
  }
  
  export interface Payload {
    id: number;
    email: string;
  }
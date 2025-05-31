import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
  ) {}

  async login({ email, password }: { email: string; password: string }) {
    // TODO: Implement actual user authentication
    // For now, we'll return a mock token
    const payload = { email, sub: 'user_id' };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }

  async refreshToken() {
    // TODO: Implement token refresh logic
    return {
      access_token: 'new_refresh_token',
    };
  }
}

import { Injectable, ConflictException, UnauthorizedException } from '@nestjs/common';
import { createHmac, timingSafeEqual } from 'crypto';
import { UsersService } from '../users/users.service';
import { LoginDto, SignUpDto } from './dto/auth.dto';
import { AuthenticatedUser } from './auth.types';
import { verifyPassword } from './password.util';

interface TokenPayload {
  sub: string;
  email: string;
  exp: number;
}

@Injectable()
export class AuthService {
  constructor(private readonly usersService: UsersService) {}

  async signUp(dto: SignUpDto) {
    const existingUser = await this.usersService.findModelByEmail(dto.email);
    if (existingUser) {
      throw new ConflictException('An account with this email already exists');
    }

    const user = await this.usersService.create(dto);
    return this.buildAuthResponse(user);
  }

  async login(dto: LoginDto) {
    const user = await this.usersService.findModelByEmail(dto.email);

    if (!user?.password_hash || !verifyPassword(dto.password, user.password_hash)) {
      throw new UnauthorizedException('Invalid email or password');
    }

    return this.buildAuthResponse(this.usersService.toPublicUser(user));
  }

  async getProfile(userId: string) {
    const user = await this.usersService.findOne(userId);
    if (!user) {
      throw new UnauthorizedException('User account no longer exists');
    }
    return user;
  }

  async authenticate(token: string) {
    const payload = this.verifyToken(token);
    return this.getProfile(payload.sub);
  }

  private buildAuthResponse(user: AuthenticatedUser) {
    return {
      accessToken: this.signToken({
        sub: user.id,
        email: user.email,
        exp: Math.floor(Date.now() / 1000) + this.getTokenTtlSeconds(),
      }),
      user,
    };
  }

  private signToken(payload: TokenPayload) {
    const header = { alg: 'HS256', typ: 'JWT' };
    const encodedHeader = this.base64UrlEncode(JSON.stringify(header));
    const encodedPayload = this.base64UrlEncode(JSON.stringify(payload));
    const data = `${encodedHeader}.${encodedPayload}`;
    const signature = this.createSignature(data);
    return `${data}.${signature}`;
  }

  private verifyToken(token: string): TokenPayload {
    const [encodedHeader, encodedPayload, signature] = token.split('.');
    if (!encodedHeader || !encodedPayload || !signature) {
      throw new UnauthorizedException('Invalid token');
    }

    const data = `${encodedHeader}.${encodedPayload}`;
    const expectedSignature = this.createSignature(data);
    const actualBuffer = Buffer.from(signature);
    const expectedBuffer = Buffer.from(expectedSignature);

    if (
      actualBuffer.length !== expectedBuffer.length ||
      !timingSafeEqual(actualBuffer, expectedBuffer)
    ) {
      throw new UnauthorizedException('Invalid token signature');
    }

    const payload = JSON.parse(this.base64UrlDecode(encodedPayload)) as TokenPayload;
    if (!payload.exp || payload.exp <= Math.floor(Date.now() / 1000)) {
      throw new UnauthorizedException('Token has expired');
    }

    return payload;
  }

  private createSignature(data: string) {
    return createHmac('sha256', this.getSecret()).update(data).digest('base64url');
  }

  private base64UrlEncode(value: string) {
    return Buffer.from(value).toString('base64url');
  }

  private base64UrlDecode(value: string) {
    return Buffer.from(value, 'base64url').toString('utf8');
  }

  private getSecret() {
    return process.env.AUTH_SECRET || 'development-auth-secret-change-me';
  }

  private getTokenTtlSeconds() {
    return Number(process.env.AUTH_TOKEN_TTL_SECONDS || 60 * 60 * 24 * 7);
  }
}

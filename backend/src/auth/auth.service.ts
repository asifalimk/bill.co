import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { compare } from 'bcryptjs';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
  ) {}

  async login(username: string, password: string) {
    const user = await this.prisma.user.findUnique({
      where: { username: username.trim().toLowerCase() },
    });
    if (!user || !(await compare(password, user.password_hash))) {
      throw new UnauthorizedException('Invalid username or password.');
    }

    const accessToken = await this.jwt.signAsync({
      sub: user.id,
      username: user.username,
    });
    return {
      access_token: accessToken,
      expires_in: Number(this.config.get('JWT_EXPIRES_IN_SECONDS') ?? 900),
      user: {
        id: user.id,
        username: user.username,
        name: user.name,
        role: user.role,
      },
    };
  }
}

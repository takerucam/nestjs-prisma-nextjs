import { ForbiddenException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { AuthDto } from 'src/auth/dto/auth.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime';
import { Jwt, Msg } from 'src/auth/interfaces/auth.interface';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
  ) {}
  async signUp(dto: AuthDto): Promise<Msg> {
    // password のハッシュ化
    const hashed = await bcrypt.hash(dto.password, 12);
    // DB へ新規登録の処理
    try {
      await this.prisma.user.create({
        data: {
          email: dto.email,
          hashedPassword: hashed,
        },
      });
      return {
        message: 'ok',
      };
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new ForbiddenException('This email is already taken');
        }
      }
      throw error;
    }
  }

  // login
  async login(dto: AuthDto): Promise<Jwt> {
    // emailがDB上に存在するかチェック
    const user = await this.prisma.user.findUnique({
      where: {
        email: dto.email,
      },
    });
    // もしDBになければerrorを返す
    if (!user) throw new ForbiddenException('Email or password incorrect');
    // 引数の平文のパスワードとDBにあるハッシュ化されたパスワードを比較する
    const isVaild = await bcrypt.compare(dto.password, user.hashedPassword);
    // パスワードが違うのであればerrorを返す
    if (!isVaild) throw new ForbiddenException('Email or password incorrect');

    return this.generateJwt(user.id, user.email);
  }

  // JWT token の生成
  async generateJwt(userId: number, email: string): Promise<Jwt> {
    const payload = {
      sub: userId,
      email,
    };
    const secret = this.config.get('JWT_SECRET');
    const token = await this.jwt.signAsync(payload, {
      expiresIn: '5m',
      secret: secret,
    });
    return {
      accessToken: token,
    };
  }
}

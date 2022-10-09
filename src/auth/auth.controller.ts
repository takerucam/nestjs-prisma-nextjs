import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from 'src/auth/auth.service';
import { AuthDto } from 'src/auth/dto/auth.dto';
import { Msg } from 'src/auth/interfaces/auth.interface';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('signup')
  signUp(@Body() dto: AuthDto): Promise<Msg> {
    return this.authService.signUp(dto);
  }
}

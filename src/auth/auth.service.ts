import {
  HttpException,
  HttpStatus,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { UserService } from '../user/user.service';
import { CreateUsersDto } from '../user/create-user.dto';
import { JwtService } from '@nestjs/jwt';
import { UserDto } from 'src/user/user.dto';
import * as bcrypt from 'bcrypt';
import { LoginDto } from './login.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
  ) {}

  async signup(userDto: CreateUsersDto): Promise<UserDto> {
    const existingUser = await this.userService.getByEmail(userDto.email);
    if (existingUser) {
      throw new HttpException('User already exists', HttpStatus.FOUND);
    }
    return this.userService.createUser(userDto);
  }

  async login(loginDto: LoginDto): Promise<{ access_token: string }> {
    const existingUser = await this.userService.getByEmail(loginDto.username);
    if (
      !existingUser ||
      !(await this.isPasswordMatch(loginDto.password, existingUser.password))
    ) {
      throw new HttpException('Invalid credentials', HttpStatus.UNAUTHORIZED);
    }
    const payload = { username: loginDto.username, sub: existingUser.id };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }

  async validateUser(user: UserDto): Promise<UserDto> {
    const existingUser = await this.userService.getByEmail(user.email);
    if (
      !existingUser ||
      !(await this.isPasswordMatch(user.password, existingUser.password))
    ) {
      throw new UnauthorizedException();
    }
    return user;
  }

  private async isPasswordMatch(
    plainTextPassword: string,
    hashedPassword: string,
  ): Promise<boolean> {
    return bcrypt.compare(plainTextPassword, hashedPassword);
  }
}

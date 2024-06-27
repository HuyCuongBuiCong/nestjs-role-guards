import {
  IsNumberString,
  IsNotEmpty,
  IsArray,
  IsString,
  IsEmail,
} from 'class-validator';
import { RoleDto } from './role.dto';

export class UserDto {
  @IsNumberString()
  id: number;

  @IsNotEmpty()
  name: string;

  @IsEmail()
  email: string;

  @IsString()
  password: string;

  @IsArray()
  roles: RoleDto[];
}

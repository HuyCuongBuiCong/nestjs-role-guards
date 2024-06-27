import { OmitType } from '@nestjs/mapped-types';
import { UserDto } from './user.dto';

export class CreateUsersDto extends OmitType(UserDto, ['id']) {}

import { IsNumberString, IsNotEmpty } from 'class-validator';

export class RoleDto {
  @IsNumberString()
  id: number;

  @IsNotEmpty()
  name: string;
}

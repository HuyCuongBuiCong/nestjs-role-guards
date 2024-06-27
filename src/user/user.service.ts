import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateUsersDto } from './create-user.dto';
import { UserDto } from './user.dto';
import * as bcrypt from 'bcrypt';
import { UserEntity } from '../common/user.entity';
import { RoleEntity } from '../common/role.entity';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(UserEntity)
    private userRepository: Repository<UserEntity>,
    @InjectRepository(RoleEntity)
    private roleRepository: Repository<RoleEntity>,
  ) {}

  async getAll() {
    return await this.userRepository.find();
  }

  async getById(id: number) {
    return await this.userRepository.findOne({
      where: { id },
    });
  }

  async getByEmail(email: string) {
    return await this.userRepository.findOne({
      where: { email },
    });
  }

  async createUser(user: CreateUsersDto) {
    const userEntity = new UserEntity();
    userEntity.user_name = user.name;
    userEntity.email = user.email;
    userEntity.password = await bcrypt.hash(user.password, 10);
    if (user.roles?.length > 0) {
      userEntity.roles = [];
      await Promise.all(
        user.roles.map(async (role) => {
          const roleEntity = await this.addOrGetRole(role.name);
          userEntity.roles.push(roleEntity);
        }),
      );
    }

    const newUserEntity = await this.userRepository.save(userEntity);
    return {
      name: newUserEntity.user_name,
      email: newUserEntity.email,
      id: newUserEntity.id,
    } as UserDto;
  }

  private async addOrGetRole(roleName: string) {
    const roleEntity = await this.roleRepository.findOne({
      where: { name: roleName },
    });
    if (!roleEntity) {
      const newRole = new RoleEntity();
      newRole.name = roleName;
      return newRole;
    }
    return roleEntity;
  }
}

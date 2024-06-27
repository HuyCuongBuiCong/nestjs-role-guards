import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { CreateUsersDto } from './create-user.dto';
import { UserDto } from './user.dto';
import { RoleEntity } from '../src/common/role.entity';
import { UserEntity } from '../src/common/user.entity';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
    @InjectRepository(RoleEntity)
    private readonly roleRepository: Repository<RoleEntity>,
  ) {}

  async getAll(): Promise<UserEntity[]> {
    return this.userRepository.find();
  }

  async getById(id: number): Promise<UserEntity | undefined> {
    return this.userRepository.findOne({
      where: { id },
    });
  }

  async getByEmail(email: string): Promise<UserEntity | undefined> {
    return this.userRepository.findOne({
      where: { email },
    });
  }

  async createUser(user: CreateUsersDto): Promise<UserDto> {
    const userEntity = new UserEntity();
    userEntity.user_name = user.name;
    userEntity.email = user.email;
    userEntity.password = await bcrypt.hash(user.password, 10);

    if (user.roles?.length > 0) {
      userEntity.roles = [];
      for (const role of user.roles) {
        const roleEntity = await this.addOrGetRole(role.name);
        userEntity.roles.push(roleEntity);
      }
    }

    const newUserEntity = await this.userRepository.save(userEntity);
    return {
      name: newUserEntity.user_name,
      email: newUserEntity.email,
      id: newUserEntity.id,
    } as UserDto;
  }

  private async addOrGetRole(roleName: string): Promise<RoleEntity> {
    let roleEntity = await this.roleRepository.findOne({
      where: { name: roleName },
    });
    if (!roleEntity) {
      roleEntity = this.roleRepository.create({ name: roleName });
      await this.roleRepository.save(roleEntity);
    }
    return roleEntity;
  }
}

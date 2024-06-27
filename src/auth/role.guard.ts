import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { RoleEntity } from 'src/common/role.entity';

@Injectable()
export class RoleGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  matchRoles(roles: string[], userRoles: RoleEntity[]) {
    return roles?.some((role) =>
      userRoles.find((x) => x.name.toLowerCase() === role.toLowerCase()),
    );
  }

  canActivate(context: ExecutionContext): boolean {
    const handlerRoles = this.reflector.get<string[]>(
      'roles',
      context.getHandler(),
    );
    const classRoles = this.reflector.get<string[]>(
      'roles',
      context.getClass(),
    );
    const roles = (handlerRoles ?? []).concat(classRoles ?? []);
    if (roles.length === 0) {
      return true;
    }
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    return this.matchRoles(roles, user.roles);
  }
}

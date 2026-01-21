import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

// roles.guard.ts - Update to handle both cases
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.get<string[]>('roles', context.getHandler());
    if (!requiredRoles) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;
    
    if (!user || !user.role) {
      return false;
    }

    // Convert both to lowercase for case-insensitive comparison
    const userRole = user.role.toLowerCase();
    const normalizedRequiredRoles = requiredRoles.map(role => role.toLowerCase());
    
    return normalizedRequiredRoles.includes(userRole);
  }
}

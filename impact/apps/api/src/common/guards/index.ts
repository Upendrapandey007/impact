import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import type { UserRole } from '@impact/types';

import { IS_PUBLIC_KEY, ROLES_KEY, type AuthUser } from '../decorators/index';

// ─── JWT Auth Guard ───────────────────────────────────────────────────────────

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly reflector: Reflector,
  ) {}

  canActivate(context: ExecutionContext): boolean {
    // Allow public routes
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) return true;

    const request = context.switchToHttp().getRequest<{
      headers: { authorization?: string };
      user: AuthUser;
      tenantId: string;
    }>();

    const token = this.extractToken(request.headers.authorization);
    if (!token) throw new UnauthorizedException('No authentication token provided');

    try {
      const payload = this.jwtService.verify<AuthUser & { sub: string }>(token, {
        secret: process.env['JWT_SECRET'],
      });

      request.user = {
        id: payload.sub ?? payload.id,
        institutionId: payload.institutionId,
        email: payload.email,
        name: payload.name,
        role: payload.role,
      };

      // Inject tenantId for TenantGuard downstream
      request.tenantId = payload.institutionId;

      return true;
    } catch {
      throw new UnauthorizedException('Invalid or expired token');
    }
  }

  private extractToken(authHeader?: string): string | null {
    if (!authHeader?.startsWith('Bearer ')) return null;
    return authHeader.slice(7);
  }
}

// ─── Roles Guard ─────────────────────────────────────────────────────────────

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles || requiredRoles.length === 0) return true;

    const request = context.switchToHttp().getRequest<{ user: AuthUser }>();
    const { user } = request;

    if (!user) throw new UnauthorizedException();

    if (!requiredRoles.includes(user.role)) {
      throw new ForbiddenException(
        `This action requires one of the following roles: ${requiredRoles.join(', ')}`,
      );
    }

    return true;
  }
}

// ─── Tenant Guard ─────────────────────────────────────────────────────────────
// Enforces that all queries are scoped to the user's institution.
// The tenantId is injected by JwtAuthGuard.

@Injectable()
export class TenantGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const isPublic = false; // Always enforce tenant for non-public routes

    const request = context.switchToHttp().getRequest<{
      user?: AuthUser;
      tenantId?: string;
      params?: { institutionId?: string };
    }>();

    if (!request.user || !request.user.institutionId) {
      throw new UnauthorizedException('Tenant context missing');
    }

    // If a specific institutionId is in path params, ensure it matches
    // (super_admin can cross tenants)
    if (
      request.params?.institutionId &&
      request.user.role !== 'super_admin' &&
      request.params.institutionId !== request.user.institutionId
    ) {
      throw new ForbiddenException('Access denied: cross-tenant access not allowed');
    }

    return true;
  }
}

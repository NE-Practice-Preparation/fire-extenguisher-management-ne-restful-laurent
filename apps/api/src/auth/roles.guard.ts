import { CanActivate, ExecutionContext, Injectable } from "@nestjs/common"
import { Reflector } from "@nestjs/core"
import { UserRole } from "@workspace/db"

import { JwtUser } from "./jwt-auth.guard"
import { ROLES_KEY } from "./roles"

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext) {
    const roles = this.reflector.getAllAndOverride<UserRole[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ])

    if (!roles?.length) {
      return true
    }

    const request = context.switchToHttp().getRequest<{ user?: JwtUser }>()
    return !!request.user && roles.includes(request.user.role)
  }
}

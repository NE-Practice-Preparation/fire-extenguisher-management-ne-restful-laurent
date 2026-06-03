import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common"
import { JwtService } from "@nestjs/jwt"
import { UserRole } from "@workspace/db"

export type JwtUser = {
  sub: string
  email: string
  role: UserRole
  firstName: string
  lastName: string
}

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private readonly jwtService: JwtService) {}

  async canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest<{
      headers: { authorization?: string }
      user?: JwtUser
    }>()
    const authorization = request.headers.authorization

    if (!authorization?.startsWith("Bearer ")) {
      throw new UnauthorizedException("Missing bearer token")
    }

    try {
      request.user = await this.jwtService.verifyAsync<JwtUser>(
        authorization.slice("Bearer ".length)
      )
      return true
    } catch {
      throw new UnauthorizedException("Invalid or expired token")
    }
  }
}

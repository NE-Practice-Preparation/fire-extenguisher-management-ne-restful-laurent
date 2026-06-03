import { ApiProperty } from "@nestjs/swagger"
import { IsString, Matches, MaxLength, MinLength } from "class-validator"

import { STRONG_PASSWORD_MESSAGE, STRONG_PASSWORD_REGEX } from "../../common/password.constants"

export class ResetPasswordDto {
  @ApiProperty({ example: "a1b2c3d4e5f6...", description: "Reset token from the email link" })
  @IsString()
  @MinLength(10)
  token!: string

  @ApiProperty({ example: "NewStrongPass123!", minLength: 8 })
  @IsString()
  @MinLength(8)
  @MaxLength(72)
  @Matches(STRONG_PASSWORD_REGEX, { message: STRONG_PASSWORD_MESSAGE })
  newPassword!: string
}

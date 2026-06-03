import { ApiProperty } from "@nestjs/swagger"
import { IsString, Matches, MaxLength, MinLength } from "class-validator"

import { STRONG_PASSWORD_MESSAGE, STRONG_PASSWORD_REGEX } from "../../common/password.constants"

export class ChangePasswordDto {
  @ApiProperty({ example: "CurrentPass123!" })
  @IsString()
  @MinLength(8)
  @MaxLength(72)
  currentPassword!: string

  @ApiProperty({ example: "NewStrongPass123!", minLength: 8 })
  @IsString()
  @MinLength(8)
  @MaxLength(72)
  @Matches(STRONG_PASSWORD_REGEX, { message: STRONG_PASSWORD_MESSAGE })
  newPassword!: string
}

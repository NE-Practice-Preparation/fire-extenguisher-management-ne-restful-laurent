import { ApiProperty } from "@nestjs/swagger"
import { IsString, MaxLength, MinLength } from "class-validator"

export class ResetPasswordDto {
  @ApiProperty({ example: "a1b2c3d4e5f6...", description: "Reset token from the email link" })
  @IsString()
  @MinLength(10)
  token!: string

  @ApiProperty({ example: "NewStrongPass123!", minLength: 8 })
  @IsString()
  @MinLength(8)
  @MaxLength(72)
  newPassword!: string
}

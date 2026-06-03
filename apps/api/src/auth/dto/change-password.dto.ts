import { ApiProperty } from "@nestjs/swagger"
import { IsString, MaxLength, MinLength } from "class-validator"

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
  newPassword!: string
}

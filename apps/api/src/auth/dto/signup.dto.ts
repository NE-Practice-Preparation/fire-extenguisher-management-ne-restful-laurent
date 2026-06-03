import { ApiProperty } from "@nestjs/swagger"
import { UserRole } from "@workspace/db"
import { IsEmail, IsEnum, IsOptional, IsString, MinLength } from "class-validator"

export class SignupDto {
  @ApiProperty({ example: "Alice" })
  @IsString()
  @MinLength(2)
  firstName!: string

  @ApiProperty({ example: "Uwase" })
  @IsString()
  @MinLength(2)
  lastName!: string

  @ApiProperty({ example: "user@example.com" })
  @IsEmail()
  email!: string

  @ApiProperty({ example: "StrongPass123!" })
  @IsString()
  @MinLength(8)
  password!: string

  @ApiProperty({ enum: UserRole, required: false, default: UserRole.ROLE2 })
  @IsOptional()
  @IsEnum(UserRole)
  role?: UserRole
}

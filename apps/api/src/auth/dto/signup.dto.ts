import { ApiProperty } from "@nestjs/swagger"
import { IsEmail, IsString, MaxLength, MinLength } from "class-validator"

export class SignupDto {
  @ApiProperty({ example: "Alice" })
  @IsString()
  @MinLength(2)
  @MaxLength(50)
  firstName!: string

  @ApiProperty({ example: "Uwase" })
  @IsString()
  @MinLength(2)
  @MaxLength(50)
  lastName!: string

  @ApiProperty({ example: "user@example.com" })
  @IsEmail()
  email!: string

  @ApiProperty({ example: "StrongPass123!", minLength: 8 })
  @IsString()
  @MinLength(8)
  @MaxLength(72)
  password!: string
}

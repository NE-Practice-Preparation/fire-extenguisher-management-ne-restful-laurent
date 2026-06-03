import { ApiPropertyOptional } from "@nestjs/swagger"
import { IsEmail, IsOptional, IsString, MaxLength, MinLength } from "class-validator"

export class UpdateUserDto {
  @ApiPropertyOptional({ example: "Alice" })
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(50)
  firstName?: string

  @ApiPropertyOptional({ example: "Uwase" })
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(50)
  lastName?: string

  @ApiPropertyOptional({ example: "new.email@ne.rw" })
  @IsOptional()
  @IsEmail()
  email?: string
}

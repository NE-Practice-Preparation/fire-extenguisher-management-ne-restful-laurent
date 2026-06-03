import { ApiProperty } from "@nestjs/swagger"
import { UserRole } from "@workspace/db"
import { IsEmail, IsIn, IsString, MaxLength, MinLength } from "class-validator"

/**
 * Admin-created accounts. The admin never sets a password: the new user
 * receives an invite email with a link to set their own password.
 * ADMIN cannot be created here (there is exactly one, seeded admin).
 */
export class CreateUserDto {
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

  @ApiProperty({ example: "inspector@ne.rw" })
  @IsEmail()
  email!: string

  @ApiProperty({ enum: [UserRole.USER, UserRole.INSPECTOR], example: UserRole.INSPECTOR })
  @IsIn([UserRole.USER, UserRole.INSPECTOR], {
    message: "role must be either USER or INSPECTOR",
  })
  role!: typeof UserRole.USER | typeof UserRole.INSPECTOR
}

import { ApiPropertyOptional } from "@nestjs/swagger"
import { UserRole } from "@workspace/db"
import { Transform, Type } from "class-transformer"
import { IsBoolean, IsEnum, IsInt, IsOptional, IsString, Max, Min } from "class-validator"

export class QueryUsersDto {
  @ApiPropertyOptional({ default: 1, minimum: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page: number = 1

  @ApiPropertyOptional({ default: 10, minimum: 1, maximum: 100 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit: number = 10

  @ApiPropertyOptional({ description: "Search by first name, last name, or email" })
  @IsOptional()
  @IsString()
  search?: string

  @ApiPropertyOptional({ enum: UserRole })
  @IsOptional()
  @IsEnum(UserRole)
  role?: UserRole

  @ApiPropertyOptional({ description: "Filter by active state" })
  @IsOptional()
  @Transform(({ value }) => (value === "true" ? true : value === "false" ? false : value))
  @IsBoolean()
  isActive?: boolean
}

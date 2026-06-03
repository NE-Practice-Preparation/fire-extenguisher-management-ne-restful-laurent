import { ApiPropertyOptional } from "@nestjs/swagger"
import { ExtinguisherStatus, ExtinguisherType } from "@workspace/db"
import { Type } from "class-transformer"
import { IsEnum, IsInt, IsOptional, IsString, Max, Min } from "class-validator"

export class QueryExtinguishersDto {
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

  @ApiPropertyOptional({ description: "Search by serial number or location" })
  @IsOptional()
  @IsString()
  search?: string

  @ApiPropertyOptional({ enum: ExtinguisherType })
  @IsOptional()
  @IsEnum(ExtinguisherType)
  type?: ExtinguisherType

  @ApiPropertyOptional({ enum: ExtinguisherStatus })
  @IsOptional()
  @IsEnum(ExtinguisherStatus)
  status?: ExtinguisherStatus
}

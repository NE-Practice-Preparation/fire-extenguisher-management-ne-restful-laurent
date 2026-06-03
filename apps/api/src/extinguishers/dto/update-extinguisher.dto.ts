import { ApiPropertyOptional } from "@nestjs/swagger"
import { ExtinguisherStatus, ExtinguisherType } from "@workspace/db"
import { IsDateString, IsEnum, IsIn, IsOptional, IsString, MaxLength, MinLength } from "class-validator"

import { EXTINGUISHER_SIZES } from "./create-extinguisher.dto"

// Standalone (not PartialType) so updating a record with an already-past
// installation date is allowed; we only enforce format/allowed values here.
export class UpdateExtinguisherDto {
  @ApiPropertyOptional({ example: "FE-2026-0001" })
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(60)
  serialNumber?: string

  @ApiPropertyOptional({ example: "Building A - Floor 2, Corridor" })
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(120)
  location?: string

  @ApiPropertyOptional({ enum: ExtinguisherType })
  @IsOptional()
  @IsEnum(ExtinguisherType)
  type?: ExtinguisherType

  @ApiPropertyOptional({ enum: EXTINGUISHER_SIZES })
  @IsOptional()
  @IsIn(EXTINGUISHER_SIZES, { message: `size must be one of: ${EXTINGUISHER_SIZES.join(", ")}` })
  size?: string

  @ApiPropertyOptional({ example: "2026-07-01" })
  @IsOptional()
  @IsDateString()
  installationDate?: string

  @ApiPropertyOptional({ example: "2027-07-01" })
  @IsOptional()
  @IsDateString()
  expiryDate?: string

  @ApiPropertyOptional({ enum: ExtinguisherStatus })
  @IsOptional()
  @IsEnum(ExtinguisherStatus)
  status?: ExtinguisherStatus
}

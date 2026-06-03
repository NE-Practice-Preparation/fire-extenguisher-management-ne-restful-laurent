import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger"
import { ExtinguisherStatus, ExtinguisherType } from "@workspace/db"
import { IsDateString, IsEnum, IsIn, IsOptional, IsString, MaxLength, MinLength } from "class-validator"

import { IsNotPastDate } from "../../common/validators/is-not-past-date.validator"

export const EXTINGUISHER_SIZES = ["2.5lbs", "5lbs", "9lbs", "12lbs"] as const

export class CreateExtinguisherDto {
  @ApiProperty({ example: "FE-2026-0001" })
  @IsString()
  @MinLength(2)
  @MaxLength(60)
  serialNumber!: string

  @ApiProperty({ example: "Building A - Floor 2, Corridor" })
  @IsString()
  @MinLength(2)
  @MaxLength(120)
  location!: string

  @ApiProperty({ enum: ExtinguisherType, example: ExtinguisherType.CO2 })
  @IsEnum(ExtinguisherType)
  type!: ExtinguisherType

  @ApiProperty({ enum: EXTINGUISHER_SIZES, example: "5lbs" })
  @IsIn(EXTINGUISHER_SIZES, { message: `size must be one of: ${EXTINGUISHER_SIZES.join(", ")}` })
  size!: string

  @ApiProperty({ example: "2026-07-01", description: "Installation date (ISO, today or later)" })
  @IsDateString()
  @IsNotPastDate({ message: "Installation date cannot be in the past" })
  installationDate!: string

  @ApiProperty({ example: "2027-07-01", description: "Expiry date (ISO, today or later)" })
  @IsDateString()
  @IsNotPastDate({ message: "Expiry date cannot be in the past" })
  expiryDate!: string

  @ApiPropertyOptional({ enum: ExtinguisherStatus, default: ExtinguisherStatus.ACTIVE })
  @IsOptional()
  @IsEnum(ExtinguisherStatus)
  status?: ExtinguisherStatus
}

import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger"
import { ExtinguisherStatus, ExtinguisherType } from "@workspace/db"
import { IsDateString, IsEnum, IsOptional, IsString, MaxLength, MinLength } from "class-validator"

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

  @ApiProperty({ example: "6kg" })
  @IsString()
  @MinLength(1)
  @MaxLength(30)
  size!: string

  @ApiProperty({ example: "2026-01-15", description: "Installation date (ISO)" })
  @IsDateString()
  installationDate!: string

  @ApiProperty({ example: "2027-01-15", description: "Expiry date (ISO)" })
  @IsDateString()
  expiryDate!: string

  @ApiPropertyOptional({ enum: ExtinguisherStatus, default: ExtinguisherStatus.ACTIVE })
  @IsOptional()
  @IsEnum(ExtinguisherStatus)
  status?: ExtinguisherStatus
}

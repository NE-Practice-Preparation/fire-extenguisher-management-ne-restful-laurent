import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger"
import { IsDateString, IsOptional, IsString, Matches, MaxLength, MinLength } from "class-validator"

export class CreateInspectionDto {
  @ApiProperty({ example: "clx...", description: "Extinguisher id to inspect" })
  @IsString()
  @MinLength(1)
  extinguisherId!: string

  @ApiProperty({ example: "2026-07-01", description: "Scheduled date (ISO)" })
  @IsDateString()
  scheduledDate!: string

  @ApiProperty({ example: "14:30", description: "Scheduled time (HH:mm)" })
  @Matches(/^([01]\d|2[0-3]):[0-5]\d$/, { message: "scheduledTime must be in HH:mm format" })
  scheduledTime!: string

  @ApiPropertyOptional({ example: "Quarterly check" })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  notes?: string
}

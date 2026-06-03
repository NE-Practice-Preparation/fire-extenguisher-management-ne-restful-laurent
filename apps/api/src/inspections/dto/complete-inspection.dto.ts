import { ApiProperty } from "@nestjs/swagger"
import { IsDateString, IsString, MaxLength, MinLength } from "class-validator"

export class CompleteInspectionDto {
  @ApiProperty({ example: "Checked pressure gauge, cleaned nozzle, replaced safety pin." })
  @IsString()
  @MinLength(3)
  @MaxLength(1000)
  actionsTaken!: string

  @ApiProperty({ example: "2026-07-01", description: "Date when maintenance was performed" })
  @IsDateString()
  actionDate!: string

  @ApiProperty({ example: "Pressure nominal. Minor dust on cylinder body." })
  @IsString()
  @MinLength(3)
  @MaxLength(1000)
  conditionsNoted!: string
}

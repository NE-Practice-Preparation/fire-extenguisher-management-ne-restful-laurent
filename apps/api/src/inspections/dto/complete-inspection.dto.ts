import { ApiPropertyOptional } from "@nestjs/swagger"
import { IsOptional, IsString, MaxLength } from "class-validator"

export class CompleteInspectionDto {
  @ApiPropertyOptional({ example: "All good, pressure nominal." })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  notes?: string
}

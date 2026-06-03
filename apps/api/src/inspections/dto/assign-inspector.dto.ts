import { ApiProperty } from "@nestjs/swagger"
import { IsString, MinLength } from "class-validator"

export class AssignInspectorDto {
  @ApiProperty({ description: "Inspector user id to assign" })
  @IsString()
  @MinLength(1)
  assignedInspectorId!: string
}

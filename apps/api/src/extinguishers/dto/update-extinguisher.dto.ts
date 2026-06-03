import { PartialType } from "@nestjs/swagger"

import { CreateExtinguisherDto } from "./create-extinguisher.dto"

export class UpdateExtinguisherDto extends PartialType(CreateExtinguisherDto) {}

import { Module } from "@nestjs/common";
import { AiController } from "./ai.controller";
import { AiService } from "./ai.service";
import { DataService } from "src/customService/data.service";

@Module({
    controllers: [AiController],
    providers: [AiService, DataService],
})
export class AiModule {}
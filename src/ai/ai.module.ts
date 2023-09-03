import { Module } from "@nestjs/common";
import { AiController } from "./ai.controller";
import { AiService } from "./ai.service";
import { DataService } from "src/customService/data.service";
import { SettingsService } from "src/settings/settings.service";

@Module({
    controllers: [AiController],
    providers: [AiService, DataService, SettingsService],
})
export class AiModule {}
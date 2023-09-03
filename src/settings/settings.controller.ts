import { Body, Controller, Get, Post, Render, Res } from "@nestjs/common";
import { Response } from "express";
import { SettingsService } from "./settings.service";

@Controller('settings')
export class SettingsController {
    constructor(private readonly settingsService: SettingsService) {}

    @Get()
    @Render('user/settings')
    async get_settings(){
        const settings = await this.settingsService.get_custom_settings()

        return {
            title: 'Ayarlar',
            settings: settings
        }
    }

    @Post('/addOrUpdate')
    async post_add_and_update(@Body() body:any, @Res() res: Response){
        const save_or_update = await this.settingsService.get_add_or_update(body)

        if (save_or_update){
            return res.send(200)
        }

        return res.send(500)
    }
}
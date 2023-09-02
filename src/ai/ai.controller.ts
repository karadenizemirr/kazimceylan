import { Body, Controller, Get, Param, Post, Render, Res } from "@nestjs/common";
import { AiService } from "./ai.service";
import { Response } from "express";

@Controller('scenario')
export class AiController {
    constructor(private aiService: AiService) {}
    
    
    @Get('/:id?')
    @Render('scenario')
    async getScenario(@Param('id') id:string){
        const briefs = await this.aiService.get_briefs_by_id(id)
        console.log(briefs)
      return {
        title: 'Senaryo Oluştur',
        briefs: briefs
      }
    }

    // --------------------------------------------------------------------------------------------
    // --------------------------------------------------------------------------------------------
    // --------------------------------------------------------------------------------------------

    @Post('create')
    async create_scenario(@Body() data:any, @Res() res:Response){
        const result = await this.aiService.createScenario(data)
        if (result){
            return res.status(200).send(result)
        }
    }

    @Get('briefs')
    @Render('briefs')
    async get_brifies(){

        const briefs = await this.aiService.get_briefs()
        return {
            title: 'Briefs',
            briefs: briefs
        }
    }

    @Get('briefs/delete/:id')
    async delete_briefs(@Res() res:Response, @Param('id') id:string){
        const result = await this.aiService.delete_briefs(id)
        if (result){
            res.redirect(302, '/scenario/briefs')
        }
    }

    @Post('briefs/update/:id')
    async update_briefs(@Res() res:Response, @Param('id') id:string, @Body() data:any){
        const update = await this.aiService.update_briefs(id, data)
        return res.status(200)
    }

    // --------------------------------------------------------------------------------------------
    // --------------------------------------------------------------------------------------------
    // --------------------------------------------------------------------------------------------

    @Get('hooks')
    @Render('hook')
    async get_hooks(){
        const hooks = await this.aiService.get_hooks()
        return {
            title: 'Kanca Cümleler',
            hooks: hooks
        }
    }

    @Get('hooks/delete/:id')
    async delete_hook(@Res() res:Response, @Param('id') id:string){
        const result = await this.aiService.delete_hook(id)
        if (result){
            res.redirect(302, '/scenario/hooks')
        }
    }


}
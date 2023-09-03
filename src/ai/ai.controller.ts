import { Body, Controller, Get, Param, Post, Render, Res, UseGuards } from "@nestjs/common";
import { AiService } from "./ai.service";
import { Response } from "express";
import { AuthGuard } from "src/auth/auth.guard";


@UseGuards(AuthGuard)
@Controller('scenario')
export class AiController {
    constructor(private aiService: AiService) {}
    

    @Get('/:id?')
    @Render('scenario')
    async getScenario(@Param('id') id:string){
        if (id){
            const briefs = await this.aiService.get_briefs_by_id(id)
            return {
              title: 'Senaryo Oluştur',
              briefs: briefs
            }
        }

        return {
            title: 'Senaryo Oluştur',
            briefs: []
        }
    }

    // --------------------------------------------------------------------------------------------
    // --------------------------------------------------------------------------------------------
    // --------------------------------------------------------------------------------------------

    @Post('create')
    async create_breifs(@Body() data:any, @Res() res:Response){

        const custom_prompt = `Verdiğim bu bilgilere göre bir seslendirme metni yazmanı istiyorum.Herhangi bir kurgu ya da storyline istemiyorum.
        Her animasyon seslendirme metninin başında, animasyon videonun sonuna kadar 
        izletebilmesi ve dikkatleri çekebilmesi için dikkat çekici bir cümle kurulması gerekmektedir. Ortalama ilk 10-15 kelime dikkatleri çekebileceğimiz en önemli kelimelerdir.
        Seslendirme metinleri resmi, espirili, kreatif olacak. Bunu yukarıda verdiğim metin yazı tonu kısmında belirttim. Senden istediğim 
        birbirinden farklı 5 adet maksimum 15 kelimelik seslendirme cümleleri oluşturman. Başka bir metin uzunluğu burada kabul etme.`

        const result = await this.aiService.createHooks(data, custom_prompt)
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
    
    // --------------------------------------------------------------------------------------------
    // --------------------------------------------------------------------------------------------
    // --------------------------------------------------------------------------------------------
    
    @Post('add')
    async add_scenario(@Body() data:any, @Res() res:Response){
        const result = await this.aiService.createScenario(data)
        if (result){
            return res.status(200).send(result)
        }

    }

    @Get('all')
    @Render('scenarios')
    async get_secanrios(@Res() res:Response){
        const scenarios = await this.aiService.get_scenarios()
        return {
            title: 'Senaryolar',
            scenarios: scenarios
        }
    }

    @Get('delete/:id')
    async delete_scenario(@Res() res:Response, @Param('id') id:string){
        const result = await this.aiService.delete_scenario(id)
        if (result){
            res.redirect(302, '/scenario/all')
        }
    }
}
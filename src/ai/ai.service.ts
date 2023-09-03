import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import {OpenAI } from "openai";
import { AppDataSource } from "src/customService/mysql.service";
import { Brief } from "src/models/brief.model";
import { Hook } from "src/models/hook.model";
import { Scenario } from "src/models/scenario.model";


@Injectable()
export class AiService {
    private openApiKey:string
    private model:string
    private openai: OpenAI;
    private hookRepository:any
    private briefRepository:any
    private scenarioRepository:any

    constructor(private configService: ConfigService) {

        this.openApiKey = this.configService.get<string>('OPEN_API_KEY')
        this.model = this.configService.get<string>('MODEL')
        this.openai = new OpenAI({
            apiKey: this.openApiKey,
        });

        this.hookRepository = AppDataSource.getRepository(Hook)
        this.briefRepository = AppDataSource.getRepository(Brief)
        this.scenarioRepository = AppDataSource.getRepository(Scenario)
    }
    
    async createHooks(params: any, custom_prompt:string): Promise<any> {
        try{
            const gptPrompt = `
                Şirket veya kişi ismi: ${params.company_name}
                Müşteri hizmet mi yoksa ürün mü satıyor?: ${params.product}
                Çözüm getirilen sorun: ${params.product_description}
                Somut ihtiyaç: ${params.concrete_need}
                Soyut ihtiyaç: ${params.abstract_need}
                Hizmet yada ürün özellikleri: ${params.product_properties}
                Hizmet ya da ürün avantajları: ${params.product_advantages}
                Vadedilen kazanımlar: ${params.gains}
                Yönlendirme yapılacak yer: ${params.redirect}
                Videoyu izleyenlerden beklenen davranış ve onları harekere geçirici söylem: ${params.behaviour}
                Animasyonun süresi: ${params.animation_delay}
                Yapılacak animasyon videosunun genel konu özeti: ${params.summary}
                Hedef kitle: ${params.target_audience}
                Hedef kitleye hitap dili: ${params.target_language}
                Animasyon video yapılacak şirketin sektörü: ${params.company_sector}
                Seslendirme türü: ${params.volume_type}
                Metin yazı tonu: ${params.font}
                ${custom_prompt}
            `
            const response = await this.openai.chat.completions.create(
                {
                    messages: [
                        {
                            role: 'user',
                            content: gptPrompt
                        }
                    ],
                    model: this.model,
                    temperature: 0.9,
                    n:5,
                    max_tokens: 100,
                    stop: ['\n'],
                }
            )
            
            if (response.choices){

                const hooks = []

                const brief = new Brief()
                brief.company_name = params.company_name
                brief.product = params.product
                brief.product_description = params.product_description
                brief.concrete_need = params.concrete_need
                brief.abstract_need = params.abstract_need
                brief.product_properties = params.product_properties
                brief.product_advantage = params.product_advantage
                brief.gains = params.gains
                brief.redirect_url = params.redirect_url
                brief.behaviour = params.behaviour
                brief.animation_delay = params.animation_delay
                brief.summary = params.summary
                brief.target_group = params.target_group
                brief.target_language = params.target_language
                brief.company_sector = params.company_sector
                brief.volume_type = params.volume_type
                brief.font = params.font
                
                
                if (params.id){
                    brief.id = params.id
                    await this.briefRepository.update(params.id, brief)
                }else {
                    brief.hooks = hooks
                    await this.briefRepository.save(brief)
                }

                for (const choice of response.choices){
                    const text = choice.message.content
                    const hook = new Hook()
                    hook.text = text.replace('"', '').replace('1.', '')
                    hook.brief = brief
                    hooks.push(hook)
                    await this.hookRepository.save(hook)
                }
                return response.choices
            }
            
        }catch(err){
            console.log(err)
        }
    }

    async createScenario(params: any, custom_prompt:string): Promise<any> {
        try{
            const gptPrompt = `
                Şirket veya kişi ismi: ${params.company_name}
                Müşteri hizmet mi yoksa ürün mü satıyor?: ${params.product}
                Çözüm getirilen sorun: ${params.product_description}
                Somut ihtiyaç: ${params.concrete_need}
                Soyut ihtiyaç: ${params.abstract_need}
                Hizmet yada ürün özellikleri: ${params.product_properties}
                Hizmet ya da ürün avantajları: ${params.product_advantages}
                Vadedilen kazanımlar: ${params.gains}
                Yönlendirme yapılacak yer: ${params.redirect}
                Videoyu izleyenlerden beklenen davranış ve onları harekere geçirici söylem: ${params.behaviour}
                Animasyonun süresi: ${params.animation_delay}
                Yapılacak animasyon videosunun genel konu özeti: ${params.summary}
                Hedef kitle: ${params.target_audience}
                Hedef kitleye hitap dili: ${params.target_language}
                Animasyon video yapılacak şirketin sektörü: ${params.company_sector}
                Seslendirme türü: ${params.volume_type}
                Metin yazı tonu: ${params.font}
                ${custom_prompt}
            `
            const response = await this.openai.chat.completions.create(
                {
                    messages: [
                        {
                            role: 'user',
                            content: gptPrompt
                        }
                    ],
                    model: this.model,
                    stop: ['\n'],
                }
            )
            const text = response.choices[0].message.content
            const scenario = new Scenario()
            scenario.text = text.replace('"', '').replace('1.', '')
            scenario.brief = params.id
            await this.scenarioRepository.save(scenario)
            
            return response.choices
        }catch(err){
            console.log(err)
        }
    }

    async get_briefs(): Promise<any> {
        try{
            const briefs = await this.briefRepository.find({relations: ['hooks'], order: {created_at: 'DESC'}})
            return briefs
        }catch(err){
            console.log(err)
        }
    }

    async get_briefs_by_id(id: string): Promise<any> {
        try{
            const brief = await this.briefRepository.findOne(
                {
                    where: {
                        id: id
                    },
                    relations: ['hooks']
                }
            )
            return brief
        }catch(err){
            console.log(err)
        }
    }

    async delete_briefs(id: string): Promise<any> {
        try{
            const brief = await this.briefRepository.findOne(
                {
                    where: {
                        id: id
                    }
                }
            )
            if (brief){
                await this.briefRepository.delete(id)
                return {
                    message: 'Brief deleted'
                }
            }
            throw new HttpException('Brief not found', HttpStatus.NOT_FOUND)
        }catch(err){
            console.log(err)
        }
    }

    async update_briefs(id: string, data: any): Promise<any> {
        try{
            const brief = await this.briefRepository.findOne(
                {
                    where: {
                        id: id
                    }
                }
            )
            if (brief){
                const updatedBrief = await this.briefRepository.update(id, data)
                return updatedBrief
            }
            throw new HttpException('Brief not found', HttpStatus.NOT_FOUND)
        }catch(err){
            console.log(err)
        }
    }

    // --------------------------------------------------------------------------------------------
    // --------------------------------------------------------------------------------------------
    // --------------------------------------------------------------------------------------------

    async get_hooks(): Promise<any> {
        try{
            const hooks = await this.hookRepository.find(
                {
                    relations: {
                        brief: true
                    },
                    order:{
                        created_at: 'DESC'
                    }
                }
            )
            return hooks
        }catch(err){
            console.log(err)
        }
    }

    async delete_hook(id:string){
        try{
            const hook = await this.hookRepository.findOne(
                {
                    where: {
                        id: id
                    }
                }
            )
            if (hook){
                await this.hookRepository.delete(id)
                return {
                    message: 'Hook deleted'
                }
            }
            throw new HttpException('Hook not found', HttpStatus.NOT_FOUND)
        }catch(err){
            console.log(err)
        }
    }

    async get_scenarios(){
        try{

            const scenarios = await this.scenarioRepository.find(
                {
                    relations: {
                        brief: true
                    },
                    order: {
                        created_at: 'DESC'
                    }
                }
            )

            return scenarios

        }catch(err){
            console.log(err)
        }
    }

    async delete_scenario(id:string){
        try{
            const scenario = await this.scenarioRepository.findOne(
                {
                    where: {
                        id: id
                    }
                }
            )
            if (scenario){
                await this.scenarioRepository.delete(id)
                return {
                    message: 'Scenario deleted'
                }
            }
            throw new HttpException('Scenario not found', HttpStatus.NOT_FOUND)

        }catch(err){
            console.log(err)
        }
    }
}
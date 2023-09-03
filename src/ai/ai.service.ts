import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import {OpenAI } from "openai";
import { ChatgptService } from "src/customService/chatgpt.service";
import { AppDataSource } from "src/customService/mysql.service";
import { Brief } from "src/models/brief.model";
import { Hook } from "src/models/hook.model";
import { Scenario } from "src/models/scenario.model";
import { SettingsService } from "src/settings/settings.service";


@Injectable()
export class AiService {
    private openApiKey:string
    private model:string
    private openai: OpenAI;
    private hookRepository:any
    private briefRepository:any
    private scenarioRepository:any

    constructor(private configService: ConfigService, private settingsService:SettingsService, private chatgptService:ChatgptService) {
        this.initializeRepository()
    }
    private async initializeRepository(){
        this.hookRepository = AppDataSource.getRepository(Hook)
        this.briefRepository = AppDataSource.getRepository(Brief)
        this.scenarioRepository = AppDataSource.getRepository(Scenario)
    }

    async createHooks(params: any, custom_prompt:string): Promise<any> {
        const settings_data = await this.settingsService.get_custom_settings()
        this.model = settings_data.openapi_model
        this.openApiKey = settings_data.openai_api_key
        
        this.openai = new OpenAI({
            apiKey: this.openApiKey,
        });

        try{
            const gptPrompt = `
                Şirket veya kişi ismi: ${params.company_name}
                Müşteri hizmet mi yoksa ürün mü satıyor?: ${params.product}
                Çözüm getirilen sorun: ${params.product_description}
                Hizmet yada ürün özellikleri: ${params.product_properties}
                Hizmet ya da ürün avantajları: ${params.product_advantages}
                Vadedilen kazanımlar: ${params.gains}
                Yönlendirme yapılacak yer: ${params.redirect}
                Videoyu izleyenlerden beklenen davranış ve onları harekere geçirici söylem: ${params.behaviour}
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
                brief.product_properties = params.product_properties
                brief.product_advantage = params.product_advantage
                brief.gains = params.gains
                brief.redirect_url = params.redirect_url
                brief.behaviour = params.behaviour
                brief.summary = params.summary
                brief.target_group = params.target_group
                brief.target_language = params.target_language
                brief.company_sector = params.company_sector
                brief.volume_type = params.volume_type
                brief.text_lenght = params.text_lenght
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

    async createScenario(params: any): Promise<any> {
        const settings_data = await this.settingsService.get_custom_settings()
        try{
            const lenght = params.text_lenght.split('-')
            
            const message = [
                {role: 'user', content: 'Öncelikle biz 2D video animasyonlar hazırlayan bir şirketiz.Kullanıcılardan aldığımız bilgiler doğrultusunda 2D animasyonlar hazırlıyoruz.'},
                {role: 'user', content: 'Bu animasyonları hazırlarken senaryo metinlerine ihtiyaç duyuyoruz. Seninle birlikte senaryo metinleri oluşturacağız.'},
                {role: 'user', content: 'Şimdi seninle metinleri oluştururken belirli kurallara göre oluşturmanı istiyorum bu kuralları seninle paylaşacağım'},
                {role: 'user' ,content: `Metin uzunluğu en az${lenght[0]} kelime ile ${lenght[1]} kelime arasında olmalıdır.`},
                {role: 'user', content: `Metinin giriş cümlesi ${params.hook_centes} olmalıdır. Bu cümleyi daha duygusal bir biçimde yazabilirsin.`},
                {role: 'user', content: 'Şirketin ismi: ' + params.company_name},
                {role: 'user', content: 'Şirketin Ürettiği Ürünler: ' + params.product},
                {role: 'user', content: 'Şirketin ürününün açıklması: ' + params.product_description},
                {role: 'user', content: 'Ürünün sağladığı avantajlar: ' + params.product_advantage},
                {role: 'user', content: 'Ürünün özellikleri: ' + params.product_properties},
                {role: 'user', content: 'Yönlendirilecek yer: ' + params.redirect_url},
                {role: 'user', content: 'Hedef kitle: ' + params.target_group},
                {role: 'user', content: 'Videoyu izleyeceklerden beklenen davranış: ' + params.behaviour},
                {role: 'user', content: 'Animasyonun genel konu özeti: ' + params.summary},
                {role: 'user', content: 'Hedef kitle: ' + params.target_group},
                {role: 'user', content: 'Şirketin sektörü: ' + params.company_sector},
                {role: 'user', content: 'Hitap dili: ' + params.target_language},
                {role: 'user', content: 'Seslendirme türü: ' + params.volume_type},
                {role: 'user', content: 'Metin yazı tonu: ' + params.font},
                {role: 'user', content:'Metin yazı tonuna göre duygusallaştırmayı yap.'},
                {role: 'user', content: 'Metin içerisindeki isimler türkçe olsun'},
                {role: 'user', content: 'Metin yazı tonu: Animasyon seslendirmesi yazılırken yazılan metnin hangi tonda olması gerektiğini seçtiğimiz alan burasıdır. Eğer bu kısımda “klasik ton” girdisi yapılırsa senden istediğimiz yazım dili, animasyon videoyu izleyen kişiler açısından daha kurumsal, daha resmi bir dil olacaktır. Eğer “kreatif” girdisi yapılırsa senden istediğimiz yazım dili, animasyon videoyu izleyen kişiler açısından daha hikaye odaklı daha öngörülmedik ve yer yer sempatik olmak amaçlı espri içeren bir tarzda olmalıdır. Eğer bu kısımda “agresif” girdisi yapılırsa senden istediğimiz yazım dili, animasyon videoyu izleyen kişileri doğrudan satın almaya yönlendirecek bir tarzda olmalıdır. Şimdi sana tek bir örnek animasyon seslendirmesinin yazım tonları açısından nasıl farklılık gösterdiğini örnekleyerek gösterelim. Konu: Anneler günü için özel bir indirim yapan Hedef Alışveriş Merkezleri’nin %50’lik kampanyası. Klasik tonda örnek: “Anneler gününe özel yapmış olduğumuz indirimle, tüm annelerimizin gününü kutlamak istedik.” Kreatif tonda örnek: “Ahmet, bir müzik öğretmeni ve son derece şanslı biri. Neden dediğiniz duyar gibiyim. Buyrun anlatalım öyleyse. Ahmet, ilk önce bir tren kazası geçirdi ve trenden tek kurtulan kişi o oldu. Daha sonra bir araba kazası geçirdi ve taklalar atarak arabadan uçsa da yine kurtuldu. Bindiği uçak bermuda şeytan üçgeninin üstünden geçerken bilinmeyen mistik sebeplerle ıssız bir adaya düştü ve hurdaya dönmüş uçağın içinden sağ kurtuldu. Bununla da kalmayan Ahmet, ikinci el dükkanından satın aldığı pantolonun cebinden bir piyango buldu ve bu piyangodan yaklaşık bir milyon dolar kazandı. En sonunda kendisiyle yapılan bir röportajda hayatında yaşadığı tüm bu esrarengiz kurtuluşu ve kazanımlarına rağmen hayattaki en büyük şansının annesi olduğunu söyledi. Sizin de Ahmet gibi düşündüğünüzü biliyoruz. Bu yüzden, Tüm annelerin anneler günü hem kutlu, hem mutlu olsun diye Hedef Alışveriş Merkezleri olarak tüm ürünlerde geçerli %50 indirimimizi duyurmak istedik” Agresif tonda örnek: “Bu indirim kaçmaz! Anneler gününe özel tüm ürünlerde tam %50 indirim yaptık. Tüm ürünlerde geçerli bu indirimden sınırlı süre olan 14 mayısa kadar yararlanabilirsiniz. Bu fırsatı kaçırmamak için acele edin!”'},
                {role: 'user', content: `Metin uzunluğunu en az ${lenght[0]} kelime ile ${lenght[1]} kelime arasında yaz. Bana bu bilgiler doğrultusun senaryp metini ver. Bu kelime sınırını aşmamaya çalış.`},
                {role: 'user', content: 'Metin içerisinde giriş, anahtar mesaj gibi başlıklar kullanma. Saf metin istiyorum.'},
                {role:'user', content: 'Metinleri yönlendirilecek yeri, şirket ismini ve kelime sayısını yaz.'},
                {role: 'user', content: 'Metinleri düzenli bir html dosyası olarak hazırla. Yazılar iç içe olmasın, başlıklar kalın olarak yazılsın. Özellikle kelime sayısı bold olsun.'},
                {role: 'user', content: 'Bu bilgiler ışığında bana animasyon senaryosu yazmanı istiyorum. Hedef kiteleye uygun olarak metini hazırla.'},
            ]

            const response = await this.chatgptService.getResponse(message, 1)
            const text = response[0].message.content
            const scenario = new Scenario()
            scenario.text = text.replace('"', '').replace('1.', '')
            scenario.brief = params.id
            await this.scenarioRepository.save(scenario)
            return response
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
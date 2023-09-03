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
        birbirinden farklı 5 adet maksimum 15 kelimelik seslendirme cümleleri oluşturman.`

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
        const scenario_prmpt = `
        bu verileri kullanarak, ${data.hooks_centes} bu cümle ile başlayan ve bu cümleyi temel alan bir animasyon seslendirme metni yazmanı istiyorum. Metin uzunluklarını 
        belirttiğim süreye göre oluştur. Yine seslendirme metinini oluştururken bahsettiğim özellikleri göz önünde bulundur. Bu oluşturacağın metin animasyon seslendirmesi olacak. 
        Belirttiğim özellikler dışına çıkma.Çok daha etkili bir metin oluşturmak için yukarıdaki metin yazma kurallarına dikkat etmeni istiyorum. Oluşturduğun metinler özgün olsun.
        Yazım ve imla kurallarına dikkat et.
        1.	Şirket veya kişi ismi: Animasyon yaptırmak isteyen müşterilerimiz bazen kurumsal şirketler olurken bazen de küçük işletme, kobi ya da işletmesi olmayan şahsi girişimciler olabilmektedir. Kullanılacak dil, içeriğin detayları da buna göre değişebilmektedir. Eğer müşteri bir şirketse animasyon seslendirmesinda 1. çoğul şahıs olan “Biz” zamiri kullanılmalı ve seslendirme bu tonda yazılarak aidiyet hissi verilmeli ya da doğrudan tanımlama tarzında bir içerik uygulanabilir. Eğer müşteri bir şahıssa, animasyon seslendirmesinde kendisinden 3. tekil şahıs olarak bahsedilmelidir. Örnek 1) Müşteri: Rexven Teknoloji Şirketi Cümle: Rexven olarak, 2019 yılından beri sizlere en doğru e-ticaret eğitimlerini sunarak yetkinliğinizi artırmanızı sağlıyoruz. 
        Örnek 2) Müşteri: Vidyoner Animasyon Cümle: Vidyoner, şirketlere ürün ve hizmetleri için en doğru video animasyonları yapan, kaliteyi ön plana alan bir şirkettir. Örnek 3) Müşteri: Okan ARICAN Cümle: Okan beyin tecrübelerini aktardığı bu harika eser sayesinde bildiklerinizi hayata geçirmenin tam zamanı!
        2.	Müşteri hizmet mi yoksa ürün mü satıyor?: Animasyon video yaptırmak isteyen müşteriler en temelde bu videoyu sattıkları bir ürünü ya da vermiş oldukları hizmetleri satmak amacındadırlar. Bu soruya verilecek cevap seslendirmenin tamamını etkileyecek ve ona göre bir kurgu sağlanmasını gerektirecektir. Eğer müşteri bir ürün satıyorsa, seslendirme o ürünü temel alarak yazılmalıdır. Hizmet satıyorsa hizmetin detayları ve özellikleri seslendirmenin temelinde olmalı ve metne düzgün bir şekilde yedirilmelidir.
        3.	Çözüm getirilen sorun: Bu başlıkta satılan ürün ya da hizmet, hangi problemlere istinaden sunulduğu belirtilmelidir. Örneğin göl kenarında evi olan insanlar için bir sineklik satışı yapılıyorsa çözüm getirilen sorun, nemli bölgelerde yaşayan insanların evine giren haşerat ve böcektir. Bu sorun da yine seslendirmede genel temayı etkilemesi gereken bir unsurdur.Ya da e-ticaret eğitimi satılıyorsa, çözüm getirilen sorun bilgi kirliliği, güncel bilgilere ulaşma zorluğu, nereden başlayacağını bilememek gibi sorunlardır. Bu kategoride yazılanlar seslendirmenin önemli bir değişkenidir.
        4.	Somut ihtiyaç: Müşteriler reklam ve animasyon videolarını belirli bir somut ihtiyaç üzerine yaptırmak isterler. Bu amaç çoğu zaman para kazanmak, satışların artması vs gibi spesifik istekler olabilir. Doğru hedef kitleden doğru etkileşimi almak adına bu husus önemlidir. Örneğin; kilo vermek isteyen insanlara zayıflama çayı satıyorsak insanların somut ihtiyacı kilo vermek, sağlıklı bir vücuda kavuşmak gibi ihtiyaçlardır. seslendirme yazılırken somut ihtiyaç değişklenini gözönünde bulundurmak gerekir.
        5.	Soyut ihtiyaç: Müşteriler bazen doğrudan istenilen somut ihtiyaçların yanında tamamen duygusal kazanımlar elde etmek için de animasyon videosu yaptırmaktadırlar. Örneğin, bir potansiyel müşterinin “zayıflamak”, “kilo almak”, “daha kaslı bir vücuda sahip olmak” gibi istekleri somut ihtiyaçken “insanların arasında utanmadan yaşayabilmek”, “kadınlar tarafından beğenilmek”, “insanların kendini gördüğünde etkilenebileceği bir vücuda sahip olmak” gibi istekleriyse soyut ihtiyaçlardandır. seslendirmeyi yazarken animasyon videosunu izleyenlerden daha ziyade videoyu yaptıran müşteriyi etkilemesi gereken yerlerde bu kısma dikkat edilmeli ve mümkünse satır aralarında çok dikkat çekmeyecek şekilde bu hissiyata yer verilmelidir. Bu kısım boş bırakılırsa herhangi bir girdi yapılmamalıdır.
        6.	Hizmet yada ürün özellikleri: Verilen hizmeti ya da bir ürünü tanıtmak amacıyla animasyon video yapılırken, animasyon videonun seslendirmesini etkileyen en önemli unsurlardan biri de tanıtımı yapılacak olan hizmet ya da ürünün özellikleridir. Bu kısımda verilen bilgiler doğrultusunda söz konusu özellikler kurguya yedirilebilir. Ancak doğrudan verilmesi izleyiciyi sıkmakta ve yapılan videodan alınacak verimi düşürmektedir.Bu yüzden özellikleri kreatif bir kurgu içinde doğrudan maddeleme yapmadan seslendirmede kullanmalısın.
        7.	Hizmet ya da ürün avantajları: Bu kısımda tanıtımı yapılacak hizmet ya da ürünün yine aynı problemi çözen benzerlerinden ne gibi avantajları olduğu ya da neden tanıtımı yapılan ürün ya da hizmeti tercih etmeleri gerektiğiyle ilgili doneler yer alır. Yukarıda girilen hizmet ve ürün özellikleri ve avantajları kısmında da bize satılan ürün ve hizmetin alındığında kişilere ne gibi kazanımlar sunduğunu ortaya çıkarmaktadır. 
        8.	Vadedilen kazanımlar: Animasyon seslendirme metinlerini yazarken, reklam stratejilerine önem vermek gerekmektedir. Örneğin bir ürünün ya da hizmetin tanıtımı yapılırken doğrudan ürünün ya da hizmetin özelliklerinin yazılması çok doğru bir yöntem değildir. Aslolan ve karşı tarafı etkileyen husus o ürünü aldığında kişilerin neler kazanacağıdır. Çünkü yapılan satışların %90’ı duygularla olmaktadır. Haliyle bu kısma değenilirken satılan ürün ya da hizmetin avantajları ve bu avantajların insanlara katacakları şeyler çok önemlidir. İnsanlar temele indirgediğimizde 3 unsurla tetiklenerek satın alım gerçekleştirirler. Bu 3 unsur, para kazanmak, tasarruf etmek ya da zaman kazanmaktır. Bu yüzden ürününüzün ya da hizmetinizin avantajları yukarıdaki unsurlardan hangileriyle bağdaşıyorsa onlara mutlaka değinmelisiniz. Hizmetiniz ya da ürününüz bu unsurlardan sadece birini ya da hepsini sağlayabilir. Örnek: Xiaomi robot süpürge, otomatik olarak evi temizleyebilmektedir. Yani herhangi bir emek harcanmasına gerek olmamaktadır. Ancak bu husus seslendirmede bu şekilde anlatılmaz. seslendirmede “Xiaomi robot süpürge sayesinde en değerli varlığınız olan zamanınızı harcamadan tertemiz bir eve sahip olabilir ve kendinize değer katabileceğiniz hobilere vakit bulabilirsiniz!” gibi bir kazanım bahsiyle değinilebilir.
        9.	Yönlendirme yapılacak yer: Bu kısım animasyon videonun temel amacı olan “call to action” kısmıyla videonun kapanış bölümünde hedef kitlenin nereye yönlendirilmesinin istendiği belirtilen yeri nitelemektedir. Örneğin müşterimiz kendi hedef kitlesini, sosyal medya hesaplarını takip etmeye, telefon numarasını vererek aranma almaya, web sitesine ya da hepsine birden yönlendirmek isteyebilir. Bu aşamada örneğin websitesine yönlendirmek isteyen bir müşterinin seslendirmesinin sonunda “öyleyse siz de bizimle iletişime geçmek için hemen websitemiz www.vidyoner.com’u ziyaret edin!” gibi bir yapı kullanılabilir. Verdiğim örnekteki “siz de bizimle iletişime geçmek için” kısmı da videoyu izleyenlerden beklenen davranış kısmına yazılan girdiye göre düzenlenmelidir.
        10.	Videoyu izleyenlerden beklenen davranış ve onları harekere geçirici söylem: Video animasyon yaptıran müşterilerimizin, animasyon videosunu izleyenlerden sergilemesini beklediği bazı davranışlar vardır. Bunlar; doğrudan ürün ya da hizmeti satın alma işlemi, randevu oluşturma talebi, form doldurma, whatsapp, instagram, messenger yada diğer iletişim seçenekleri aracılığıyla kendilerine mesaj atmaları, bilgi almak için mail atmaları, web sitesine girerek detaylı bilgilere erişmeleri gibi davranışlar söz konusu olabilir. Bu kısımda sana bunlardan hangisini söylersek tüm seslendirmeyi yazarken bu durumu da göz önünde bulundurarak animasyon seslendirmesini yazmanı bekliyoruz.
        11.	Animasyonun süresi: Animasyon seslendirmesi yazılırken, yapılması istenen video animasyonun ortalama süresi, içerik seslendirmeye gönderileceği için çok önemlidir. Ne kadar uzunlukta bir seslendirme yazılacağı ve bu seslendirmenin maksimum kaç kelime olacağı gibi değerlere tahmini animasyon süresiyle ulaşabiliriz. Biz genel olarak müşterilere 30,45, 60 ya da 90 saniyelik video animasyonlar yapıyoruz. 30 saniyelik bir video animasyonun seslendirmesi 50-60 kelime arasında olmalıdır. Her saniye başına 1,75 ile çarpım sağlanarak seslendirme metninde olması gereken maksimum kelime sayısına ulaşılabilir. Yine aynı şekilde minimum kelime sayısı da maksimum kelime sayısının %95’inden az olmamalıdır.
        12.	Beğenilen video animasyon seslendirmesu: Bu kısımda sana müşterimizin daha önce yazmış olduğumuz animasyonlardan beğendiği bir seslendirme varsa onu göndereceğiz. Eğer bir seslendirme örneği atarsak yazacağın seslendirmeyi sonraki maddelerde belirttiğimiz hedef kitleye hitap, seslendirme türü, metin yazı tonu ve başlangıç cümlesi kategorileri açısından benzer bir tarzda oluşturmanı istiyoruz. Eğer bu kısım boş bırakılırsa bu maddeyi geçerek diğer maddelerde girdiğimiz detaylara göre seslendirmeyi yazabilirsin.
        13.	Yapılacak animasyon videosunun genel konu özeti: Bu kısımda müşteriden aldığımız brief doğrultusunda tek bir paragrafa sığdırdığımız genel bir konu özetine değineceğiz. seslendirmeyi yazarken sunulan değerleri doğru anlamak adına bu kısım önem arz ediyor.
        14.	Hedef kitle: Her ürün ve hizmetin hitap ettiği potansiyel müşteri kitlesi birbirinden farklılık arzetmektedir. Bu kitleler ürün ya da hizmete göre ekonomik ve kültürel olarak değişmektedir. Örneğin Ferrari markasına ait bir arabanın tanıtım videosunun ya da animasyonunun dar gelirli insanlara hitap etmesi beklenen maddi dönüşümün verimini düşürecektir. Fakat Ferrari’yi alabilecek kitle olan zengin ve hayat tarzına değer veren insanlara ulaşılabilir ya da hitap edilebilirse yapılacak projeden alınacak verim artacaktır. İşte bu yüzden hedef kitle seslendirmenin yazımından hitabına kadar tüm temayı etkilemesi gereken bir unsurdur. Hedef kitlenin kültürüne uygun bir yazı tonu, espri tarzı ve hatta seslendirmede kullanılacak isim bile uyarlanmalıdır. Başka bir örnekte sattığımız ürün bebek oyuncları ise kitlemiz ebebeynler olmalıdır. Buradaki demografik hususları düşünerek seslendirme dilini, kurguyu ve hitap şeklini doğru belirlemelisin.
        15.	Hedef kitleye hitap dili: Animasyon videoyu izleyecek olan kişilere animasyon seslendirmesinda sen dili ile mi yoksa siz dili ile mi hitap edileceğini bu bölüme girdiğimiz metinden anlayabilirsin.
        16.	Animasyon video yapılacak şirketin sektörü: Video animasyon şirketi olarak eğitimden mobilya üreticilerine, e-ticaretten yazılıma kadar birçok sektöre animasyon video yapmaktayız. Animasyon videolarımızı yapmadan önce hazırladığımız seslendirmelerde videosu yapılan sektöre göre değişiklikler gerekmektedir. Örneğin eğitim sektöründe öğrencilere hitaben yazılacak animasyon seslendirmelerinde karşı tarafa şefkat ve güvenilirlik hissiyatı aşılayacak bir tarz kullanılmalıdır. seslendirmeyi yazarken buraya girdiğimiz bilgileri dikkate almalısın.
        17.	seslendirme türü: Temele indirgeyecek olursak biz seslendirmelerimizi iki farklı ana tarzda hazırlamaktayız. Bunların birisi “doğrudan anlatım”, diğeri ise “hikaye anlatıcılığı” tarzıdır. Doğrudan anlatımda video animasyon seslendirmesi karşı tarafa çok fazla empati hissiyatı vermeyi hedeflemez. Doğrudan yukarıda saydığımız kazanımları avantajları ve diğer seslendirmede geçmesi gereken detaylara değinir. Hikaye anlatıcılığı tarzındaysa seslendirmede varsayımsal karakterler üzerinden bir hikaye anlatılarak, izleyici olan potansiyel müşterilerin videodaki karakterle kendini ilişkilendirmesi hedeflenir. Böylece duygulara hitap edilerek satın alma hissiyatı tetiklenir. Örnek verecek olursak doğrudan bir tanıtımda “Eser Su Arıtma ürünleri sayesinde kendinizin ve sevdiklerinizin sağlığından emin olurken ağır damacana maliyetlerinden de kurtulun!” gibi bir seslendirme yazılabilir. Hikaye anlatıcılığında ise “Ahmet kendi işini yapan bir avukat. Onca işin gücün arasında şirket gelirlerini giderlerini ve faturalarını kontrol edecek vakti yok. Bir muhasebeci tutacak kadar çok işi de yok. Bu yüzden muhasebe işlerini yönetebilmek için kendine uygun bir çözüm arıyor.” gibi bir seslendirme yazılabilir. Burada yapacağımız girdiye göre seslendirmeyi yazmalısın.
        18.	Metin yazı tonu: Animasyon seslendirmesi yazılırken yazılan metnin hangi tonda olması gerektiğini seçtiğimiz alan burasıdır. Eğer bu kısımda “klasik ton” girdisi yapılırsa senden istediğimiz yazım dili, animasyon videoyu izleyen kişiler açısından daha kurumsal, daha resmi bir dil olacaktır. Eğer “kreatif” girdisi yapılırsa senden istediğimiz yazım dili, animasyon videoyu izleyen kişiler açısından daha hikaye odaklı daha öngörülmedik ve yer yer sempatik olmak amaçlı espri içeren bir tarzda olmalıdır. Eğer bu kısımda “agresif” girdisi yapılırsa senden istediğimiz yazım dili, animasyon videoyu izleyen kişileri doğrudan satın almaya yönlendirecek bir tarzda olmalıdır. Şimdi sana tek bir örnek animasyon seslendirmesinin yazım tonları açısından nasıl farklılık gösterdiğini örnekleyerek gösterelim. Konu: Anneler günü için özel bir indirim yapan Hedef Alışveriş Merkezleri’nin %50’lik kampanyası. Klasik tonda örnek: “Anneler gününe özel yapmış olduğumuz indirimle, tüm annelerimizin gününü kutlamak istedik.” Kreatif tonda örnek: “Ahmet, bir müzik öğretmeni ve son derece şanslı biri. Neden dediğiniz duyar gibiyim. Buyrun anlatalım öyleyse. Ahmet, ilk önce bir tren kazası geçirdi ve trenden tek kurtulan kişi o oldu. Daha sonra bir araba kazası geçirdi ve taklalar atarak arabadan uçsa da yine kurtuldu. Bindiği uçak bermuda şeytan üçgeninin üstünden geçerken bilinmeyen mistik sebeplerle ıssız bir adaya düştü ve hurdaya dönmüş uçağın içinden sağ kurtuldu. Bununla da kalmayan Ahmet, ikinci el dükkanından satın aldığı pantolonun cebinden bir piyango buldu ve bu piyangodan yaklaşık bir milyon dolar kazandı. En sonunda kendisiyle yapılan bir röportajda hayatında yaşadığı tüm bu esrarengiz kurtuluşu ve kazanımlarına rağmen hayattaki en büyük şansının annesi olduğunu söyledi. Sizin de Ahmet gibi düşündüğünüzü biliyoruz. Bu yüzden, Tüm annelerin anneler günü hem kutlu, hem mutlu olsun diye Hedef Alışveriş Merkezleri olarak tüm ürünlerde geçerli %50 indirimimizi duyurmak istedik” Agresif tonda örnek: “Bu indirim kaçmaz! Anneler gününe özel tüm ürünlerde tam %50 indirim yaptık. Tüm ürünlerde geçerli bu indirimden sınırlı süre olan 14 mayısa kadar yararlanabilirsiniz. Bu fırsatı kaçırmamak için acele edin!”
        değişkenlerle ilgili maddeler bunlar. Metinin sonuna websitesi telefon numarası ya da adres bilgisini ekle.Oluşturacağın metinde en fazla ${data.text_lenght} kelime olsun.
        `
        const result = await this.aiService.createScenario(data, scenario_prmpt)

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
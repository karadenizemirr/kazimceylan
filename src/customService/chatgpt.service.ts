import { Injectable } from "@nestjs/common";
import {OpenAI} from "openai";
import { SettingsService } from "src/settings/settings.service";

@Injectable()
export class ChatgptService {

    private openApiKey:string
    private model:string
    private openai: OpenAI;
    private train_data: string[] = []

    constructor(private settingsService: SettingsService) {}

    async chatgptTrainData(){

    }

    async getResponse(prompt:string,n:number){
        const settings_data = await this.settingsService.get_custom_settings()
        this.model = settings_data.openapi_model
        this.openApiKey = settings_data.openai_api_key

        this.openai = new OpenAI({
            apiKey: this.openApiKey,
        });
    
        const response = await this.openai.chat.completions.create(
            {
                messages: [{
                    role: 'user',
                    content: prompt,
                }],
                model: this.model,
                stop : ['\n'],
            }
        )

        return response.choices
    }

}
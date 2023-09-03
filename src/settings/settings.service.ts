import { Injectable } from "@nestjs/common";
import { AppDataSource } from "src/customService/mysql.service";
import { Settings } from "src/models/setting.model";

@Injectable()
export class SettingsService {
    private settingsRepository:any
    constructor() {
        this.settingsRepository = AppDataSource.getRepository(Settings)
    }

    async get_custom_settings(){
        try{

            const data = await this.settingsRepository.findOne(
                {
                    where:{
                        id: 1
                    }
                }
            )

            return data
        }catch(err){
            return false
        }
    }

    async get_add_or_update(data:any){
        try{

            if (data.id){
                // update
                const update = await this.settingsRepository.update(data.id, data)
                return update
            }else {
                // add
                const add = await this.settingsRepository.save(data)
                return add
            }

        }catch(err){
            return false
        }
    }
}
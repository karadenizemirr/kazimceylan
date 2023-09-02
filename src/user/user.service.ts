import { Injectable } from "@nestjs/common";
import { AppDataSource } from "src/customService/mysql.service";
import { User } from "src/models/user.model";
import * as bcrpyt from 'bcrypt'

@Injectable()
export class UserService {
    private userRepository:any

    constructor() {
        this.userRepository = AppDataSource.getRepository(User)
    }

    async register(data:any){
        try{
            const user = new User()
            user.name = data.name
            user.surname = data.surname
            user.email = data.email
            user.password = await bcrpyt.hash(data.password, 5)
            user.phone_number = data.phone_number
            const save = this.userRepository.save(user)
            
            if (save){
                return true
            }

            return false
    
        }catch(err){
            console.log('Create user error')
            return false
        }
    }
}
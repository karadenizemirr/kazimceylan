import { Injectable } from "@nestjs/common";
import { AppDataSource } from "src/customService/mysql.service";
import { User } from "src/models/user.model";
import * as bcrpyt from 'bcrypt'
import { JwtService } from "src/customService/jwt.service";

@Injectable()
export class UserService {
    private userRepository:any

    constructor(private jwtService: JwtService) {
        this.userRepository = AppDataSource.getRepository(User)
    }

    async register(data:any){
        try{

            const control = await this.userRepository.findOne(
                {
                    where: {
                        email: data.email
                    }
                }
            )

            if (!control){
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
            }

            return false
    
        }catch(err){
            console.log('Create user error')
            return false
        }
    }

    async login(data:any){
        try{

            const user = await this.userRepository.findOne(
                {
                    where:{
                        email: data.email,
                    }
                }
            )

            if (user){
                const compare = await bcrpyt.compare(data.password, user.password)

                if (compare){
                    const token =  this.jwtService.generateToken({id: user.id, role: user.role})
                    return token
                }
            }

        }catch(err){
            console.log('Login user error')
            return false
        }
    }
    
}
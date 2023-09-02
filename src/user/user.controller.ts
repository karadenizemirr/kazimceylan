import { Body, Controller, Get, Post, Render, Res } from "@nestjs/common";
import { UserService } from "./user.service";
import { Response } from "express";

@Controller('user')
export class UserController {
    constructor(private userService: UserService) {}

    @Get('register')
    @Render('user/register')
    async get_register(){
    
        return {
            title: 'Kayıt Ol'
        }
    }

    @Post('register')
    async post_register(@Body() body:any, @Res() res:Response){
        const register = await this.userService.register(body)

        if (register){
            return res.status(200)
        }

        return res.status(400)
    }

    @Get('login')
    @Render('user/login')
    async get_login(){

        return {
            title: 'Giriş Yap'
        }
    }

}
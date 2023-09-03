import { Body, Controller, Get, Post, Render, Res, Session } from "@nestjs/common";
import { UserService } from "./user.service";
import { Response } from "express";
import * as secureSession from '@fastify/secure-session'

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
            return res.send(200)
        }

        return res.send(400)
    }

    @Get('login')
    @Render('user/login')
    async get_login(){
        return {
            title: 'Giriş Yap'
        }
    }

    @Post('login')
    async post_login(@Body() body:any, @Res() res:Response, @Session() session:secureSession.Session){
        const login = await this.userService.login(body)

        if (login){
            session.set('auth_token', login)
            res.send(200)
        }

        res.send(400)
    }

    @Get('logout')
    async get_logout(@Res() res:Response, @Session() session:secureSession.Session){
        session.delete()
        res.redirect(302, '/')
    }

}
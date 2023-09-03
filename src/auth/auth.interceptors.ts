import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from "@nestjs/common";
import { Observable } from "rxjs";
import {seucreSession} from 'fastify-secure-session'
import { JwtService } from "src/customService/jwt.service";

@Injectable()
export class AuthInterceptors implements NestInterceptor {
    constructor() {}
    intercept(context: ExecutionContext, next: CallHandler<any>): Observable<any> | Promise<Observable<any>> {
        
        const request = context.switchToHttp().getRequest()
        const response = context.switchToHttp().getResponse()
        const session = request.session as seucreSession

        let isLogin = false

        if (session && session['auth_token']){
            isLogin = true
        }

        response.locals.isLogin = isLogin

        return next.handle()
    }
}
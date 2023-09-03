import { CanActivate, ExecutionContext, Injectable } from "@nestjs/common";
import { Observable } from "rxjs";
import secureSession from 'fastify-secure-session'

@Injectable()
export class AuthGuard implements CanActivate {
    canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
        
        const request = context.switchToHttp().getRequest();
        const response = context.switchToHttp().getResponse();
        const session = request.session as secureSession

        if (session && session['auth_token']){
            return true
        }

        return false
    }
}
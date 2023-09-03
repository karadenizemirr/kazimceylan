import { Injectable } from "@nestjs/common";
import * as jsonwebtoken from "jsonwebtoken";

@Injectable()
export class JwtService {
    private secretKey:any
    constructor() {
        this.secretKey = "kazimceylan"
    }

    generateToken(payload:any){
        return jsonwebtoken.sign(payload, this.secretKey)
    }

    verifyToken(token:string){
        return jsonwebtoken.verify(token, this.secretKey)
    }
}
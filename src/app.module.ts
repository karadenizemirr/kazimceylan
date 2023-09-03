import { Global, Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AiModule } from './ai/ai.module';
import { ConfigModule } from '@nestjs/config';
import { AiService } from './ai/ai.service';
import { UserModule } from './user/user.module';
import { JwtService } from './customService/jwt.service';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { AuthInterceptors } from './auth/auth.interceptors';
import { SettingsModule } from './settings/settings.module';
import { SettingsService } from './settings/settings.service';

@Global()
@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: '.env',
      isGlobal: true,
    }),
    AiModule,
    UserModule,
    SettingsModule
  ],
  controllers: [AppController],
  providers: [
    AppService,
    JwtService,
    SettingsService,
    {
      provide:APP_INTERCEPTOR,
      useClass: AuthInterceptors
    }
  
  ],

  exports:[JwtService, SettingsService]
})
export class AppModule {}

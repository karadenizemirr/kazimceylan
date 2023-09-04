import { NestFactory } from '@nestjs/core';
import { NestFastifyApplication, FastifyAdapter } from '@nestjs/platform-fastify';
import { AppModule } from './app.module';
import { join } from 'path';
import { AppDataSource } from './customService/mysql.service';
import Handlebars from 'handlebars';
import secureSession from '@fastify/secure-session'
import { ErrorInterceptor } from './customService/error.interceptors';


async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter(),
  );
  AppDataSource.initialize().then(() => console.log('Database connected')).catch(err => console.log('Database connect not success',err))
  app.useStaticAssets({
    root: join(__dirname, '..', 'src/assets/public'),
    prefix: '/public/',
  });
  app.setViewEngine({
    engine: {
      handlebars: require('handlebars'),
    },
    templates: join(__dirname, '..', 'src/assets/views'),
    layout: 'layout/main'
  });

  Handlebars.registerHelper('text_resize', function(text:string){
    if (text.length > 120){
      return text.slice(0,120).replace(/<\/?[^>]+(>|$)/g, "") + '...'
    }
    return text
  })

  Handlebars.registerHelper('selectOption', function(a,b){
    if (a == b){
      return 'selected'
    }
    return ''
  })

  await app.register(secureSession, {
    secret: 'averylogphrasebiggerthanthirtytwochars',
    salt: 'mq9hDxBVDbspDR6n',
    cookieName: 'vidyoner',
    cookie: {
      path: '/',
      httpOnly: true,
      secure: false,
      maxAge: 1000 * 60 * 60 // 7 days
    }
  });
  
  app.useGlobalFilters(new ErrorInterceptor())
  await app.listen(process.env.PORT ?? 3000, process.env.HOST || '0.0.0.0');
}
bootstrap();
import { NestFactory } from '@nestjs/core';
import { ExpressAdapter } from '@nestjs/platform-express';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import serverless from 'serverless-http';
import express from 'express';

let cachedApp: any = null;

async function createApp() {
  if (!cachedApp) {
    console.log('🏗️ 初始化 NestJS 应用...');
    
    console.log('🔗 数据库配置:', {
      writeHost: process.env.DATABASE_WRITE_HOST,
      readHost: process.env.DATABASE_READ_HOST,
      nodeEnv: process.env.NODE_ENV
    });

    const expressInstance = express();
    const adapter = new ExpressAdapter(expressInstance);
    
    const app = await NestFactory.create(AppModule, adapter, {
      logger: ['error', 'warn', 'log'],
    });
    
    app.useGlobalPipes(
      new ValidationPipe({
        transform: true,
        whitelist: true,
        forbidNonWhitelisted: true,
        disableErrorMessages: false,
      }),
    );
    
    app.enableCors({
      origin: '*',
      methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
      allowedHeaders: 'Content-Type,Authorization,X-Requested-With',
    });
    
    await app.init();
    
    console.log('✅ NestJS 应用初始化完成');
    
    // 使用 serverless-http 包装
    cachedApp = serverless(expressInstance);
  }
  
  return cachedApp;
}

export const handler = async (event: any, context: any) => {
  console.log('🚀 Lambda 函数被调用');
  console.log('请求路径:', event.path);
  console.log('请求方法:', event.httpMethod);
  
  try {
    const app = await createApp();
    return await app(event, context);
  } catch (error: any) {
    console.error('❌ Lambda 执行错误:', error);
    
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify({
        message: '服务器内部错误',
        error: error?.message || '未知错误',
        timestamp: new Date().toISOString(),
      }),
    };
  }
};

// 确保兼容性
module.exports = { handler };
module.exports.handler = handler;
export default handler;
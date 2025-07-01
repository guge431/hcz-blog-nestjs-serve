import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { BlogModule } from './blog/blog.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: process.env.NODE_ENV === 'production' 
        ? '.env.production' 
        : '.env.development',
    }),
    BlogModule,
    // 写数据库连接配置 - 优先使用Lambda环境变量
    TypeOrmModule.forRoot({
      name: 'write',
      type: 'postgres',
      host: process.env.DATABASE_WRITE_HOST || process.env.DB_HOST_WRITE || 'localhost',
      port: parseInt(process.env.DATABASE_WRITE_PORT || process.env.DB_PORT || '5432'),
      username: process.env.DATABASE_WRITE_USERNAME || process.env.DB_USER || 'postgres',
      password: process.env.DATABASE_WRITE_PASSWORD || process.env.DB_PASSWORD || '',
      database: process.env.DATABASE_WRITE_NAME || process.env.DB_NAME || 'postgres',
      synchronize: process.env.NODE_ENV === 'development',
      autoLoadEntities: true,
      logging: process.env.NODE_ENV === 'development',
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
      connectTimeoutMS: 60000,
      maxQueryExecutionTime: 10000,
      extra: {
        max: 5, // 最大连接数
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 60000,
      }
    }),
    // 读数据库连接配置 - 优先使用Lambda环境变量
    TypeOrmModule.forRoot({
      name: 'read',
      type: 'postgres',
      host: process.env.DATABASE_READ_HOST || process.env.DB_HOST_READ || 'localhost',
      port: parseInt(process.env.DATABASE_READ_PORT || process.env.DB_PORT || '5432'),
      username: process.env.DATABASE_READ_USERNAME || process.env.DB_USER || 'postgres',
      password: process.env.DATABASE_READ_PASSWORD || process.env.DB_PASSWORD || '',
      database: process.env.DATABASE_READ_NAME || process.env.DB_NAME || 'postgres',
      synchronize: false, // 读库不需要同步
      autoLoadEntities: true,
      logging: process.env.NODE_ENV === 'development',
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
      connectTimeoutMS: 60000,
      maxQueryExecutionTime: 10000,
      extra: {
        max: 5,
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 60000,
      }
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
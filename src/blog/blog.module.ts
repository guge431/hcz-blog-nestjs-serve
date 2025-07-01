import { Module } from '@nestjs/common';
import { BlogService } from './blog.service';
import { BlogController } from './blog.controller';

import { Blog } from './entities/blog.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [TypeOrmModule.forFeature([Blog], 'write'),
  TypeOrmModule.forFeature([Blog], 'read')],
  controllers: [BlogController],
  providers: [BlogService],
})
export class BlogModule {}

import { Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { CreateBlogDto } from './dto/create-blog.dto';
import { UpdateBlogDto } from './dto/update-blog.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Blog } from './entities/blog.entity';
import { Repository, Like } from 'typeorm';

@Injectable()
export class BlogService {
  constructor(
    @InjectRepository(Blog, 'write')
    private writeRepository: Repository<Blog>,

    @InjectRepository(Blog, 'read')
    private readRepository: Repository<Blog>,
  ) { }
  //查找全部
  findBlogAll(): Promise<Blog[]> {
    try {
      return this.readRepository.find();
    } catch (error) {
      throw new InternalServerErrorException('获取博客全部列表失败');
    }
  }
  //通过title模糊查询
  async findBlogItem(keyword: string): Promise<Blog> {
    try {
      const blog = await this.readRepository.findOne({
        where: { title: Like(`%${keyword}%`) }
      });
      if (!blog) {
        throw new NotFoundException(`查询的的博客不存在`);
      }
      return blog
    } catch (error) {
      throw new InternalServerErrorException('获取博客列表失败');
    }
  }

  async findBlogItemInfo(id: number): Promise<Blog> {
    try {
      const blog = await this.readRepository.findOne({
        where: { id }
      });
      if (!blog) {
        throw new NotFoundException(`查询的的博客不存在`);
      }
      return blog
    } catch (error) {
      throw new InternalServerErrorException('获取博客列表失败');
    }
  }
  //新增博客
  async addBlog(blogItemData: CreateBlogDto) {
    try {
      const savedBlog = await this.writeRepository.save(blogItemData);
      return {
        msg: '新增成功',
        data: savedBlog
      }
    } catch (error) {
      throw new InternalServerErrorException('新增博客全部列表失败');
    }
  }
  //更新博客
  async updateBlog(id: number, blogItemData: UpdateBlogDto) {
    try {
      const blog = await this.readRepository.findOne({
        where: { id }
      });
      if (!blog) {
        throw new NotFoundException(`更的的博客不存在`);
      }
      await this.writeRepository.update(id, blogItemData);
      const updatedBlog = await this.writeRepository.findOne({
        where: { id }
      });
      return {
        msg: '更新成功',
        data: updatedBlog
      }
    } catch (error) {
      throw new InternalServerErrorException('更新博客全部列表失败');
    }
  }

  // 自己造点死数据到数据库
  // async createInitialData() {
  //   try {
  //     const count = await this.readRepository.count();
  //     if (count > 0) {
  //       console.log('数据已存在，跳过初始化');
  //       return;
  //     }

  //   } catch (error) {
  //     await new Promise(resolve => setTimeout(resolve, 2000));
  //     const initialBlogs = [
  //       {
  //         id: 1,
  //         title: 'React Hooks 深入理解',
  //         content: 'React Hooks 是 React 16.8 引入的新特性，让我们可以在函数组件中使用状态...',
  //         description: 'React Hooks 让函数组件也能使用状态',
  //         author: '张三',
  //         tags: ['React', 'JavaScript'],
  //         category: '前端开发',
  //         createdAt: 8,
  //         views: 100,
  //         isPublished: true,
  //       },
  //       {
  //         id: 2,
  //         title: 'TypeScript 最佳实践',
  //         content: 'TypeScript 为 JavaScript 添加了静态类型检查...',
  //         description: 'TypeScript 让代码更加健壮',
  //         author: '李四',
  //         tags: ['TypeScript', 'JavaScript'],
  //         category: '前端开发',
  //         createdAt: 12,
  //         views: 200,
  //         isPublished: true,
  //       },
  //       {
  //         id: 3,
  //         title: 'NestJS 入门指南',
  //         content: 'NestJS 是构建高效Node.js服务器端应用的框架...',
  //         description: 'NestJS 让后端开发更简单',
  //         author: '王五',
  //         tags: ['NestJS', 'Node.js'],
  //         category: '后端开发',
  //         createdAt: 15,
  //         views: 150,
  //         isPublished: true,
  //       }
  //     ];
  //     // 保存到数据库
  //     await this.writeRepository.save(initialBlogs);


  //   }



  // }

}

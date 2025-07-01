import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { BlogService } from './blog.service';
import { CreateBlogDto } from './dto/create-blog.dto';
import { UpdateBlogDto } from './dto/update-blog.dto';
import { Blog } from './entities/blog.entity';

@Controller('blog')
export class BlogController {
  constructor(private readonly blogService: BlogService) { }

  @Get()
  async getAllBlogList() {
    let blogAllList = await this.blogService.findBlogAll()
    return blogAllList || []
  }

  @Get('search')
  async queryItemOne(@Query('title') title: string): Promise<Blog> {
    return this.blogService.findBlogItem(title);
  }
  
  @Get(':id')
  async getItemDetail(@Param('id') id: number): Promise<Blog> {
    return this.blogService.findBlogItemInfo(id);
  }



  @Post()
  async addBlogData(@Body() createBlogDto: CreateBlogDto) {
    return this.blogService.addBlog(createBlogDto);
  }

  @Patch(':id')
  async update(
    @Param('id') id: number,
    @Body() updateBlogDto: UpdateBlogDto
  ) {
    return await this.blogService.updateBlog(id, updateBlogDto);
  }
}

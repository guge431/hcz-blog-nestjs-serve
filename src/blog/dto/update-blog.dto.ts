import { IsString, IsOptional, MinLength, MaxLength } from 'class-validator';

// 完全独立的 UpdateBlogDto，不依赖 CreateBlogDto
export class UpdateBlogDto {
  @IsOptional()
  @IsString({ message: '标题必须是字符串' })
  @MinLength(1, { message: '标题至少需要1个字符' })
  @MaxLength(200, { message: '标题不能超过200个字符' })
  title?: string;

  @IsOptional()
  @IsString({ message: '内容必须是字符串' })
  @MinLength(1, { message: '内容至少需要1个字符' })
  content?: string;

  @IsOptional()
  @IsString({ message: '描述必须是字符串' })
  @MinLength(1, { message: '描述至少需要1个字符' })
  description?: string;
}
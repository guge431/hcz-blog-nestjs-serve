import { IsString, IsNotEmpty, MinLength, MaxLength } from 'class-validator';
export class CreateBlogDto {
    @IsString({ message: '标题必须是字符串' })
    @IsNotEmpty({ message: '标题不能为空' })
    @MinLength(1, { message: '标题至少需要1个字符' })
    @MaxLength(200, { message: '标题不能超过200个字符' })
    title: string;
  
    @IsString({ message: '内容必须是字符串' })
    @IsNotEmpty({ message: '内容不能为空' })
    @MinLength(1, { message: '内容至少需要1个字符' })
    content: string;
  
    @IsString({ message: '描述必须是字符串' })
    @IsNotEmpty({ message: '描述不能为空' })
    @MinLength(1, { message: '描述至少需要1个字符' })
    description: string;

}

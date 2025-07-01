import { Entity,Column,PrimaryGeneratedColumn,CreateDateColumn,UpdateDateColumn} from "typeorm";

@Entity("blog")
export class Blog {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ length: 100 })   
    title: string;

    @Column('text')
    content: string;

    @Column('text')
    description: string;

    @Column('text')
    category:string;

    @Column('text')
    author: string;

    @Column('text', { array: true, default: [] })
    tags:string[]

    @Column()
    isPublished:boolean

    @Column()
    views:number

    @CreateDateColumn()
    createdAt: Date;


}

import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from "typeorm";
import {v4 as uuid4} from 'uuid';

@Entity()
export class User {
    @PrimaryGeneratedColumn('uuid')
    id: string = uuid4();

    @Column()
    name:string
    
    @Column()
    surname: string

    @Column()
    email: string

    @Column()
    phone_number: string

    @Column()
    password: string

    @Column({default: 'user'})
    role: string

    @Column({default: true})
    isActive:string

    @CreateDateColumn()
    created_at: Date
}
import { Column, CreateDateColumn, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import {v4 as uuid4} from 'uuid';
import { Brief } from "./brief.model";
import { Scenario } from "./scenario.model";

@Entity()
export class Hook {
    @PrimaryGeneratedColumn('uuid')
    id: string = uuid4();

    @Column()
    text:string

    @CreateDateColumn()
    created_at: Date

    @ManyToOne(() => Brief, (brief) => brief.hooks)
    brief: Brief
}
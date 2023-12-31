import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import {v4 as uuid4} from 'uuid';
import { Hook } from "./hook.model";
import { Brief } from "./brief.model";

@Entity()
export class Scenario {
    @PrimaryGeneratedColumn('uuid')
    id: string = uuid4();

    @Column({length: 9999})
    text:string

    @CreateDateColumn()
    created_at: Date

    @ManyToOne(() => Brief, (brief) => brief.scenarios, {nullable: true})
    brief: Brief
}
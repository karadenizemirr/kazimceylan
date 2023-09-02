import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import {v4 as uuid4} from 'uuid';
import { Hook } from "./hook.model";
import { Scenario } from "./scenario.model";

@Entity()
export class Brief {
    @PrimaryGeneratedColumn('uuid')
    id: string = uuid4();

    @Column({nullable: true})
    company_name:string

    @Column({nullable: true})
    product: string

    @Column({nullable: true})
    product_description: string

    @Column({nullable: true})
    concrete_need:string

    @Column({nullable: true})
    abstract_need:string

    @Column({nullable: true})
    product_properties: string

    @Column({nullable: true})
    product_advantage: string

    @Column({nullable: true})
    gains:string

    @Column({nullable: true})
    redirect_url:string

    @Column({nullable: true})
    behaviour:string

    @Column({nullable: true})
    animation_delay:string

    @Column({nullable: true})
    summary:string

    @Column({nullable: true})
    target_group:string

    @Column({nullable: true})
    target_language: string

    @Column({nullable: true})
    company_sector: string

    @Column({nullable: true})
    volume_type:string

    @Column({nullable: true})
    font: string

    @OneToMany(() => Hook, (hook) => hook.brief, {cascade: true})
    hooks: Hook[]
    
    @OneToMany(() => Scenario, (scenario) => scenario.brief)
    scenarios: Scenario[]
}
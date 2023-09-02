import { Brief } from "src/models/brief.model";
import { Hook } from "src/models/hook.model";
import { DataSource } from "typeorm";

export const AppDataSource = new DataSource({
    type: "mysql",
    host: "localhost",
    port: 3306,
    username: "root",
    password: "123456789",
    database: "kazimceylan",
    synchronize: true,
    logging: true,
    entities: [Hook, Brief],
    subscribers: [],
    migrations: [],

})
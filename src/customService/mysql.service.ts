import { Brief } from "src/models/brief.model";
import { Hook } from "src/models/hook.model";
import { Scenario } from "src/models/scenario.model";
import { Settings } from "src/models/setting.model";
import { User } from "src/models/user.model";
import { DataSource } from "typeorm";

export const AppDataSource = new DataSource({
    type: "mysql",
    host: "oliadkuxrl9xdugh.chr7pe7iynqr.eu-west-1.rds.amazonaws.com",
    port: 3306,
    username: "voz5cvr8up2b1ivf",
    password: "sgbjr91ipzhaie72",
    database: "oeej2gql6i7v1hoc",
    synchronize: true,
    logging: true,
    entities: [Hook, Brief, Scenario, User,Settings],
    subscribers: [],
    migrations: [],

})
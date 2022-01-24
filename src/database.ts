import config, { IConfig } from "config"
import mongoose, { Mongoose } from "mongoose"

const dbConfig: IConfig = config.get("App.database")

export async function connect(): Promise<Mongoose> {
    return await mongoose.connect(dbConfig.get("mongoUrl"))
}

export function close(): Promise<void> {
    return mongoose.connection.close()
}

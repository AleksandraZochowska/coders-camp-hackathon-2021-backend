import dotenv from "dotenv";
import mongoose from "mongoose";
import express, { json } from "express";
import cors from "cors";

import routes from "./app/routes/index.js";

dotenv.config({ path: "./.env" });

class Server {
    constructor() {
        this.app = express();
        this.serverPort = process.env.PORT || 4000;
        this.dbName = process.env.DB_NAME;
        this.mongoConnection;
        this._server;

        this.connectToDB();
        this.useMiddlewares();
        this.getRoutes();
        this.start();
    }

    async connectToDB() {
        const dbConnectionString = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWD}@awesomedb.lli4m.mongodb.net/${this.dbName}?retryWrites=true&w=majority`;

        try {
            this.mongoConnection = await mongoose.connect(dbConnectionString, {
                useNewUrlParser: true,
                useUnifiedTopology: true,
            });
        } catch (error) {
            console.log(error);
            console.log("Connection to database failed. Try again...");
        }
    }

    useMiddlewares() {
        this.app.use(json());
        this.app.use(cors());
    }

    getRoutes() {
        routes(this.app);
    }

    start() {
        this._server = this.app.listen(this.serverPort, () => {
            console.log("Listening on port " + this.serverPort);
        });
    }

    close() {
        this.mongoConnection.connection.close();
        this._server.close();
    }
}

export default Server;

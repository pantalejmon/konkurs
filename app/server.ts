import express from "express";
import { DataBase } from '../database/database';
import session from "express-session";
import MongoStore from 'connect-mongo';
import { Router } from './router';
import bodyParser from "body-parser"
import { TestController } from '../database/test';



/**
 * Główna klasa serwera
 * 
 */

export default class Server {
    public app: express.Application;
    public db: DataBase;
    public mongoStore: MongoStore.MongoStoreFactory | undefined;
    public router: Router;
    private testController: TestController
    private routingConfig() {
        if (this.app === null) return;
        this.app.get('/test', function (req, res) {
            res.send("tu nic nie ma :)");
        });
    }

    private startServer() {
        this.mongoStore = MongoStore(session)
        this.app.use(session({
            secret: 'work hard',
            resave: true,
            saveUninitialized: false,
            store: new this.mongoStore({
                mongooseConnection: this.db.connection
            })
        }));
        this.app.use(bodyParser.json());
        this.app.use(bodyParser.urlencoded({ extended: false }));
        this.app.use(express.static("./public", { index: false, extensions: ['html'] }));
        this.app.use(function (req, res, next) {
            res.header("Access-Control-Allow-Origin", "10.70.108.6:8080"); // update to match the domain you will make the request from
            res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
            next();
        });
        this.app.listen(8080, function () {
            console.log('Uruchomiono aplikacje ');
        });
    }

    constructor() {
        this.app = express();
        this.routingConfig();
        this.db = new DataBase();
        this.startServer();
        this.testController = new TestController();
        this.router = new Router(this.app, this.db.getUser(), this.testController);







        // Error Handlers
        this.app.use(function (req, res, next) {
            res.status(404).send("<h1>Pudło, strona nie istnieje</h1>");
        })

        this.app.use(function (req, res, next) {
            res.status(500).send("<h1>Błąd html :(</h1>");
        })
    }
}
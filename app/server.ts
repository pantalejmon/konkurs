import express from "express";
import { DataBase } from '../database/databaseController';
import session from "express-session";
import MongoStore from 'connect-mongo';
import { Router } from './router';
import bodyParser from "body-parser"
import { TestController } from '../database/testController';
import RateLimit from 'express-rate-limit'
import { Config } from './config';




/**
 * Główna klasa serwera
 * 
 */

export default class Server {
    private app: express.Application;
    private db: DataBase;
    private mongoStore: MongoStore.MongoStoreFactory | undefined;
    private router: Router;
    private testController: TestController
    private routingConfig() {
        if (this.app === null) return;
        this.app.get('/test', function (req, res) {
            res.send("tu nic nie ma :)");
        });
    }

    /**
     * Metoda konfigurująca wstępnie serwer
     */
    private startServer() {
        // Podłączenie do bazy sesji i jej inicjalizacja
        this.mongoStore = MongoStore(session)
        this.app.use(session({
            secret: 'work hard',
            resave: true,
            cookie: {
                expires: (new Date(Date.now() + (180 * 60000)))
            },
            saveUninitialized: false,
            store: new this.mongoStore({
                mongooseConnection: this.db.connection
            }),
        }));

        // Ustawienie limitu zapytań do api (300 zapytań na 15 minut)
        const limiter = new RateLimit({
            windowMs: Config.getRateLimitTime(), // 15 minutes
            max: Config.getRateLimitMax(),
        })
        this.app.use("/apims/", limiter)

        // Konfiguracja serwera
        this.app.use(bodyParser.json());
        this.app.use(bodyParser.urlencoded({ extended: true }));
        this.app.use(express.static("./public", { index: false, extensions: ['html'] }));
        this.app.use(function (req, res, next) {
            res.header("Access-Control-Allow-Origin", "10.70.108.6:8080"); // update to match the domain you will make the request from
            res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
            res.header("X-XSS-Protection", "1");
            res.header("X-Content-Type-Options", "nosniff");
            res.header("Content-Security-Policy", "script-src 'self'");
            next();
        });
        // Uruchomienie serwera na porcie 8080
        this.app.listen(8080, function () {
            console.log('Uruchomiono aplikacje ');
        });
    }

    /**
     * Konstruktor tworzenia serwera
     */
    constructor() {
        this.app = express();
        this.routingConfig();
        this.db = new DataBase();
        this.startServer();
        this.testController = new TestController();
        this.router = new Router(this.app, this.testController, this.db);

        this.app.use(function (req, res, next) {
            res.status(500).send("<h1>Błąd html :(</h1>");
        })
    }
}
import express from "express";
import { DataBase } from '../database/databaseController';
import session from "express-session";
import MongoStore from 'connect-mongo';
import { Router } from './router';
import bodyParser from "body-parser"
import { TestController } from '../database/testController';
import RateLimit from 'express-rate-limit'
import { Config } from './config';
import { AdminTerminal } from './adminTerminal';
import https from "https";
import fs from "fs";
import Mail from "./mail";
import helmet from 'helmet';



/**
 * Główna klasa serwera
 * 
 */

export default class Server {
    private app: express.Application;
    private redirecter: express.Application;
    private server: https.Server;
    private db: DataBase;
    private mongoStore: MongoStore.MongoStoreFactory | undefined;
    private router: Router;
    private testController: TestController
    private cmd: AdminTerminal;
    private mail: Mail;
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
            secret: 'workhard',
            resave: true,
            cookie: {
                //expires: (new Date(Date.now() + (180 * 60000))), // TEGO NIE UŻYWAĆ BO BLOKUJE CAŁE LOGOWANIE
                maxAge: ((180 * 60000)),
                secure: true
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
            res.header("Access-Control-Allow-Origin", Config.getDomain()); // update to match the domain you will make the request from
            res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
            res.header("X-XSS-Protection", "1");
            res.header("X-Content-Type-Options", "nosniff");
            res.header("Content-Security-Policy", "script-src 'self'");
            next();
        });
        this.app.use(helmet());
        // Uruchomienie serwera na porcie 8080
        //this.app.listen(443, function () {
        //     console.log('Uruchomiono aplikacje ');
        // });
        // this.app.use(function (request, response) {
        //     if (!request.secure) {
        //         response.redirect("https://" + request.headers.host + request.url);
        //     }
        // });
    }

    printLogo() {
        let logo: string =
            ".----------------. .----------------. .----------------. .----------------. .----------------. " + "\n" +
            "| .--------------. | .--------------. | .--------------. | .--------------. | .--------------. |" + "\n" +
            "| |     __       | | |   _______    | | |    ______    | | |      _       | | |     __       | |" + "\n" +
            "| |    /  |      | | |  |  _____|   | | |   / ____ `.  | | |     | |      | | |    /  |      | |" + "\n" +
            "| |    `| |      | | |  | |____     | | |   `'  __) |  | | |  ___| |___   | | |    `| |      | |" + "\n" +
            "| |     | |      | | |  '_.____''.  | | |   _  |__ '.  | | | |___   ___|  | | |     | |      | |" + "\n" +
            "| |    _| |_     | | |  | \\____) |  | | |  | \\____) |  | | |     | |      | | |    _| |_     | |" + "\n" +
            "| |   |_____|    | | |   \\______.'  | | |   \\______.'  | | |     |_|      | | |   |_____|    | |" + "\n" +
            "| |              | | |              | | |              | | |              | | |              | |" + "\n" +
            "| '--------------' | '--------------' | '--------------' | '--------------' | '--------------' |" + "\n" +
            " '----------------' '----------------' '----------------' '----------------' '----------------' " + "\n";
        console.log(logo)
    }
    /**
     * Konstruktor tworzenia serwera
     */
    constructor() {
        this.printLogo();
        this.app = express();
        this.redirecter = express();
        this.routingConfig();
        this.db = new DataBase();
        this.startServer();
        this.testController = new TestController();
        this.mail = new Mail("");
        this.router = new Router(this.app, this.testController, this.db, this.mail);
        this.cmd = new AdminTerminal();
        this.app.use(function (req, res, next) {
            res.status(500).send("<h1>Błąd html :(</h1>");
        })
        const privateKey = fs.readFileSync('./privkey.pem', 'utf8');
        const certificate = fs.readFileSync('./fullchain.pem', 'utf8');
        const credentials = { key: privateKey, cert: certificate };
        this.server = https.createServer(credentials, this.app);
        this.server.listen(5443, 'localhost');

        var http = require('http');
        this.redirecter.get("*", function (req: any, res: any) {
            console.log("[SERWER] Przekierowanie http na https");
            res.redirect("https://" + req.headers.host + req.url);
        });
        let serwer2 = http.createServer(this.redirecter)
        serwer2.listen(5580, 'localhost');

    }
}      

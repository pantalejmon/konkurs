"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var express_1 = __importDefault(require("express"));
var database_1 = require("../database/database");
var express_session_1 = __importDefault(require("express-session"));
var connect_mongo_1 = __importDefault(require("connect-mongo"));
var router_1 = require("./router");
var body_parser_1 = __importDefault(require("body-parser"));
var test_1 = require("../database/test");
/**
 * Główna klasa serwera
 *
 */
var Server = /** @class */ (function () {
    function Server() {
        this.app = express_1.default();
        this.routingConfig();
        this.db = new database_1.DataBase();
        this.startServer();
        this.router = new router_1.Router(this.app, this.db.getUser());
        this.testController = new test_1.TestController();
        // Error Handlers
        this.app.use(function (req, res, next) {
            res.status(404).send("<h1>Pudło, strona nie istnieje</h1>");
        });
        this.app.use(function (req, res, next) {
            res.status(500).send("<h1>Błąd html :(</h1>");
        });
    }
    Server.prototype.routingConfig = function () {
        if (this.app === null)
            return;
        this.app.get('/test', function (req, res) {
            res.send("tu nic nie ma :)");
        });
    };
    Server.prototype.startServer = function () {
        this.mongoStore = connect_mongo_1.default(express_session_1.default);
        this.app.use(express_session_1.default({
            secret: 'work hard',
            resave: true,
            saveUninitialized: false,
            store: new this.mongoStore({
                mongooseConnection: this.db.connection
            })
        }));
        this.app.use(body_parser_1.default.json());
        this.app.use(body_parser_1.default.urlencoded({ extended: false }));
        this.app.use(express_1.default.static("./public", { index: false, extensions: ['html'] }));
        this.app.use(function (req, res, next) {
            res.header("Access-Control-Allow-Origin", "10.70.108.6:8080"); // update to match the domain you will make the request from
            res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
            next();
        });
        this.app.listen(8080, function () {
            console.log('Uruchomiono aplikacje ');
        });
    };
    return Server;
}());
exports.default = Server;

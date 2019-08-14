"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var user_1 = require("./../database/user");
var express_1 = __importDefault(require("express"));
var authController_1 = require("./security/authController");
var tokenController_1 = require("./security/tokenController");
/**
 * Klasa będąca ruterm api
 *
 */
var Router = /** @class */ (function () {
    function Router(app, user) {
        this.api = "/apims";
        this.router = app;
        this.User = user;
        this.AuthController = new authController_1.AuthController();
        console.log("Uruchamiam router");
        this.router.get(this.api + "/", function (req, res, next) {
            console.log("tp1");
            return res.send("Gratuluje, znalazles ukryte api");
        });
        var userData = {
            email: "abc",
            username: "xyz",
            password: "def"
        };
        this.router.get(this.api + "/testjson", function (req, res, next) {
            return res.send(userData);
        });
        // Logowanie
        this.router.post(this.api + "/login", function (req, res, next) {
            var email = req.body.email;
            var pass = req.body.pass;
            user_1.User.authentication(email, pass, function (err, status, user) {
                if (err) {
                    console.log(err);
                }
                if (status) {
                    var token = "";
                    token = tokenController_1.TokenController.generateNewToken(user.email, 600);
                    req.session.token = token;
                    req.session.username = user.email;
                    res.redirect("/user/terminal");
                }
                else {
                    res.send("Zle haslo");
                }
            });
        });
        this.router.get(this.api + "/username", function (req, res, next) {
            res.send(req.session.username);
        });
        this.router.get(this.api + "/login2", this.AuthController.authenticateJWT, function (req, res, next) {
            res.send("Dobry token");
        });
        this.router.get("/logout", this.AuthController.authenticateJWT, function (req, res, next) {
            req.session.destroy(function () {
                console.log("Usuwam sesje");
            });
            res.redirect("/login");
        });
        this.router.get("/terminal", this.AuthController.authenticateJWT, function (req, res, next) {
            res.redirect("/user/terminal");
        });
        //Rejestracja
        this.router.post(this.api + "/register", function (req, res, next) {
            var email = req.body.email;
            var pass = req.body.pass;
            var name = req.body.name;
            user_1.User.createUser(email, name, pass, function (err, user) {
                if (err) {
                    console.log("cos nie wyszlo");
                }
                res.send(("Dodano użytkonika" + user.email));
            });
        });
        // Przekierowanie na index.html
        this.router.get("/", function (req, res, next) {
            res.redirect("/index");
        });
        this.router.use("/user", this.AuthController.authenticateJWT, express_1.default.static("./restricted", { index: false, extensions: ['html'] }));
        //Obsługa nie istniejącej strony
        this.router.use(function (req, res, next) {
            res.status(404).redirect("/badgateway");
        });
        //Obsługa błędu
        this.router.use(function (req, res, next) {
            res.status(500).send("<h1>Błąd html :(</h1>");
        });
    }
    return Router;
}());
exports.Router = Router;

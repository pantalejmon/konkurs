import { User } from './../database/user';
import express from 'express';
import passport from 'passport';
import Key from './security/key';
import * as jwt from 'jsonwebtoken';
import { AuthController } from './security/authController';
import { TokenController } from './security/tokenController';
import session from 'express-session';
import { stringify } from 'querystring';

/**
 * Klasa będąca ruterm api 
 * 
 */
export class Router {
    private router: express.Router | undefined;
    private api: string;
    private User: User;
    private AuthController: AuthController;
    constructor(app: express.Application, user: User) {
        this.api = "/apims";
        this.router = app;
        this.User = user;
        this.AuthController = new AuthController();
        console.log("Uruchamiam router");

        this.router.get(this.api + "/", (req, res, next) => {
            console.log("tp1");
            return res.send("Gratuluje, znalazles ukryte api");
        });

        let userData = {
            email: "abc",
            username: "xyz",
            password: "def"
        }
        this.router.get(this.api + "/testjson", (req, res, next) => {
            return res.send(userData);
        });

        // Logowanie
        this.router.post(this.api + "/login", (req, res, next) => {
            let email: string = req.body.email;
            let pass: string = req.body.pass;
            User.authentication(email, pass, (err: any, status: boolean, user: any) => {
                if (err) {
                    console.log(err);
                }
                if (status) {

                    let token: string = "";
                    token = TokenController.generateNewToken(user.email, 600);
                    req!.session!.token = token
                    req!.session!.username = user.email;
                    res.redirect("/user/terminal");

                }
                else {
                    res.send("Zle haslo");
                }
            });

        });

        this.router.get(this.api + "/username", (req, res, next) => {
            res.send(req!.session!.username);
        });


        this.router.get(this.api + "/login2", this.AuthController.authenticateJWT, (req, res, next) => {
            res.send("Dobry token");

        });

        this.router.get("/logout", this.AuthController.authenticateJWT, (req, res, next) => {
            req!.session!.destroy(() => {
                console.log("Usuwam sesje")
            })
            res.redirect("/login");
        });



        this.router.get("/terminal", this.AuthController.authenticateJWT, (req, res, next) => {
            res.redirect("/user/terminal");
        });


        //Rejestracja
        this.router.post(this.api + "/register", (req, res, next) => {
            let email: string = req.body.email;
            let pass: string = req.body.pass;
            let name: string = req.body.name;
            User.createUser(email, name, pass, (err: Error, user: any) => {
                if (err) {
                    console.log("cos nie wyszlo");
                }

                res.send(("Dodano użytkonika" + user.email));
            });
        });


        // Przekierowanie na index.html
        this.router.get("/", (req, res, next) => {
            res.redirect("/index");
        });

        this.router.use("/user", this.AuthController.authenticateJWT, express.static("./restricted", { index: false, extensions: ['html'] }));

        //Obsługa nie istniejącej strony
        this.router.use(function (req, res, next) {
            res.status(404).redirect("/badgateway");
        });

        //Obsługa błędu
        this.router.use(function (req, res, next) {
            res.status(500).send("<h1>Błąd html :(</h1>");
        });
    }


}
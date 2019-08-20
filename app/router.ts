import { User } from './../database/user';
import express from 'express';
import passport from 'passport';
import Key from './security/key';
import * as jwt from 'jsonwebtoken';
import { AuthController } from './security/authController';
import { TokenController } from './security/tokenController';
import session from 'express-session';
import { stringify } from 'querystring';
import { TestController } from '../database/test';

/**
 * Klasa będąca ruterm api 
 * 
 */
export class Router {
    private router: express.Router | undefined;
    private api: string;
    private User: User;
    private AuthController: AuthController;
    private testController: TestController;

    constructor(app: express.Application, user: User, pytania: TestController) {
        this.api = "/apims";
        this.router = app;
        this.User = user;
        this.AuthController = new AuthController();
        this.testController = pytania;

        // Root api
        this.router.get(this.api + "/", (req, res, next) => {
            console.log("tp1");
            return res.send("Gratuluje, znalazles ukryte api");
        });


        //*******************API ZWIĄZANE Z LOGOWANIEM I REJESTRACJĄ*****************/

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

        // Wylogowanie
        this.router.get("/logout", this.AuthController.authenticateJWT, (req, res, next) => {
            req!.session!.destroy(() => {
                console.log("Usuwam sesje")
            })
            res.redirect("/login");
        });

        // Rejestracja
        this.router.post(this.api + "/register", (req, res, next) => {
            let email: string = req.body.email;
            let pass: string = req.body.pass;
            User.createUser(email, pass, (err: Error, user: any) => {
                if (err) {
                    console.log("cos nie wyszlo" + err);
                }
                res.send(("Dodano użytkonika" + user.email));
            });
        });


        //*******************API KONKURSOWE*****************/

        // Wyslanie nazwy zalogowanego użytkownika
        this.router.get(this.api + "/username", this.AuthController.authenticateJWT, (req, res, next) => {
            res.send(req!.session!.username);
        });

        this.router.get(this.api + "/start", this.AuthController.authenticateJWT, (req, res, next) => {

            console.log("Dostalem start");
            let level: number;
            User.getLevel(req!.session!.username, (err: Error, level: number) => {
                if (level == 50) {
                    User.getAnswers(req!.session!.username, (err: Error, ans: Array<boolean>) => {
                        let wynik: number = 0;
                        for (let i: number = 0; i < ans.length; i++) {
                            if (ans[i] === true) wynik += 1;
                        }
                        let wynikPack = {
                            wynik: wynik
                        }
                        res.send(wynikPack);
                    });
                } else {
                    console.log("Odpowiadam");
                    let questPack = {
                        question: this.testController.getQuestion(level),
                        answer: this.testController.getAnswers(level)
                    }
                    res.send(questPack);
                }
            });


        });

        this.router.post(this.api + "/answer", this.AuthController.authenticateJWT, (req, res, next) => {
            console.log(req.body);
            let ans: string = req.body.answer;
            let lvl: number;

            User.getLevel(req!.session!.username, (err: Error, level: number) => {
                if (level == 50) {
                    User.getAnswers(req!.session!.username, (err: Error, ans: Array<boolean>) => {
                        let wynik: number = 0;
                        for (let i: number = 0; i < ans.length; i++) {
                            if (ans[i] === true) wynik += 1;
                        }
                        let wynikPack = {
                            wynik: wynik
                        }
                        res.send(wynikPack);
                    });
                } else {
                    if (this.testController.checkAnswers(level, ans)) {
                        //console.log("dobra odpowiedz")
                        User.setAnswer(req!.session!.username, level, true, (err: Error, usr: any) => {
                            //console.log("Level przed: " + level)
                            if (err) {
                                console.log(err);
                                return;
                            }
                            level += 1;
                            User.setLevel(req!.session!.username, level, (err: Error, lvl: number) => {
                                if (err) {
                                    console.log(err);
                                    return;
                                }
                                console.log("level po: " + lvl)
                                let questPack = {
                                    question: this.testController.getQuestion(lvl),
                                    answer: this.testController.getAnswers(lvl)
                                }
                                res.send(questPack);
                            })
                        });
                    } else {
                        level += 1;
                        User.setLevel(req!.session!.username, level, (err: Error, lvl: number) => {
                            if (err) {
                                console.log(err);
                                return;
                            }
                            let questPack = {
                                question: this.testController.getQuestion(level),
                                answer: this.testController.getAnswers(level)
                            }
                            res.send(questPack);
                        })
                    }
                }
            });

        });



        //*******************TESTY*****************/

        //Test dzialania api
        let userData = {
            email: "abc",
            username: "xyz",
            password: "def"
        }
        this.router.get(this.api + "/testjson", (req, res, next) => {
            return res.send(userData);
        });

        // Test uwierzytelnienia
        this.router.get(this.api + "/login2", this.AuthController.authenticateJWT, (req, res, next) => {
            res.send("Dobry token");
        });


        //*******************PRZEKIEROWANIA*****************/

        // Przekierowanie na terminal użytkownika
        this.router.get("/terminal", this.AuthController.authenticateJWT, (req, res, next) => {
            res.redirect("/user/terminal");
        });

        // Przekierowanie na index.html
        this.router.get("/", (req, res, next) => {
            res.redirect("/index");
        });

        //Ograniczenie dostępu do folderu restricted dostępnego dla zalogowanych użytkowników
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
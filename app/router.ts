import { User } from './../database/user';
import express from 'express';
import { AuthController } from './security/authController';
import { TokenController } from './security/tokenController';
import { TestController } from '../database/test';
import { IUser } from '../database/IUser';



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
                    if (user.valid === false) {
                        return res.redirect("/inactive.html");
                    }
                    let token: string = "";
                    token = TokenController.generateNewToken(user.email, 600);
                    req!.session!.token = token
                    req!.session!.username = user.email;
                    req!.session!.level = 1;
                    User.getPassed(email, (err: Error, tkn: boolean) => {
                        if (err) console.log(err);
                        else {
                            console.log("odczytany token:" + tkn)
                            req!.session!.tkn = tkn;
                            res.redirect("/user/terminal");
                        }
                    })

                }
                else {
                    res.redirect("/wronglogin.html");
                }
            });

        });

        // Wylogowanie
        this.router.get("/logout", this.AuthController.authenticateJWT, (req, res, next) => {
            req!.session!.destroy(() => {
                console.log("Usuwam sesje")
            })
            res.redirect("/index");
        });

        // Rejestracja
        this.router.post(this.api + "/register", (req, res, next) => {
            let email: string = req.body.email;
            let pass: string = req.body.pass;
            let teamname: string = req.body.teamname;
            let user1: string = req.body.user1;
            let user2: string = req.body.user2;
            if (!email || !pass || !teamname || !user1 || !user2) {
                res.redirect("/wrondgregistration.html");
            } else {
                User.createUser(email, pass, teamname, user1, user2, (err: Error, user: any) => {
                    if (err) {
                        console.log("cos nie wyszlo" + err);
                    }
                    res.redirect("/index");
                });
            }
        });


        //*******************API KONKURSOWE*****************/

        // Wyslanie nazwy zalogowanego użytkownika
        this.router.get(this.api + "/username", this.AuthController.authenticateJWT, (req, res, next) => {
            res.send(req!.session!.username);
        });

        this.router.get(this.api + "/start", this.AuthController.authenticateJWT, (req, res, next) => {

            console.log("Dostalem start, token:" + req!.session!.tkn);
            let level: number;
            level = req!.session!.level;
            if (req!.session!.tkn == false) {
                console.log("Level: " + level)
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
            } else {
                console.log("token true");
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
            }
        });

        this.router.post(this.api + "/answer", this.AuthController.authenticateJWT, (req, res, next) => {
            console.log(req.body);
            let ans: string = req.body.answer;
            let level: number = req!.session!.level;
            console.log("Level przed: " + level);
            if (req!.session!.tkn == false) {
                if (level === 50) {
                    User.getAnswers(req!.session!.username, (err: Error, ans: Array<boolean>) => {
                        let wynik: number = 0;
                        for (let i: number = 0; i < ans.length; i++) {
                            if (ans[i] === true) wynik += 1;
                        }
                        let wynikPack = {
                            wynik: wynik
                        }
                        if (wynik / 50 >= 0.7) User.setPassed(req!.session!.username, true, (err: Error, tkn: boolean) => {
                            req!.session!.tkn = tkn;
                        })
                        res.send(wynikPack);
                    });
                } else {
                    if (this.testController.checkAnswers(level, ans)) {
                        console.log("dobra odpowiedz")
                        User.setAnswer(req!.session!.username, level, true, (err: Error, usr: any) => {
                            //console.log("Level przed: " + level)
                            if (err) {
                                console.log(err);
                                return;
                            }
                            level += 1;

                            console.log("level po: " + level)
                            let questPack = {
                                question: this.testController.getQuestion(level),
                                answer: this.testController.getAnswers(level)
                            }
                            console.log()
                            req!.session!.level = level;
                            res.send(questPack);
                        });
                    } else {
                        level += 1;
                        req!.session!.level = level;

                        let questPack = {
                            question: this.testController.getQuestion(level),
                            answer: this.testController.getAnswers(level)
                        }
                        res.send(questPack);
                    }
                }
            } else {
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
            }
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
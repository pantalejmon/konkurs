import { User } from '../database/mongo/user';
import express from 'express';
import { AuthController } from './security/authController';
import { TokenController } from './security/tokenController';
import { TestController } from '../database/testController';
import { DataBase } from '../database/databaseController';



/**
 * Klasa będąca ruterm api 
 * 
 */
export class Router {
    private router: express.Router | undefined;
    private api: string;
    private AuthController: AuthController;
    private testController: TestController;
    private db: DataBase;
    private domain: string = "https://localhost:1234/apictf/"

    /**
     * Konstruktor definiujący konfiguracje routingu api w aplikacji
     * @param app Referencja to aplikacji Express
     * @param pytania Referencja do bazy pytań
     * @param db Referencja do bazy danych
     */
    constructor(app: express.Application, pytania: TestController, db: DataBase) {
        this.api = "/apims";
        this.router = app;
        this.AuthController = new AuthController();
        this.testController = pytania;
        this.db = db;
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

                            User.getExpires(email, (err: Error, exp: number) => {
                                if (exp - new Date().getTime() < 0) {
                                    req!.session!.level = 1;
                                    res.redirect("/user/terminal");
                                }
                                else {
                                    User.getLevel(email, (err: Error, level: number) => {
                                        if (err) console.log("Get level error:" + err);
                                        req!.session!.level = level;
                                        req!.session!.expiresTime = exp;
                                        res.redirect("/user/terminal");
                                    });
                                }
                            })
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

        // Sprawdzenie czy dany adres email nie został już wykorzystany
        this.router.post(this.api + "/mailvalidation", (req, res, next) => {
            let email = req.body.email;
            console.log(req.body);
            User.checkMailExist(email, (err: Error, status: boolean) => {
                let ans = {
                    exist: status
                }
                res.send(ans);
            });
        });

        //*******************API KONKURSOWE*****************/

        // Wyslanie nazwy zalogowanego użytkownika
        this.router.get(this.api + "/username", this.AuthController.authenticateJWT, (req, res, next) => {
            res.send(req!.session!.username);
        });

        // Odpowiedz serwera na komende start. Zależnie od ukończnia testu zwraca różne wartości
        this.router.get(this.api + "/start", this.AuthController.authenticateJWT, (req, res, next) => {
            console.log("Dostalem start, token:" + req!.session!.tkn);
            let level: number;
            level = req!.session!.level;
            if (req!.session!.tkn == false) {
                if (req!.session!.expiresTime - new Date().getTime() < 0) {
                    level = 1
                    req!.session!.level = 1;
                }
                console.log("Level: " + level)
                if (level == 51) {
                    User.getAnswers(req!.session!.username, (err: Error, ans: Array<boolean>) => {
                        let wynik: number = 0;
                        for (let i: number = 0; i < ans.length; i++) {
                            if (ans[i] === true) wynik += 1;
                        }
                        this.db.getMySQL().addPassedUser(req!.session!.username, (err: Error, id: string) => {
                            let wynikPack = {
                                wynik: wynik,
                                link: this.domain + id
                            }
                            res.send(wynikPack);
                        })
                    });
                } else if (level == 1) {
                    User.clearTest(req!.session!.username, (err: Error, user: any) => {
                        let questPack = {
                            question: this.testController.getQuestion(level),
                            answer: this.testController.getAnswers(level),
                            level: level
                        }
                        User.getExpires(req!.session!.username, (err: Error, exp: number) => {
                            req!.session!.expiresTime = exp;
                            res.send(questPack);
                        })
                    })
                } else {
                    console.log("Odpowiadam");
                    // req!.session!.expired = new Date().getTime + 3 * 60 *
                    let questPack = {
                        question: this.testController.getQuestion(level),
                        answer: this.testController.getAnswers(level),
                        level: level
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
                    this.db.getMySQL().addPassedUser(req!.session!.username, (err: Error, id: string) => {
                        let wynikPack = {
                            wynik: wynik,
                            link: this.domain + id
                        }
                        res.send(wynikPack);
                    })
                });
            }
        });

        //Odpowiedz serwera na przesłaną odpowiedz na pytanie
        this.router.post(this.api + "/answer", this.AuthController.authenticateJWT, (req, res, next) => {
            let ans: string = req.body.answer;
            let level: number = req!.session!.level;
            if (req!.session!.expiresTime - new Date().getTime() < 0) {
                level = 1
                req!.session!.level = 1;
                User.clearTest(req!.session!.username, (err: Error, user: any) => {
                    let questPack = {
                        question: this.testController.getQuestion(user.level),
                        answer: this.testController.getAnswers(user.level),
                        level: level
                    }
                    console.log()
                    req!.session!.level = user.level;
                    res.send(questPack);
                })
            } else {
                console.log("Odpowiada user: " + req!.session!.username);
                console.log("Level przed: " + level);
                console.log("Pytanie: " + this.testController.getQuestion(level))
                console.log("Podana odpowiedz:" + req.body.answer);
                if (req!.session!.tkn == false) {
                    if (level === 51) {
                        User.getAnswers(req!.session!.username, (err: Error, ans: Array<boolean>) => {
                            let wynik: number = 0;
                            for (let i: number = 0; i < ans.length; i++) {
                                if (ans[i] === true) wynik += 1;
                            }
                            if (wynik / 50 >= 0.7) User.setPassed(req!.session!.username, true, (err: Error, tkn: boolean) => {
                                req!.session!.tkn = tkn;
                            })
                            this.db.getMySQL().addPassedUser(req!.session!.username, (err: Error, id: string) => {
                                let wynikPack = {
                                    wynik: wynik,
                                    link: this.domain + id
                                }
                                res.send(wynikPack);
                            })
                        });
                    } else {
                        if (this.testController.checkAnswers(level, ans)) {
                            console.log("dobra odpowiedz")
                            User.setAnswer(req!.session!.username, level, true, (err: Error, usr: any) => {
                                if (err) {
                                    console.log(err);
                                    return;
                                }
                                level += 1;
                                User.setLevel(req!.session!.username, level, (err: Error, user: any) => {
                                    console.log(user)
                                    console.log("level po: " + level)
                                    let questPack = {
                                        question: this.testController.getQuestion(level),
                                        answer: this.testController.getAnswers(level),
                                        level: level
                                    }
                                    console.log()
                                    req!.session!.level = level;
                                    res.send(questPack);
                                })

                            });
                        } else {
                            console.log("zla odpowiedz");
                            level += 1;
                            User.setLevel(req!.session!.username, level, (err: Error, user: any) => {
                                console.log("level po: " + level)
                                let questPack = {
                                    question: this.testController.getQuestion(level),
                                    answer: this.testController.getAnswers(level),
                                    level: level
                                }
                                console.log()
                                req!.session!.level = level;
                                res.send(questPack);
                            })
                        }
                    }
                } else {
                    User.getAnswers(req!.session!.username, (err: Error, ans: Array<boolean>) => {
                        let wynik: number = 0;
                        for (let i: number = 0; i < ans.length; i++) {
                            if (ans[i] === true) wynik += 1;
                        }
                        this.db.getMySQL().addPassedUser(req!.session!.username, (err: Error, id: string) => {
                            let wynikPack = {
                                wynik: wynik,
                                link: this.domain + id
                            }
                            res.send(wynikPack);
                        })
                    });
                }
            }
        });

        // Odpowiedz na zapytanie dotyczące pozostałego czasu do końca sesji rozwiązywania testu
        this.router.get(this.api + "/time", this.AuthController.authenticateJWT, (req, res, next) => {
            let expiresTime: number = req!.session!.expiresTime
            let now: number = new Date().getTime();
            let div: number = expiresTime - now;
            console.log("Obecny czas: " + now)
            console.log("Czas konca sesji:" + expiresTime);
            console.log(div / 60000 + "minut");
            let time = {
                minutesLeft: (div / 60000).toFixed(0),
            }
            res.send(time);
        });

        this.router.get(this.api + "/reset", this.AuthController.authenticateJWT, (req, res, next) => {
            User.clearTest(req!.session!.username, (err: Error, user: any) => {
                if (err) res.sendStatus(500)
                else {
                    req!.session!.level = 1;
                    User.getExpires(req!.session!.username, (err: Error, exp: number) => {
                        req!.session!.expiresTime = exp;
                        res.sendStatus(200);
                    })

                }
            })
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
import { User } from '../database/mongo/user';
import express from 'express';
import { AuthController } from './security/authController';
import { TokenController } from './security/tokenController';
import { TestController } from '../database/testController';
import { DataBase } from '../database/databaseController';
import { Config } from './config';
import request from 'request';
import Mail from './mail';
import crypto from 'crypto';
import path from 'path';



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
    private domain: string = Config.getDomain() + Config.getApiCTF();
    private mail: Mail;

    /**
     * Konstruktor definiujący konfiguracje routingu api w aplikacji
     * @param app Referencja to aplikacji Express
     * @param pytania Referencja do bazy pytań
     * @param db Referencja do bazy danych
     */
    constructor(app: express.Application, pytania: TestController, db: DataBase, mail: Mail) {
        this.api = Config.getApiMS();
        this.router = app;
        this.AuthController = new AuthController();
        this.testController = pytania;
        this.db = db;
        this.mail = mail;
        // Root api
        this.router.get(this.api + "/", (_req, res, _next) => {
            console.log("[INFO] Wywołano api");
            return res.send("Gratuluje, znalazles ukryte api");
        });


        //*******************API ZWIĄZANE Z LOGOWANIEM I REJESTRACJĄ*****************/
        this.router.post(this.api + "/logincheck", (req, res, _next) => {
            let email: string = req.body.email;
            email = email.toLowerCase();

            let pass: string = req.body.pass;

            User.authentication(email, pass, (err: any, status: boolean, _user: any) => {
                if (err) {
                    console.log("[LOGIN] Brak autoryzacji użytkownika:" + email);
                    //console.log(err);
                }
                let zmienna = {
                    status: status
                }
                res.send(zmienna);
            });
        });
        // Logowanie
        this.router.post(this.api + "/login", (req, res, _next) => {
            let email: string = req.body.email;
            email = email.toLowerCase();
            let pass: string = req.body.pass;
            User.authentication(email, pass, (err: any, status: boolean, user: any) => {
                if (err) {
                    console.log("[LOGIN] Brak autoryzacji użytkownika:" + email);
                    //console.log(err);
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
                            console.log("[LOGIN] Zalogowano użytkownika: " + email + "  Status zaliczenia testu: " + tkn)
                            req!.session!.tkn = tkn;
                            User.getExpires(email, (_err: Error, exp: number) => {
                                if (exp - new Date().getTime() < 0) {
                                    req!.session!.level = 1;
                                    res.redirect("/user/terminal");
                                } else {
                                    User.getLevel(email, (err: Error, level: number) => {
                                        if (err) console.log("[ERROR] Błąd wczytania levelu: " + err);
                                        req!.session!.level = level;
                                        req!.session!.expiresTime = exp;
                                        res.redirect("/user/terminal");
                                    });
                                }
                            })
                        }
                    })
                } else {
                    res.redirect("/wronglogin.html");
                }
            });
        });

        // Wylogowanie
        this.router.get("/logout", this.AuthController.authenticateJWT, (req, res, _next) => {
            let email: string = req!.session!.username;
            req!.session!.destroy(() => {
                console.log("[INFO] Wylogowano użytkownika: " + email);
            })
            res.redirect("/index");
        });

        // Rejestracja
        this.router.post(this.api + "/register", (req, res, _next) => {
            // if (req.body['g-recaptcha-response'] === undefined || req.body['g-recaptcha-response'] === '' || req.body['g-recaptcha-response'] === null) {       // Brak captchy
            //     res.send("Naprawde myslales ze jestes od nas sprytniejszy? :)");
            // } else {
            //     let email = req.body.email;
            //     var secretKey = "6Lc-IL0UAAAAAJ3NVUyKxW2UMdxz4PurxwyqGYWv";
            //     var verificationUrl = "https://www.google.com/recaptcha/api/siteverify?secret=" + secretKey + "&response=" + req.body['g-recaptcha-response'] + "&remoteip=" + req.connection.remoteAddress; // Sprawdzenie captchy na serwerach google
            //     request(verificationUrl, (error: any, response: any, body: any) => {
            //         try {
            //             body = JSON.parse(body);
            //             if (body.success !== undefined && !body.success) {
            //                 console.log("[ERROR] Nieprawidłowa captcha przy rejestracji");
            //                 res.send("Naprawde myslales ze jestes od nas sprytniejszy? :)");
            //             }
            //             else {
            //                 let email: string = req.body.email;
            //                 let pass: string = req.body.pass;
            //                 let teamname: string = req.body.teamname;
            //                 let user1: string = req.body.user1;
            //                 let user2: string = req.body.user2;
            //                 let school: string = req.body.school;
            //                 let teacher: string = req.body.teacher;
            //                 let teacherMail: string = req.body.teacherMail;
            //                 let experience: string = req.body.experience;
            //                 if (!email
            //                     || !/^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/.test(email) //Mail regex
            //                     || !pass
            //                     || !/^(?=.{8,}$).*/.test(pass)       // Password regex
            //                     || !teamname
            //                     || !/^(?=.{3,}$)/.test(teamname)   // Teamname regex
            //                     || !user1
            //                     || !user2
            //                     || !teacher
            //                     || !teacherMail
            //                     || !/^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/.test(teacherMail) //teacherMail regex
            //                     || !experience
            //                 ) {
            //                     res.redirect("/wrondgregistration.html");
            //                 } else {
            //                     email = email.toLowerCase()
            //                     User.checkMailExistRegistration(email, (err: Error, status: boolean) => {
            //                         if (err) console.log(err);
            //                         if (!status) {
            //                             User.createUser(email.toLowerCase(), pass, teamname, user1, user2, school, teacher, teacherMail.toLowerCase(), experience, (err: Error, _user: any) => {
            //                                 if (err) {
            //                                     console.log("[ERROR] Błąd tworzenia użytwkownika" + err);
            //                                     res.redirect("/wrondgregistration.html");
            //                                 } else {
            //                                     this.mail.sendLink(email);
            //                                     res.redirect("/index");
            //                                 }
            //                             });
            //                         } else {
            //                             console.log("[ERROR] Nieprawidłowa dane rejestracji");
            //                             res.send("Naprawde myslales ze jestes od nas sprytniejszy? :)");
            //                         }
            //                     })
            //                 }
            //             }
            //         } catch (ex) {
            //             console.log("[ERROR] Captcha atak");
            //             console.log(ex);
            //             res.send("Naprawde myslales ze jestes od nas sprytniejszy? :)");
            //         }
            //     })
            // }

            res.send("Rejestracja została zamknięta, przepraszamy");
        });

        this.router.get(this.api + "/valid/:validationToken", (req: any, res, _next) => {
            User.getBase().findOne({ validationToken: req.params.validationToken }, (err, usr: any) => {
                if (err) console.log(err);
                else if (usr) {
                    User.getBase().updateOne({ email: usr.email }, { $set: { valid: true } }, (err, _user: any) => {
                        if (err) throw err;
                        else {
                            console.log("[REGISTRATION] Poprawnie zwalidowano użytkownika o emailu:" + usr.email);
                            this.mail.sendValid(usr.email);
                            res.redirect("/active");
                        }
                    });
                }
                else {
                    console.log("[REGISTATION] Błędna próba walidacji użytkownika");
                    res.redirect("/badgateway");
                }
            })
        })

        // Sprawdzenie czy dany adres email nie został już wykorzystany
        this.router.post(this.api + "/mailvalidation", (req, res, _next) => {
            let email = req.body.email;
            User.checkMailExist(email, (err: Error, status: boolean) => {
                let ans = {
                    exist: status,
                }
                res.send(ans);
            });

        });

        this.router.post(this.api + "/passchangestart", (req, res, _next) => {
            let email = req.body.email;
            User.checkMailExist(email, (err: Error, status: boolean) => {
                if (status) {
                    let token: string = crypto.randomBytes(30).toString('hex');
                    User.getBase().updateOne({ email: email }, { $set: { tempToken: token, tempTokenTime: new Date().getTime() + 1000 * 60 * 30 } }, (err, _user: any) => {

                        this.mail.sendPassChanger(email, token);
                        console.log("[PASSWORD] Wysyłano linka na email: " + email);

                        res.redirect("/info");
                    });
                } else {
                    res.redirect("/wronglogin");
                }

            });
        });

        this.router.get(this.api + "/passchange/:token", (req, res, _next) => {
            User.getBase().findOne({ tempToken: req.params.token }, (err, usr: any) => {
                if (err) console.log(err);
                else if (usr) {
                    if (usr.tempTokenTime > new Date().getTime()) {
                        console.log("[PASSWORD] Poprawny link zmiany hasla uzytkownika " + usr.email);
                        req!.session!.email = usr.email;
                        req!.session!.passChangeTime = usr.tempTokenTime;
                        res.sendFile(path.resolve("passForm/passform.html"));
                    }
                    else {
                        console.log("[WARNING] Nie poprawny link zmiany hasla");
                        console.log("[ERROR] warunek1:" + req!.session!.passChange + "warunek2" + (req!.session!.passChangeTime > new Date().getTime()))
                    }
                }
                else {
                    console.log("[REGISTATION] Błędna próba walidacji użytkownika");
                    res.redirect("/badgateway");
                }
            })


        });


        this.router.post(this.api + "/passconfirm", (req, res, _next) => {
            let pass = req.body.pass;
            let email = req!.session!.email;
            User.checkMailExist(email, (err: Error, status: boolean) => {
                if (req!.session!.passChangeTime > new Date().getTime()) {
                    User.changePassword(email, pass, (err: any, hash: any) => {
                        req!.session!.passChange = false;
                        req!.session!.passChangeTime = 0;
                        res.redirect("/index");
                    });

                }
            });
        });

        //*******************API KONKURSOWE*****************/

        // Wyslanie nazwy zalogowanego użytkownika
        this.router.get(this.api + "/username", this.AuthController.authenticateJWT, (req, res, _next) => {
            res.send(req!.session!.username);
        });

        // Odpowiedz serwera na komende start. Zależnie od ukończnia testu zwraca różne wartości
        this.router.get(this.api + "/start", this.AuthController.authenticateJWT, (req, res, _next) => {
            console.log("[KONKURS] Otrzymano zapytanie START od usera:" + req!.session!.username + " Status zaliczenia:" + req!.session!.tkn);
            let level: number;
            level = req!.session!.level;
            if (req!.session!.tkn == false) {
                if (req!.session!.expiresTime - new Date().getTime() < 0) {
                    level = 1
                    req!.session!.level = 1;
                }
                console.log("[KONKURS] Użytkownik:" + req!.session!.username + " jest przy pytaniu: " + + level)
                if (level == 51) {
                    User.getAnswers(req!.session!.username, (_err: Error, ans: Array<boolean>) => {
                        let wynik: number = 0;
                        for (let i: number = 0; i < ans.length; i++) {
                            if (ans[i] === true) wynik += 1;
                        }
                        if (wynik / 50 >= 0.7) User.setPassed(req!.session!.username, true, (_err: Error, tkn: boolean) => {
                            req!.session!.tkn = tkn;
                            User.getSendPassed(req!.session!.username, (err: any, sended: boolean) => {
                                if (sended) {
                                    let wynikPack = {
                                        wynik: wynik,
                                        link: Config.getDomain() + "/" + "ctf"
                                    }
                                    res.send(wynikPack);
                                } else {
                                    this.db.getMySQL().addPassedUser(req!.session!.username, this.mail, (_err: Error, id: string) => {
                                        let wynikPack = {
                                            wynik: wynik,
                                            link: Config.getDomain() + "/" + "ctf"
                                        }
                                        res.send(wynikPack);
                                    })
                                }
                            })
                        });
                        else {
                            let wynikPack = {
                                wynik: wynik,
                                link: "Brak linku"
                            }
                            res.send(wynikPack);
                        }
                    });
                } else if (level == 1) {
                    User.clearTest(req!.session!.username, (_err: Error, _user: any) => {
                        let questPack = {
                            question: this.testController.getQuestion(level),
                            answer: this.testController.getAnswers(level),
                            level: level
                        }
                        User.getExpires(req!.session!.username, (_err: Error, exp: number) => {
                            req!.session!.expiresTime = exp;
                            res.send(questPack);
                        })
                    })
                } else {
                    // req!.session!.expired = new Date().getTime + 3 * 60 *
                    let questPack = {
                        question: this.testController.getQuestion(level),
                        answer: this.testController.getAnswers(level),
                        level: level
                    }
                    res.send(questPack);
                }
            } else {
                User.getAnswers(req!.session!.username, (_err: Error, ans: Array<boolean>) => {
                    let wynik: number = 0;
                    for (let i: number = 0; i < ans.length; i++) {
                        if (ans[i] === true) wynik += 1;
                    }
                    User.getSendPassed(req!.session!.username, (err: any, sended: boolean) => {
                        console.log("Sended=" + sended);
                        if (sended) {
                            let wynikPack = {
                                wynik: wynik,
                                link: Config.getDomain() + "/" + "ctf"
                            }
                            res.send(wynikPack);
                        } else {
                            this.db.getMySQL().addPassedUser(req!.session!.username, this.mail, (_err: Error, id: string) => {
                                let wynikPack = {
                                    wynik: wynik,
                                    link: Config.getDomain() + "/" + "ctf"
                                }
                                res.send(wynikPack);
                            })
                        }
                    })
                });
            }



        });

        //Odpowiedz serwera na przesłaną odpowiedz na pytanie
        this.router.post(this.api + "/answer", this.AuthController.authenticateJWT, (req, res, _next) => {

            let ans: string = req.body.answer;
            let level: number = req!.session!.level;
            if (req!.session!.expiresTime - new Date().getTime() < 0) {
                level = 1
                req!.session!.level = 1;
                User.clearTest(req!.session!.username, (_err: Error, user: any) => {
                    let questPack = {
                        question: this.testController.getQuestion(user.level),
                        answer: this.testController.getAnswers(user.level),
                        level: level
                    }
                    req!.session!.level = user.level;
                    res.send(questPack);
                })
            } else {
                console.log("[KONKURS] Odpowiada user: " + req!.session!.username + " na pytanie: " + level);
                // console.log("Level przed: " + level);
                // console.log("Pytanie: " + this.testController.getQuestion(level))
                // console.log("Podana odpowiedz:" + req.body.answer);
                if (req!.session!.tkn == false) {
                    if (level === 51) {
                        User.getAnswers(req!.session!.username, (_err: Error, ans: Array<boolean>) => {
                            let wynik: number = 0;
                            for (let i: number = 0; i < ans.length; i++) {
                                if (ans[i] === true) wynik += 1;
                            }
                            if (wynik / 50 >= 0.7) User.setPassed(req!.session!.username, true, (_err: Error, tkn: boolean) => {
                                req!.session!.tkn = tkn;

                                User.getSendPassed(req!.session!.username, (err: any, sended: boolean) => {
                                    console.log("Sended=" + sended);
                                    if (sended) {
                                        let wynikPack = {
                                            wynik: wynik,
                                            link: Config.getDomain() + "/" + "ctf"
                                        }
                                        res.send(wynikPack);
                                    } else {
                                        this.db.getMySQL().addPassedUser(req!.session!.username, this.mail, (_err: Error, id: string) => {
                                            let wynikPack = {
                                                wynik: wynik,
                                                link: Config.getDomain() + "/" + "ctf"
                                            }
                                            res.send(wynikPack);
                                        })
                                    }
                                })
                            })
                            else {
                                let wynikPack = {
                                    wynik: wynik,
                                    link: "Nie dostaniesz linku jak nie zdales"
                                }
                                res.send(wynikPack);
                            }
                        });
                    } else {
                        if (this.testController.checkAnswers(level, ans)) {
                            //console.log("dobra odpowiedz")
                            User.setAnswer(req!.session!.username, level, true, (err: Error, _usr: any) => {
                                if (err) {
                                    console.log(err);
                                    return;
                                }
                                level += 1;
                                User.setLevel(req!.session!.username, level, (_err: Error, _user: any) => {
                                    // console.log(user)
                                    // console.log("level po: " + level)
                                    let questPack = {
                                        question: this.testController.getQuestion(level),
                                        answer: this.testController.getAnswers(level),
                                        level: level
                                    }
                                    //console.log()
                                    req!.session!.level = level;
                                    res.send(questPack);
                                })

                            });
                        } else {
                            //console.log("zla odpowiedz");
                            level += 1;
                            User.setLevel(req!.session!.username, level, (_err: Error, _user: any) => {
                                //console.log("level po: " + level)
                                let questPack = {
                                    question: this.testController.getQuestion(level),
                                    answer: this.testController.getAnswers(level),
                                    level: level
                                }
                                //console.log()
                                req!.session!.level = level;
                                res.send(questPack);
                            })
                        }
                    }
                } else {
                    User.getAnswers(req!.session!.username, (_err: Error, ans: Array<boolean>) => {
                        let wynik: number = 0;
                        for (let i: number = 0; i < ans.length; i++) {
                            if (ans[i] === true) wynik += 1;
                        }
                        User.getAnswers(req!.session!.username, (_err: Error, ans: Array<boolean>) => {
                            let wynik: number = 0;
                            for (let i: number = 0; i < ans.length; i++) {
                                if (ans[i] === true) wynik += 1;
                            }
                            User.getSendPassed(req!.session!.username, (err: any, sended: boolean) => {
                                if (sended) {
                                    let wynikPack = {
                                        wynik: wynik,
                                        link: Config.getDomain() + "/" + "ctf"
                                    }
                                    res.send(wynikPack);
                                } else {
                                    this.db.getMySQL().addPassedUser(req!.session!.username, this.mail, (_err: Error, id: string) => {
                                        let wynikPack = {
                                            wynik: wynik,
                                            link: Config.getDomain() + "/" + "ctf"
                                        }
                                        res.send(wynikPack);
                                    })
                                }
                            })
                        });
                    });
                }
            }

        });

        // Odpowiedz na zapytanie dotyczące pozostałego czasu do końca sesji rozwiązywania testu
        this.router.get(this.api + "/time", this.AuthController.authenticateJWT, (req, res, _next) => {
            let expiresTime: number = req!.session!.expiresTime
            let now: number = new Date().getTime();
            let div: number = expiresTime - now;
            console.log("[KONKURS] Obecny czas: " + now)
            console.log("[KONKURS] Czas:" + expiresTime + " dla użytkownika:" + req!.session!.username);
            console.log(div / 60000 + "minut");
            let time = {
                minutesLeft: (div / 60000).toFixed(0),
            }
            res.send(time);
        });

        this.router.get(this.api + "/reset", this.AuthController.authenticateJWT, (req, res, _next) => {
            User.clearTest(req!.session!.username, (err: Error, _user: any) => {
                if (err) res.sendStatus(500)
                else {
                    req!.session!.level = 1;
                    User.getExpires(req!.session!.username, (_err: Error, exp: number) => {
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
        this.router.get(this.api + "/testjson", (_req, res, _next) => {
            return res.send(userData);
        });

        // Test uwierzytelnienia
        this.router.get(this.api + "/login2", this.AuthController.authenticateJWT, (_req, res, _next) => {
            res.send("Dobry token");
        });


        //*******************PRZEKIEROWANIA*****************/

        // Przekierowanie na terminal użytkownika
        this.router.get("/terminal", this.AuthController.authenticateJWT, (_req, res, _next) => {
            res.redirect("/user/terminal");
        });

        // Przekierowanie na index.html
        this.router.get("/", (_req, res, _next) => {
            res.redirect("/index");
        });

        //Ograniczenie dostępu do folderu restricted dostępnego dla zalogowanych użytkowników
        this.router.use("/user", this.AuthController.authenticateJWT, express.static("./restricted", { index: false, extensions: ['html'] }));

        //Obsługa nie istniejącej strony
        this.router.use(function (_req, res, _next) {
            res.status(404).redirect("/badgateway");
        });

        //Obsługa błędu
        this.router.use(function (_req, res, _next) {
            res.status(500).send("<h1>Błąd html :(</h1>");
        });
    }
}
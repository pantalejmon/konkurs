import nodemailer from 'nodemailer';
import { Config } from './config';
import { User } from '../database/mongo/user';
import sendmail from 'sendmail'

export default class Mail {
    private transporter: nodemailer.Transporter;
    private send: any;
    constructor(privateKey: string) {
        this.transporter = nodemailer.createTransport({
            host: Config.getMailHost(),
            port: 587,
            secure: false, // upgrade later with STARTTLS
            auth: {
                user: Config.getMailUser(),
                pass: Config.getMailPass()
            },

            requireTLS: true
        })

        this.transporter.verify(function (error, success) {
            if (error) {
                console.log(error);
            } else {
                console.log("[INIT] Połączono z serwerem SMTP");
            }
        });
        this.send = sendmail({
            // dkim: {
            //     privateKey: "",
            //     keySelector: "dkim"

            // }
        });
    }

    public sendLink(mail: string) {
        User.getBase().findOne({ email: mail.toLowerCase() }, (err: any, usr: any) => {
            if (err) console.log(err);
            else if (!usr) console.log("[ERROR] Brak usera w bazie o mailu: " + mail);
            else if (!usr.teacherMail) console.log("[ERROR] Brak maila nauczyciela dla usera o mailu: " + mail);
            else {
                let mailOptions = {
                    from: 'noreply@153plus1.pl',
                    to: usr.teacherMail,
                    subject: '[CTF] Potwierdź rejestracje konta',
                    text: `Nauczycielu!\n\nOtrzymaliśmy formularz rejestracyjny zespołu ${usr.teamname} \nAby potwierdzić rejestrację kliknij w ten link: \n${Config.getDomain()}${Config.getApiMS()}/valid/${usr.validationToken}\n\nPozdrawiamy,\nZespół 153plus1.pl`
                };
                let mailOptions2 = {
                    from: 'noreply@153plus1.pl',
                    to: usr.email,
                    subject: '[CTF] Konto twojego zespołu oczekuje na potwierdzenie',
                    text: `Witaj uczestniku!\n\nTwój adres email został użyty w formularzu rejestracyjnym konkursu 153plus1.pl. W tym momencie twoje twoje konto oczekuje na potwierdzenie przez twojego opiekuna ${usr.teacherMail}.\nW razie wątpliwości, skontakuj się z nim.\n\nPozdrawiamy,\nZespół 153plus1.pl`
                };

                // this.send({
                //     from: 'noreply@153plus1.pl',
                //     to: usr.email,
                //     replyTo: 'contact@153plus1.pl',
                //     subject: '[CTF] Potwierdź rejestracje konta',
                //     text: `Witaj drużyno ${usr.teamname} \nW celu potwierdzenia rejestracji konta kliknij poniższy link: \n ${Config.getDomain()}${Config.getApiMS()}/valid/${usr.validationToken}`
                // }, (err: any, reply: any) => {
                //     //console.log(err && err.stack)
                //     //console.dir(reply)
                // })
                this.transporter.sendMail(mailOptions, (err, info) => {
                    if (err) console.log(err);
                    else {
                        console.log("[MAIL] Wysłano maila aktywacyjnego do nauczyciela: " + usr.teacherMail + " email drużyny: " + usr.email);
                    }
                })

                this.transporter.sendMail(mailOptions2, (err, info) => {
                    if (err) console.log(err);
                    else {
                        console.log("[MAIL] Wysłano maila powitalnego do drużyny: " + usr.email + " login informacyjne:" + info);
                    }
                })
            }
        })
    }


    public sendCredential(mail: string, pass: string) {
        User.getBase().findOne({ email: mail }, (err: any, usr: any) => {
            if (err) console.log(err);
            else {
                // Mail do uczestnika po przejściu etapu 1

                let textU =
                    `Gratulacje! \n`
                    + `Za Wami etap wiedzy teoretycznej. Dzięki niemu mogliście wejść w świat terminologi pentesterskiej, a my mogliśmy sprawdzić Waszą wytrwałość. Najsłabsi odpadli; dla najlepszych nadszedł czas na danie główne - solidną dawkę zadań praktycznych. Wykorzystajcie swoją wiedzę, nie bójcie się szukać pomocy w Internecie oraz u waszych opiekunów - ale przede wszystkim pamiętajcie - liczy się wytrwałość.\n\n`
                    + `Aby zalogować się do części zadaniowej - skorzystajcie z następujących poświadczeń:\n\n`
                    + `login: ${usr.email}\n`
                    + `hasło: ${pass}\n`
                    + `Link do części zadaniowej: ${Config.getDomain()}${Config.getApiCTF()} \n\n`
                    + `Po zalogowaniu pamiętajcie o zmianie hasła. Bezpieczeństwo przede wszystkim :) \n\n`
                    + `Przypominamy też o zasadach fair play. Wszelkie próby używania metod brute force powodujących niepotrzebne obciążenie na serwerze będą skutkowały trwałym banem, bez możliwości ponownego udziału w konkursie w przyszłości.\n\n`
                    + `Pozdrawiamy,\n`
                    + `Zespół 153plus1.pl`;

                let mailOptions = {
                    from: 'noreply@153plus1.pl',
                    to: mail,
                    subject: '[CTF] Dostęp do części zadaniowej',
                    text: textU
                };


                let textN =
                    `Gratulacje! \n`
                    + `Zespół ${usr.teamname}, będący pod Twoją opieką zaliczł test wiedzy teoretycznej. Na maila członka zespołu podanego podczas rejestracji wysłaliśmy wiadomość zawierającą informacje o danych dostępowych do części zadaniowej. \n\n`
                    + `Przypominamy, że pierwszy etap (trwający właśnie) ma za zadanie wyłonić przede wszystkim najbardziej utalentowane i zdeterminowane zespoły. Nie jesteśmy w stanie podczas tego etapu sprawdzić samodzielności pracy uczniów, dlatego nie jest wbrew zasadom udzielenie im przez opiekuna pomocy merytorycznej. Wręcz przeciwnie! Zachęcamy do wspólnego rozwiązania wybranego zadania, np. w ramach lekcji lub zajęć dodatkowych.\n\n`
                    + `Dziękujemy, że wspierasz pasję swoich uczniów.\n\n`
                    + `Pozdrawiamy,\n`
                    + `Zespół 153plus1.pl`;

                let mailOptions2 = {
                    from: 'noreply@153plus1.pl',
                    to: usr.teacherMail,
                    subject: '[CTF] Zespół będący pod Twoją opieką zaliczył test!',
                    text: textN
                };

                this.transporter.sendMail(mailOptions, (err, info) => {
                    if (err) console.log(err);
                    else {
                        console.log("[MAIL] Wysłano maila 2 etapu do uczestnika : " + mail);
                    }
                })

                this.transporter.sendMail(mailOptions2, (err, info) => {
                    if (err) console.log(err);
                    else {
                        console.log("[MAIL] Wysłano maila 2 etapu do nauczyciela " + usr.teacherMail);
                    }
                })
            }
        })
    }


    public sendValid(mail: string) {
        User.getBase().findOne({ email: mail }, (err: any, usr: any) => {
            if (err) console.log(err);
            else {
                let mailOptions = {
                    from: 'noreply@153plus1.pl',
                    to: usr.teacherMail,
                    subject: '[CTF] Pomyślnie zarejestrowano zespół pod Twoją opieką',
                    text: `Nauczycielu!\n\nZespół ${usr.teamname}, będący pod twoją opieką został pozytywnie zarejestrowany.\nLogin dla zespołu stanowi adres email ucznia podany w formularzu (${usr.email}).\n\nPozdrawiamy,\nZespół 153plus1.pl`
                };
                let mailOptions2 = {
                    from: 'noreply@153plus1.pl',
                    to: usr.email,
                    subject: '[CTF] Pomyślnie zarejestrowano zespół',
                    text: `Witaj uczestniku!\n\n Twoje konto zostało pomyślnie zarejestrowane. Użyjcie tego adresu email jako loginu, aby zalogować się na stronie konkursu ${Config.getDomain()}\nPowodzenia!\n\nPozdrawiamy,\nZespół 153plus1.pl`
                };

                // this.send({
                //     from: 'noreply@153plus1.pl',
                //     to: usr.email,
                //     replyTo: 'contact@153plus1.pl',
                //     subject: '[CTF] Potwierdź rejestracje konta',
                //     text: `Witaj drużyno ${usr.teamname} \nW celu potwierdzenia rejestracji konta kliknij poniższy link: \n ${Config.getDomain()}${Config.getApiMS()}/valid/${usr.validationToken}`
                // }, (err: any, reply: any) => {
                //     //console.log(err && err.stack)
                //     //console.dir(reply)
                // })
                this.transporter.sendMail(mailOptions, (err, info) => {
                    if (err) console.log(err);
                    else {
                        console.log("[MAIL] Wysłano maila potwierdzającego do nauczyciela: " + usr.teacherMail + " email drużyny: " + usr.email);
                    }
                })

                this.transporter.sendMail(mailOptions2, (err, info) => {
                    if (err) console.log(err);
                    else {
                        console.log("[MAIL] Wysłano maila potwierdzającego do drużyny: " + usr.email + " login informacyjne:" + info);
                    }
                })
            }
        })
    }





    public sendPassChanger(mail: string, token: string) {
        User.getBase().findOne({ email: mail }, (err: any, usr: any) => {
            if (err) console.log(err);
            else {
                let mailOptions = {
                    from: 'noreply@153plus1.pl',
                    to: usr.email,
                    subject: '[CTF] Zmiana hasła',
                    text: `Witaj drużyno: ${usr.teamname} \n W celu zmiany hasła kliknij na poniższy link: \n ${Config.getDomain()}${Config.getApiMS()}/passchange/${token}`
                };


                // this.send({
                //     from: 'noreply@153plus1.pl',
                //     to: usr.email,
                //     replyTo: 'contact@153plus1.pl',
                //     subject: '[CTF] Zmiana hasła',
                //     text: `Witaj drużyno ${usr.teamname} \n: W celu zmiany hasła kliknij na poniższy link: \n ${Config.getDomain()}${Config.getApiMS()}/passchange/${token}`
                // }, (err: any, reply: any) => {
                //     //console.log(err && err.stack)
                //     //console.dir(reply)
                // })
                this.transporter.sendMail(mailOptions, (err, info) => {
                    if (err) console.log(err);
                    else {
                        console.log("[MAIL] Wysłano maila zmiany hasła do: " + usr.email + " login informacyjne:" + info);
                    }
                })
            }
        })
    }

    public test(mail: string) {
        this.send({
            from: 'noreply@153plus1.pl',
            to: mail,
            replyTo: 'kontakt@153plus1.pl',
            subject: '[CTF] Potwierdź rejestracje konta',
            text: `test`
        }, (err: any, reply: any) => {
            //console.log(err && err.stack)
            //console.dir(reply)
        })
    }
} 
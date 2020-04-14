import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { Config } from '../../app/config';
import crypto from 'crypto';

/**
 * Klasa będąca schematem bazodanowym modelu użytkownika 
 */
class UserSchema extends mongoose.Schema {
    constructor() {
        super({
            email: {
                type: String,
                unique: false,
                required: true,
                trim: false
            },

            password: {
                type: String,
                required: true
            },

            teamname: {
                type: String,
                required: true
            },
            user1: {
                type: String,
                required: true
            },

            user2: {
                type: String,
                required: false
            },
            school: {
                type: String,
                required: false
            },
            teacher: {
                type: String,
                required: false
            },
            teacherMail: {
                type: String,
                required: false
            },
            experience: {
                type: String,
                required: false
            },
            validationToken: {
                type: String,
                required: true,
                unique: true,
            },
            valid: {
                type: Boolean,
                unique: false,
                required: true,
                trim: false
            },
            valid2: {
                type: Boolean,
                unique: false,
                trim: false
            },
            sendPassed: {
                type: Boolean,
                unique: false,
                trim: false
            },

            passed: {
                type: Boolean,
                unique: false,
                required: true,
                trim: false
            },

            expires: {
                type: Number,
                unique: false,
                required: true,
                trim: false
            },
            level: {
                type: Number,
                unique: false,
                required: true,
                trim: false
            },
            tempTokenTime: {
                type: Number,
                unique: false,
                required: false,
                trim: false
            },
            tempToken: {
                type: String,
                required: false,
                unique: true
            },
            answer: [{
                type: Boolean,
            }]
        });
    }
}


/**
 * Klasa będąca interfejsem komunikacyjnym z bazą mongo i dokumentem USer
 */
export class User {
    private static usr = mongoose.model('User', new UserSchema);

    /**
     * Metoda sprawdzająca poprawność hasła
     * @param email 
     * @param pass 
     * @param callback 
     */
    static authentication(email: string, pass: string, callback?: any) {
        User.usr.findOne({ email: email })
            .exec(function (err: Error, user: any) {
                if (err) {
                    return callback(err);
                } else if (!user) {
                    let error: Error = new Error("User not found");
                    return (callback(error));
                }
                bcrypt.compare(pass, user.password, (err: Error, result: any) => {
                    if (result === true) {
                        return callback(null, true, user);
                    }
                    else return callback(null, false, null);
                });
            })
    }

    /**
     * Metoda tworząca nowego użytkownika w bazie
     * @param mail 
     * @param pass 
     * @param teamname 
     * @param user1 
     * @param user2 
     * @param callback 
     */
    static createUser(mail: string, pass: string, teamname: string, user1: string, user2: string, school: string, teacher: string, teacherMail: string, experience: string, callback?: any) {
        let userData = {
            email: mail,
            password: pass,
            teamname: teamname,
            user1: user1,
            user2: user2,
            school: school,
            teacher: teacher,
            teacherMail: teacherMail,
            passed: false,
            validationToken: crypto.randomBytes(30).toString('hex'),
            answer: [] as any,
            valid: false,
            valid2: false,
            sendPassed: false,
            expires: 0,
            level: 1,
            tempToken: "0",
            tempTokenTime: 0,
            experience: experience
        }
        let i: number = 0;
        while (i < 50) {
            let b: boolean = false;
            i = userData.answer.push(b);
        }
        bcrypt.hash(userData.password, 10, (err, hash) => {
            if (err) {
                console.log(err);
                callback(err);
            }
            userData.password = hash;
            User.usr.create(userData, function (error: any, user: any) {
                if (error) {
                    console.log(error);
                    callback(error);
                }
                else {
                    console.log("[REGISTRATION] Dodano usera o mailu: ", user.email);
                    callback(null, user);
                }
            });
        })
    }
    /**
     * Metoda usuwająca użytkownika o danym mailu
     * @param mail 
     */
    static removeUser(mail: string) {
        User.usr.deleteOne({ email: mail }, (error) => {
            if (error) console.log("failed to delete user: ", mail, "\nError:", error);
            else console.log("[ADMIN] Usunięto user o emailu: " + mail);
        });
    }

    /**
     * Metoda służąca do zmiany hasła(Zaimplementowana)
     * @param mail 
     * @param newPass 
     * @param callback 
     */
    static changePassword(mail: string, newPass: string, callback?: any) {
        bcrypt.hash(newPass, 10, (err, hash) => {
            if (err) {
                console.log(err);
                callback(err);
            }
            User.usr.updateOne({ email: mail }, { $set: { password: hash } }, (err, user: any) => {
                if (err) {
                    console.log(err);
                    callback(err, null);
                }
                else {
                    callback(err, hash);
                }
            })
        })

    }

    /**
     * Metoda sprawdzająca w bazie czy dany user zaliczył test
     * @param mail 
     * @param callback 
     */
    static getPassed(mail: string, callback: any) {
        User.usr.findOne({ email: mail }, (err, user: any) => {
            if (err) {
                console.log(err);
                callback(err, null);
            }
            else callback(err, user.passed);
        })
    }

    static getSendPassed(mail: string, callback: any) {
        User.usr.findOne({ email: mail }, (err, user: any) => {
            if (err) {
                console.log(err);
                callback(err, null);
            }
            else callback(err, user.sendPassed);
        })
    }

    /**
     * Metoda ustawiająca danemu userowi zaliczenie
     * @param mail 
     * @param passed 
     * @param callback 
     */
    static setPassed(mail: string, passed: boolean, callback: any) {
        User.usr.updateOne({ email: mail }, { $set: { passed: passed } }, (err, user: any) => {
            if (err) {
                console.log(err);
                callback(err, null);
            }
            else {
                console.log(user);
                console.log("Zmieniam userowi" + mail + "token na " + passed);
                callback(err, passed);
            }
        })
    }

    static setSendPassed(mail: string, sendPassed: boolean, callback: any) {
        User.usr.updateOne({ email: mail }, { $set: { sendPassed: sendPassed } }, (err, user: any) => {
            if (err) {
                console.log(err);
                callback(err, null);
            }
            else {
                console.log(user);
                console.log("Zmieniam userowi" + mail + " flage 2 etapu  na " + sendPassed);
                callback(err, sendPassed);
            }
        })
    }

    /**
     * Metoda zwracająca tablice odpowiedzi 
     * @param mail 
     * @param callback 
     */
    static getAnswers(mail: string, callback: any) {
        User.usr.findOne({ email: mail }, (err, user: any) => {
            if (err) {
                console.log(err);
                callback(err, null);
            }
            else callback(err, user.answer);
        })
    }

    /**
     * Metoda ustawiająca odpowiedz na dane pytanie
     * @param mail 
     * @param level 
     * @param result 
     * @param callback 
     */
    static setAnswer(mail: string, level: number, result: boolean, callback: any) {
        User.usr.findOne({ email: mail }, (err, user: any) => {
            let tab: Array<boolean> = user.answer;
            tab[level - 1] = result;
            User.usr.updateOne({ email: mail }, { answer: tab }, (err, user: any) => {
                if (err) {
                    console.log(err);
                    callback(err, null);
                }
                else callback(err, user)
            })
        });
    }
    /**
     * Metoda zwracająca jako argument callbacku pytanie na którym znajduje się użytkownik
     * @param mail 
     * @param callback 
     */
    static getLevel(mail: string, callback: any) {
        User.usr.findOne({ email: mail }, (err, user: any) => {
            if (err) {
                console.log(err);
                callback(err, null);
            }
            else {
                // console.log("Zalogownay user " + user);
                callback(err, user.level);
            }

        })
    }

    /**
     * Metoda ustawiająca użytkownikowi własciwe pytanie
     * @param mail 
     * @param level 
     * @param callback 
     */
    static setLevel(mail: string, level: number, callback: any) {
        User.usr.updateOne({ email: mail }, { $set: { level: level } }, (err, user: any) => {
            if (err) {
                console.log(err);
                callback(err, null);
            }
            else callback(err, user)
        })
    }

    /**
     * Metoda sprawdzająca ile czasu zostało użytkownikowi na skończenie testu. Zwraca godzine zakończenia w milisekundach
     * @param mail 
     * @param callback 
     */
    static getExpires(mail: string, callback: any) {
        User.usr.findOne({ email: mail }, (err, user: any) => {
            if (err) {
                console.log(err);
                callback(err, null);
            }
            else callback(err, user.expires);
        })
    }

    /**
     * Metoda sprawdzająca ID użytkownika
     * @param mail 
     * @param callback 
     */
    static getID(mail: string, callback: any) {
        User.usr.findOne({ email: mail }, (err, user: any) => {
            if (err) {
                console.log(err);
                callback(err, null);
            }
            else callback(err, user._id.toString(), user.teamname);
        })
    }

    /**
     * Metoda sprawdzająca czy dany adres email występuje w bazie danych
     * @param mail 
     * @param callback 
     */
    static checkMailExist(mail: string, callback: any) {
        User.usr.findOne({ email: mail }, (err, user: any) => {
            if (err) throw err;
            else if (user && user.valid == true) callback(err, true)
            else callback(err, false);
        })
    }

    static checkMailExistRegistration(mail: string, callback: any) {
        User.usr.findOne({ email: mail }, (err, user: any) => {
            if (err) throw err;
            else if (user && user.valid == true) {
                callback(err, true)
            } else if (user && user.valid == false) {
                User.usr.deleteOne({ email: mail }, (error) => {
                    if (error) console.log("failed to delete user: ", mail, "\nError:", error);
                    else console.log("[ADMIN] Usunięto user o emailu: " + mail);
                    callback(err, false)
                });
            }
            else callback(err, false);
        })
    }

    /**
     * Metoda czyszcząca użytkownikowi aktualny wynik testu i generująca nowy czas na wykonanie
     * @param mail 
     * @param callback 
     */
    static clearTest(mail: string, callback: any) {
        let ans: Array<boolean> = new Array();
        let i: number = 0;
        while (i < 50) {
            let b: boolean = false;
            i = ans.push(b);
        }
        User.usr.updateOne({ email: mail }, { $set: { expires: (new Date().getTime() + Config.getTestDuration()), level: 1, answer: ans } }, (err, user: any) => {
            if (err) {
                console.log(err);
                callback(err, null);
            }
            else callback(err, user)
        })
    }

    /**
     * Metoda zwracająca uchwyt do bazy danych
     */
    public static getBase() {
        return User.usr;
    }
}
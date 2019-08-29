import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { Config } from '../../app/config';

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

            valid: {
                type: Boolean,
                unique: false,
                required: true,
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
                        console.log("Zalogowano użytkownika: " + email);
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
    static createUser(mail: string, pass: string, teamname: string, user1: string, user2: string, callback?: any) {
        let userData = {
            email: mail,
            password: pass,
            teamname: teamname,
            user1: user1,
            user2: user2,
            passed: false,
            answer: [] as any,
            valid: false,
            expires: 0,
            level: 1
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
            console.log("policzono hasha: ", hash)
            User.usr.create(userData, function (error: any, user: any) {
                if (error) {
                    console.log(error);
                    callback(error);
                }
                else {
                    console.log("Dodano usera o mailu: ", user.email);
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
        });
    }

    /**
     * Metoda służąca do zmiany hasła(Niezaimplementowana)
     * @param mail 
     * @param oldPass 
     * @param newPass 
     * @param callback 
     */
    static changePassword(mail: string, oldPass: string, newPass: string, callback?: any) {

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
            else callback(err, user._id.toString());
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
            else if (user) callback(err, true)
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
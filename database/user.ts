import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';


class UserSchema extends mongoose.Schema {
    constructor() {
        super({
            email: {
                type: String,
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
            password: {
                type: String,
                required: true,
            },
            answer: [{
                type: Boolean,
            }]
        });
    }
}

export class User {
    private static usr = mongoose.model('User', new UserSchema);
    constructor() {

    }

    static authentication(email: string, pass: string, callback?: any) {
        User.usr.findOne({ email: email })
            .exec(function (err: Error, user: any) {
                if (err) {
                    return callback(err);
                } else if (!user) {
                    let error: Error = new Error("User not found");
                    return (callback(error));
                }
                console.log("mail: " + email, "haslo: ", pass);
                console.log(user);
                bcrypt.compare(pass, user.password, (err: Error, result: any) => {

                    console.log("porownuje bcrypt, status:", result);
                    if (result === true) {
                        return callback(null, true, user);
                    }
                    else return callback(null, false, null);
                });
            })
    }

    static createUser(mail: string, pass: string, callback?: any) {
        let userData = {
            email: mail,
            level: 1,
            password: pass,
            answer: [] as any
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

    static removeUser(mail: string) {
        User.usr.deleteOne({ email: mail }, (error) => {
            if (error) console.log("failed to delete user: ", mail, "\nError:", error);
        });
    }

    static changePassword(mail: string, oldPass: string, newPass: string, callback?: any) {

    }

    static getLevel(mail: string, callback: any) {
        let level: number;
        User.usr.findOne({ email: mail }, (err, user: any) => {
            if (err) {
                console.log(err);
                callback(err, null);
            }
            else callback(err, user.level)
        })
    }

    static getAnswers(mail: string, callback: any) {
        User.usr.findOne({ email: mail }, (err, user: any) => {
            if (err) {
                console.log(err);
                callback(err, null);
            }
            else callback(err, user.answer);
        })
    }

    static setLevel(mail: string, lvl: number, callback: any) {
        console.log("level:" + lvl);
        User.usr.updateOne({ email: mail }, { $set: { level: lvl } }, (err, user: any) => {
            if (err) {
                console.log(err);
                callback(err, null);
            }
            else {
                console.log(user);
                console.log("Zmieniam userowi level na " + lvl);
                callback(err, lvl)
            }

        })
    }

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

    public static getBase() {
        return User.usr;
    }
}
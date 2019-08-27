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


                bcrypt.compare(pass, user.password, (err: Error, result: any) => {

                    console.log("porownuje bcrypt, status:", result);
                    if (result === true) {
                        console.log("Zalogowano użytkownika: " + email);
                        return callback(null, true, user);

                    }
                    else return callback(null, false, null);
                });
            })
    }

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

    static removeUser(mail: string) {
        User.usr.deleteOne({ email: mail }, (error) => {
            if (error) console.log("failed to delete user: ", mail, "\nError:", error);
        });
    }

    static changePassword(mail: string, oldPass: string, newPass: string, callback?: any) {

    }

    static getPassed(mail: string, callback: any) {
        User.usr.findOne({ email: mail }, (err, user: any) => {
            if (err) {
                console.log(err);
                callback(err, null);
            }
            else callback(err, user.passed);
        })
    }

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

    static getAnswers(mail: string, callback: any) {
        User.usr.findOne({ email: mail }, (err, user: any) => {
            if (err) {
                console.log(err);
                callback(err, null);
            }
            else callback(err, user.answer);
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

    static setLevel(mail: string, level: number, callback: any) {
        User.usr.updateOne({ email: mail }, { $set: { level: level } }, (err, user: any) => {
            if (err) {
                console.log(err);
                callback(err, null);
            }
            else callback(err, user)
        })
    }
    static getExpires(mail: string, callback: any) {
        User.usr.findOne({ email: mail }, (err, user: any) => {
            if (err) {
                console.log(err);
                callback(err, null);
            }
            else callback(err, user.expires);
        })
    }

    static getID(mail: string, callback: any) {
        User.usr.findOne({ email: mail }, (err, user: any) => {
            if (err) {
                console.log(err);
                callback(err, null);
            }
            else callback(err, user._id.toString());
        })
    }

    static checkMailExist(mail: string, callback: any) {
        User.usr.findOne({ email: mail }, (err, user: any) => {
            if (err) throw err;
            else if (user) callback(err, true)
            else callback(err, false);
        })
    }

    static clearTest(mail: string, callback: any) {
        User.usr.updateOne({ email: mail }, { $set: { expires: (new Date().getTime() + 720 * 60 * 1000), level: 1 } }, (err, user: any) => {
            if (err) {
                console.log(err);
                callback(err, null);
            }
            else callback(err, user)
        })
    }


    public static getBase() {
        return User.usr;
    }
}
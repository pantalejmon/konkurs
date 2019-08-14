import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { userInfo } from 'os';


class UserSchema extends mongoose.Schema {
    constructor() {
        super({
            email: {
                type: String,
                unique: false,
                required: true,
                trim: false
            },
            username: {
                type: String,
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

    static createUser(mail: string, name: string, pass: string, callback?: any) {
        let userData = {
            email: mail,
            username: name,
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

    public static getBase() {
        return User.usr;
    }
}
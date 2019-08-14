"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var mongoose_1 = __importDefault(require("mongoose"));
var bcryptjs_1 = __importDefault(require("bcryptjs"));
var UserSchema = /** @class */ (function (_super) {
    __extends(UserSchema, _super);
    function UserSchema() {
        return _super.call(this, {
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
        }) || this;
    }
    return UserSchema;
}(mongoose_1.default.Schema));
var User = /** @class */ (function () {
    function User() {
    }
    User.authentication = function (email, pass, callback) {
        User.usr.findOne({ email: email })
            .exec(function (err, user) {
            if (err) {
                return callback(err);
            }
            else if (!user) {
                var error = new Error("User not found");
                return (callback(error));
            }
            console.log("mail: " + email, "haslo: ", pass);
            console.log(user);
            bcryptjs_1.default.compare(pass, user.password, function (err, result) {
                console.log("porownuje bcrypt, status:", result);
                if (result === true) {
                    return callback(null, true, user);
                }
                else
                    return callback(null, false, null);
            });
        });
    };
    User.createUser = function (mail, name, pass, callback) {
        var userData = {
            email: mail,
            username: name,
            password: pass,
            answer: []
        };
        var i = 0;
        while (i < 50) {
            var b = false;
            i = userData.answer.push(b);
        }
        bcryptjs_1.default.hash(userData.password, 10, function (err, hash) {
            if (err) {
                console.log(err);
                callback(err);
            }
            userData.password = hash;
            console.log("policzono hasha: ", hash);
            User.usr.create(userData, function (error, user) {
                if (error) {
                    console.log(error);
                    callback(error);
                }
                else {
                    console.log("Dodano usera o mailu: ", user.email);
                    callback(null, user);
                }
            });
        });
    };
    User.removeUser = function (mail) {
        User.usr.deleteOne({ email: mail }, function (error) {
            if (error)
                console.log("failed to delete user: ", mail, "\nError:", error);
        });
    };
    User.changePassword = function (mail, oldPass, newPass, callback) {
    };
    User.getBase = function () {
        return User.usr;
    };
    User.usr = mongoose_1.default.model('User', new UserSchema);
    return User;
}());
exports.User = User;

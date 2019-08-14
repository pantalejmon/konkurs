"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var mongoose_1 = __importDefault(require("mongoose"));
var user_1 = require("./user");
var DataBase = /** @class */ (function () {
    function DataBase() {
        mongoose_1.default.connect('mongodb://localhost/konkurs', { useNewUrlParser: true });
        this.connection = mongoose_1.default.connection;
        this.connection.on('error', console.error.bind(console, 'connection error:'));
        this.usr = new user_1.User();
        this.connection.once('open', function () {
            console.log("Połaczono z bazą");
            //this.usr.createUser("test1", "test2", "test3", () => { });
        });
    }
    DataBase.prototype.getUser = function () {
        return this.usr;
    };
    return DataBase;
}());
exports.DataBase = DataBase;

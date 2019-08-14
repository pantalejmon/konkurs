"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var jwt = __importStar(require("jsonwebtoken"));
var key_1 = __importDefault(require("./key"));
var TokenController = /** @class */ (function () {
    function TokenController() {
    }
    TokenController.checkToken = function (req, res, next) {
        var token = req.headers['x-access-token'] || req.headers['authorization'] || req.session.token; // Express headers are auto converted to lowercase
        if (token) {
            if (token.startsWith('Bearer ')) {
                // Remove Bearer from string
                token = token.slice(7, token.length);
            }
            jwt.verify(token, key_1.default.getKey(), function (err, decoded) {
                if (err) {
                    req.session.destroy(function () {
                        console.log("Usuwam sesje");
                    });
                    return res.redirect("/login");
                }
                else {
                    next();
                }
            });
        }
        else {
            req.session.destroy(function () {
                console.log("Usuwam sesje");
            });
            return res.redirect("/login");
        }
    };
    TokenController.generateNewToken = function (email, expire) {
        return jwt.sign({ email: email }, key_1.default.getKey(), {
            expiresIn: '600000000'
        });
    };
    return TokenController;
}());
exports.TokenController = TokenController;

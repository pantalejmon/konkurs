"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tokenController_1 = require("./tokenController");
var AuthController = /** @class */ (function () {
    function AuthController() {
    }
    AuthController.prototype.authenticateJWT = function (req, res, next) {
        tokenController_1.TokenController.checkToken(req, res, next);
    };
    return AuthController;
}());
exports.AuthController = AuthController;

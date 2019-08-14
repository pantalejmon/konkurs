
import { NextFunction, Request, Response } from "express";
import { TokenController } from './tokenController';
import passport = require("passport");


export class AuthController {


    public authenticateJWT(req: Request, res: Response, next: NextFunction) {
        TokenController.checkToken(req, res, next)
    }
}

import { NextFunction, Request, Response } from "express";
import { TokenController } from './tokenController';

/** 
 * Klasa będąca kontrolerem autoryzacji
 * 
 */
export class AuthController {
    public authenticateJWT(req: Request, res: Response, next: NextFunction) {
        TokenController.checkToken(req, res, next)
    }
}

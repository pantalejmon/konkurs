import { Request, Response, NextFunction } from "express";
import * as jwt from 'jsonwebtoken';
import Key from "./key";

/**
 * Klasa odpowiadająca za uwierzytelnianie tokenów przechowywanych w sesji.
 * 
 */
export class TokenController {
    public static checkToken(req: Request, res: Response, next: NextFunction) {
        let token: any = req.headers['x-access-token'] || req.headers['authorization'] || req!.session!.token; // Express headers are auto converted to lowercase
        if (token) {
            if (token.startsWith('Bearer ')) {
                // Remove Bearer from string
                token = token.slice(7, token.length);
            }
            jwt.verify(token, Key.getKey(), (err: any, decoded: any) => {
                if (err) {
                    req!.session!.destroy(() => {
                        console.log("Usuwam sesje")
                    })
                    return res.redirect("/login")
                } else {
                    next();
                }
            });
        } else {
            req!.session!.destroy(() => {
                console.log("Usuwam sesje")
            })
            return res.redirect("/login")
        }
    }

    public static generateNewToken(email: string, expire: number): string {
        return jwt.sign({ email: email }, Key.getKey(), {
            expiresIn: '600000000'
        })
    }
}
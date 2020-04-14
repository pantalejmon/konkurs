import { Request, Response, NextFunction } from "express";
import * as jwt from 'jsonwebtoken';
import Key from "./key";

/**
 * Klasa odpowiadająca za uwierzytelnianie tokenów przechowywanych w sesji.
 * 
 */
export class TokenController {

    /**
     * Metoda służąca do sprawdzenia poprawności tokena przechowywanego w sesji, lub też w nagłówku http
     * @param req 
     * @param res 
     * @param next 
     */
    public static checkToken(req: Request, res: Response, next: NextFunction) {
        let token: any = req.headers['x-access-token'] || req.headers['authorization'] || req!.session!.token; // Express headers are auto converted to lowercase
        if (token) {
            // Sprawdzenie czy nie ma jakiegoś śmieciowego stringa
            if (token.startsWith('Bearer ')) {
                token = token.slice(7, token.length); // 
            }
            // Weryfikacja tokena
            jwt.verify(token, Key.getKey(), (err: any, decoded: any) => {
                if (err) {
                    req!.session!.destroy((err) => {
                        if (err) throw err;
                    });
                    return res.redirect("/login")
                } else {
                    next();
                }
            });
        } else {
            req!.session!.destroy((err) => {
                if (err) throw err;
            })
            return res.redirect("/login")
        }
    }

    /**
     * Generacja tokena
     * @param email Adres email użytkownika dla którego tworzony jest token.
     * @param expire Czas po jakim token przestaje działać (Nieaktywane)
     */
    public static generateNewToken(email: string, expire: number): string {
        return jwt.sign({ email: email }, Key.getKey(), {
            expiresIn: '600000000'
        })
    }
}
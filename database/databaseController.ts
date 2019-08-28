import mongoose from "mongoose"
import MySQLController from './mysql/ctfMySQLController';

/**
 * Klasa kontroler bazy danych
 */
export class DataBase {
    public connection: mongoose.Connection;
    private mysql: MySQLController
    /**
     * Konstruktor łączący z Mongo i MySQL
     */
    constructor() {
        mongoose.connect('mongodb://localhost/konkurs', { useNewUrlParser: true });
        this.connection = mongoose.connection;
        this.connection.on('error', console.error.bind(console, 'connection error:'));
        this.connection.once('open', () => {
            console.log("Połaczono z bazą");
            //this.usr.createUser("test1", "test2", "test3", () => { });
        });
        this.mysql = new MySQLController();
    }

    /**
     * Getter 
     */
    public getMySQL(): MySQLController {
        return this.mysql;
    }
}
import MySQL from 'mysql'
import { User } from '../mongo/user';
import { DataBase } from '../databaseController';
import { Config } from '../../app/config';

/**
 * Klasa służąca do zapisywania do bazy danych MySQL informacji o zaliczonych testach użytkownika
 */

export default class MySQLController {

    //private connection: MySQL.Connection;

    /**
     * Konstruktor otwierający połączenie z bazą danych
     */
    constructor() {
        // this.connection = MySQL.createConnection({
        //     host: Config.getMySQLAddress(),
        //     user: Config.getMySQLUser(),
        //     password: Config.getMySQLPass(),
        //     database: Config.getMySQLSchema()
        // })

        // this.connection.connect((err) => {
        //     if (err) throw err;
        //     console.log("Connected to mySQL");
        // })
    }

    /**
     * Metoda dodojąca zaliczonego usera do bazy danych mysql
     * @param email 
     * @param callback 
     */
    public addPassedUser(email: string, callback: any) {
        // User.getID(email, (err: Error, id: string) => {
        //     if (err) throw err;
        //     else {
        //         let sql: string = "INSERT IGNORE INTO " + Config.getMySQLTablename() + "(email, uuid) VALUES ('" + email + "','" + id + "')";
        //         this.connection.query(sql, (err, result) => {
        //             if (err) throw err;
        //             else {
        //                 console.log("Dodano do mysql usera: " + email);
        //                 callback(err, id);
        //             }
        //         })
        //     }
        // })
    }

    /**
     * Getter i setter połączenia z bazą 
     */
    // public getConnection(): MySQL.Connection {
    //     return this.connection;
    // }

    // public setConnection(connection: MySQL.Connection): void {
    //     this.connection = connection;
    // }
}
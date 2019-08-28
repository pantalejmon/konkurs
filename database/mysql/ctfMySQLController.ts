import MySQL from 'mysql'
import { User } from '../mongo/user';
import { DataBase } from '../databaseController';

/**
 * Klasa służąca do zapisywania do bazy danych MySQL informacji o zaliczonych testach użytkownika
 */

export default class MySQLController {
    private user: string = "admin";
    private pass: string = "admin";
    private schema: string = "konkurs"
    private address: string = "localhost"
    private tablename: string = "test_passed"
    private connection: MySQL.Connection;

    /**
     * Konstruktor otwierający połączenie z bazą danych
     */
    constructor() {
        this.connection = MySQL.createConnection({
            host: this.address,
            user: this.user,
            password: this.pass,
            database: this.schema
        })

        this.connection.connect((err) => {
            if (err) throw err;
            console.log("Connected to mySQL");
        })
    }

    /**
     * Metoda dodojąca zaliczonego usera do bazy danych mysql
     * @param email 
     * @param callback 
     */
    public addPassedUser(email: string, callback: any) {
        User.getID(email, (err: Error, id: string) => {
            if (err) throw err;
            else {
                let sql: string = "INSERT IGNORE INTO " + this.tablename + "(email, uuid) VALUES ('" + email + "','" + id + "')";
                this.connection.query(sql, (err, result) => {
                    if (err) throw err;
                    else {
                        console.log("Dodano do mysql usera: " + email);
                        callback(err, id);
                    }
                })
            }
        })
    }

    /**
     * Getter i setter połączenia z bazą
     */
    public getConnection(): MySQL.Connection {
        return this.connection;
    }

    public setConnection(connection: MySQL.Connection): void {
        this.connection = connection;
    }
}
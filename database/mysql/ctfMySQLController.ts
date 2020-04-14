import MySQL from 'mysql'
import { User } from '../mongo/user';
import { DataBase } from '../databaseController';
import { Config } from '../../app/config';
import crypto from 'crypto';
import Mail from '../../app/mail';

/**
 * Klasa służąca do zapisywania do bazy danych MySQL informacji o zaliczonych testach użytkownika
 */

export default class MySQLController {

    private connection: MySQL.Connection;

    /**
     * Konstruktor otwierający połączenie z bazą danych
     */
    constructor() {
        this.connection = MySQL.createConnection({
            host: Config.getMySQLAddress(),
            user: Config.getMySQLUser(),
            password: Config.getMySQLPass(),
            database: Config.getMySQLSchema()
        })

        this.connection.connect((err) => {
            if (err) throw err;
            console.log("[INIT] Połączono z bazą MySQL");
        })
    }

    /**
     * Metoda dodojąca zaliczonego usera do bazy danych mysql
     * @param email 
     * @param callback 
     */
    public addPassedUser(email: string, mail: Mail, callback: any) {
        User.getBase().findOne({ email: email }, (err: Error, user: any) => {
            if (err) throw err;
            else if (!user) console.log("[ERROR] Brak usera o podanej nazwie");
            else {
                let password = crypto.randomBytes(8).toString('hex');
                //console.log(user);
                user.teamname = user.teamname.replace('"', '""');
                user.teamname = user.teamname.replace("'", "''");
                let sql: string = "INSERT IGNORE INTO " + Config.getMySQLTablename() + ' values (NULL,NULL,"' + user.teamname + '","' + crypto.createHash("sha256").update(password).digest("hex") + '","' + user.email + '","user",NULL,NULL,NULL,NULL,NULL,0,0,1,NULL,NULL)';
                this.connection.query(sql, (err, result) => {
                    if (err) throw err;
                    else {
                        console.log("[MYSQL] Dodano do mysql usera: " + email);
                        mail.sendCredential(email, password);
                        User.setSendPassed(email, true, (err: any, passed: any) => {
                            if (err) console.log(err);
                            else {
                                console.log("[INFO] Ustawiono userowi: " + email + " flage sendPassed");
                                callback(err, email);
                            }
                        })

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

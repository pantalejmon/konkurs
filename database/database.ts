import mongoose from "mongoose"
import { User } from './user';

export class DataBase {
    public connection: mongoose.Connection;
    public usr: User;
    constructor() {
        mongoose.connect('mongodb://localhost/konkurs', { useNewUrlParser: true });
        this.connection = mongoose.connection;
        this.connection.on('error', console.error.bind(console, 'connection error:'));
        this.usr = new User();
        this.connection.once('open', () => {
            console.log("Połaczono z bazą");
            //this.usr.createUser("test1", "test2", "test3", () => { });
        });
    }
    public getUser() {
        return this.usr;
    }
}
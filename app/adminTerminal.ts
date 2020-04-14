import { User } from "../database/mongo/user";
import fs from 'fs';
import { Config } from "./config";



interface terminal {
    input: NodeJS.ReadStream,
    output: NodeJS.WriteStream
}

export class AdminTerminal implements terminal {
    input: NodeJS.ReadStream = process.stdin;
    output: NodeJS.WriteStream = process.stdout;



    constructor() {
        this.printYellow("[INIT] Uruchomiono terminal administracyjny \n");
        setTimeout(() => this.printYellow("Terminal konkursowy> "), 5000);
        this.input.on('data', (data: Buffer) => {
            //console.log(data.toString());
            //("\x1b[32m%s\x1b[0m", "Podaj haslo do zalogowania: ");

            this.recognizeData(data.toString());
            this.printYellow("Terminal konkursowy> ")
        });
    }

    private recognizeData(data: string) {
        data = data.replace("\r", "");
        data = data.replace("\n", "");
        data = data.toLowerCase();
        let inputTable: Array<string> = data.split(" ");

        switch (inputTable[0]) {
            case "hello":
                this.output.write("Witaj ziomus\n");
                break;
            case "user":
                this.user(inputTable);
                break;
            case "clean":
                this.cleanDatabase();
                break;
            case "valid":
                this.multiValidation(inputTable[1]);
                break;
            case "help":
                this.printHelp("");
                break;
            default:
                this.printRed("Nieznana komenda, w celu poznania możliwych komend wpisz help\n");
                this.printHelp("");
                break;
        }
    }



    private user(input: Array<string>) {
        if (input[0] != "user") return;
        switch (input[1]) {
            case "list":
                this.listUser(input[2]);
                break;
            case "valid":
                this.validUser(input[2]);
                break;
            case "valid2":
                this.validUser(input[2]);
                break;
            case "del":
                this.delUser(input[2]);
                break;
            case "pass":
                this.passwordChange(input[3], input[2]);

            default:
                this.printHelp("user");
        }
    }

    private passwordChange(newPass: string, user: string) {
        User.changePassword(user, newPass, (err: any, hash: any) => {
            if (err) throw err;
            else console.log("Pomyslnie zmienione hasło");
        })
    }
    private listUser(arg: string) {
        console.log("Dostalem user list")
        switch (arg) {
            case "-p":
                this.printPassed();
                break;
            case "-a":
                this.printActive();
            default:
                this.printAll();
        }
    }

    private validUser(email: string) {
        User.getBase().updateOne({ email: email }, { $set: { valid: true } }, (err, user: any) => {
            if (err) throw err;
            else if (user.n == 0) this.printRed("User o emailu: " + email + " nie występuje w bazie danych" + "\n");
            else this.printGreen("Poprawnie dodano walidacje userowi: " + email + "\n");

            //console.log(user);

        });
    }

    private valid2User(email: string) {
        User.getBase().updateOne({ email: email }, { $set: { valid2: true } }, (err, user: any) => {
            if (err) throw err;
            else if (user.n == 0) this.printRed("User o emailu: " + email + " nie występuje w bazie danych" + "\n");
            else this.printGreen("Poprawnie dodano walidacje2 userowi: " + email + "\n");

            //console.log(user);

        });
    }

    private delUser(email: string) {
        User.removeUser(email);
        //console.log(user);


    }

    private multiValidation(path?: string) {
        let data: string = "";
        if (path) {
            try {
                data = fs.readFileSync(path).toString();
            }
            catch{
                this.printRed("Plik o ścieżce: " + path + " nie istnieje \n")
                return;
            }

        }
        else {
            try {
                data = fs.readFileSync(Config.getValidationFile()).toString();
            }
            catch{
                this.printRed("brak pliku: " + Config.getValidationFile() + " w folderze projektu \n")
                return;
            }
        }
        let users: Array<string> = data.split(/\r?\n/);
        for (let user of users) {
            this.validUser(user);
        }
        //this.printYellow("Terminal konkursowy> ")
    }

    private printPassed() {
        User.getBase().find({ valid: true }, (err, users) => {
            console.log("\nLista użytkowników którzy zaliczyli test: ");
            let usr: any
            for (usr of users) {
                this.printGreen(usr.email + "\n");
            }
            this.printYellow("Terminal konkursowy> ")
        })
    }

    private printActive() {
        User.getBase().find({ valid: true }, (err, users) => {
            console.log("\nLista aktywnych użytkowników w bazie: ")
            let usr: any
            for (usr of users) {
                this.printBlue(usr.email + "\n");
            }
            this.printYellow("Terminal konkursowy> ")
        })

    }


    private printAll() {
        User.getBase().find({}, (err, users) => {
            console.log("\nLista zarejestrowanych użytkowników w bazie: ")
            let notvalid: number = 0;
            let passed: number = 0;
            let valid: number = 0;
            let valid2: number = 0;
            let usr: any
            for (usr of users) {
                if (usr.valid == false) {
                    this.printRed(usr.email + "\n");
                    notvalid++;
                } else {
                    if (usr.passed == true) {
                        this.printGreen(usr.email + "\n");
                        passed++;
                    }
                    else {
                        this.printBlue(usr.email + "\n");
                        valid++;
                    }
                }
                if (usr.valid2 && usr.valid2 == true) {
                    this.printYellow(usr.email + "\n");
                    valid2++;
                }
            }
            this.printYellow("----------------------------\n");
            this.printYellow("PODSUMOWANIE\n");
            this.printYellow("----------------------------\n");
            this.printRed("Liczba niezwalidowanych zespołów: " + notvalid + "\n");
            this.printBlue("Liczba zwalidowanych zespołów(Bez zaliczonego testu): " + valid + "\n");
            this.printYellow("Liczba zwalidowanych zespołów (valid2) niezależnie od wyniku testu: " + valid2 + "\n");
            this.printGreen("Liczba zespołów które zaliczyły test: " + passed + "\n");
            this.printYellow("----------------------------\n");

            this.printYellow("Terminal konkursowy> ")
        })
    }

    private printHelp(cmd: string) {
        this.printGreen("Witaj w oknie pomocy terminala konkursu 153plus1\n");
        this.printBlue("Dostępne komendy:(stan na 29.10.2019)\n");
        this.printYellow("user list");
        this.printBlue(" - Drukuje zarejestrowanych użytkowników(Czerwony nie zwalidowany, niebieski zwalidowany, zielony zaliczony test)\n");
        this.printYellow("user list -p");
        this.printBlue(" - Drukuje zdanych użytkowników\n");
        this.printYellow("user list -a");
        this.printBlue(" - Drukuje aktywnych użytkowników użytkowników\n");
        this.printYellow("user valid");
        this.printGreen(" [ADRES EMAIL]")
        this.printBlue(" - waliduje użytkownika o danym adresie email\n");
        this.printYellow("user valid2");
        this.printGreen(" [ADRES EMAIL]")
        this.printBlue(" - waliduje (2 walidacja) użytkownika o danym adresie email\n");

        this.printYellow("user del");
        this.printGreen(" [ADRES EMAIL]")
        this.printBlue(" - usuwa użytkownika o danym adresie email\n");
        this.printYellow("user pass");
        this.printGreen(" [ADRES EMAIL] [NOWE HASŁO]")
        this.printBlue(" - Zmienia hasło użytkownikowi o podanym emailu\n");
        this.printYellow("valid");
        this.printGreen(" [ŚCIEŻKA DO PLIKU]")
        this.printBlue(" - Waliduje maile użytkowników z pliku o podanej ścieżce, domyślnie jest to plik " + Config.getValidationFile() + "\n");
    }

    /******************Obsługa kolorowego tekstu********************************* */
    private printBlue(text: string) {
        this.output.write("\x1b[94m" + text + "\x1b[0m");  //cyan
    }
    private printYellow(text: string) {
        this.output.write("\x1b[93m" + text + "\x1b[0m");  //yellon
    }
    private printGreen(text: string) {
        this.output.write("\x1b[92m" + text + "\x1b[0m");  //green
    }

    private printRed(text: string) {
        this.output.write("\x1b[91m" + text + "\x1b[0m");  //red
    }



    private cleanDatabase() {
        let valid: Array<string> = new Array<string>();
        let invalid: Array<string> = new Array<string>();
        let duplicate: Array<string> = new Array<string>();
        User.getBase().find({}, (err, users) => {
            let usr: any
            for (usr of users) {
                if (usr.valid === true && !valid.includes(usr.email)) {
                    valid.push(usr.email);
                    if (invalid.includes(usr.email)) {
                        duplicate.push(usr.email);
                    }
                }
                else if (usr.valid === false && !invalid.includes(usr.email) && !valid.includes(usr.email)) {
                    invalid.push(usr.email);
                }
                else {
                    duplicate.push(usr.email);
                }
            }
            for (let mail of duplicate) {
                this.printYellow(mail + "\n");
            }
        });



    }

}
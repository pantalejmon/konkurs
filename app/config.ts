export class Config {
    private static mySQLUser: string = "nodejs";
    private static mySQLPass: string = "uYae1rohaseig5oG";
    private static mySQLSchema: string = "ctfd";
    private static mySQLAddress: string = "127.0.0.1";
    private static mySQLTablename: string = "users";
    private static mongoAddress: string = "mongodb://localhost/konkurs";
    private static domain: string = "https://153plus1.pl"

    private static testDuration: number = 720/** Only this edit[minutes]*/ * 60 * 1000;
    private static testSource: string = "./pytania.json";
    private static rateLimitMax: number = 300
    private static rateLimitTime: number = 15/** Only this edit[minutes]*/ * 60 * 1000;
    private static apiMS: string = "/apims";
    private static apiCTF: string = "/ctf";
    private static validatiomFile: string = "valid.txt"
    private static mailUser: string = "noreply@153plus1.pl";
    private static mailPass: string = "doo7Rasa1";
    private static mailHost: string = "153plus1.pl";
    private static mailPort: number = 587;
    private static startTime: number = new Date("2019-11-03T08:00:00+0000").getTime();

    public static getStartTime(): number {
        return this.startTime;
    }

    public static getMailPort(): number {
        return this.mailPort;
    }

    public static getDomain(): string {
        return this.domain;
    }

    public static getMailUser(): string {
        return this.mailUser;
    }

    public static getMailPass(): string {
        return this.mailPass;
    }

    public static getMailHost(): string {
        return this.mailHost;
    }

    public static getValidationFile(): string {
        return this.validatiomFile;
    }

    public static getMySQLUser(): string {
        return this.mySQLUser;
    }

    public static getMySQLPass(): string {
        return this.mySQLPass;
    }

    public static getMySQLSchema(): string {
        return this.mySQLSchema;
    }

    public static getMySQLAddress(): string {
        return this.mySQLAddress;
    }

    public static getMySQLTablename(): string {
        return this.mySQLTablename;
    }

    public static getMongoAddress(): string {
        return this.mongoAddress;
    }

    public static getTestDuration(): number {
        return this.testDuration;
    }

    public static getTestSource(): string {
        return this.testSource;
    }

    public static getRateLimitMax(): number {
        return this.rateLimitMax;
    }

    public static getRateLimitTime(): number {
        return this.rateLimitTime;
    }

    public static getApiMS(): string {
        return this.apiMS;
    }

    public static getApiCTF(): string {
        return this.apiCTF;
    }



}

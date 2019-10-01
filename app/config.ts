export class Config {
    private static mySQLUser: string = "admin";
    private static mySQLPass: string = "admin";
    private static mySQLSchema: string = "konkurs";
    private static mySQLAddress: string = "localhost";
    private static mySQLTablename: string = "test_passed";
    private static mongoAddress: string = "mongodb://localhost/konkurs";

    private static testDuration: number = 720/** Only this edit[minutes]*/ * 60 * 1000;
    private static testSource: string = "./pytania.json";
    private static rateLimitMax: number = 300
    private static rateLimitTime: number = 15/** Only this edit[minutes]*/ * 60 * 1000;
    private static apiMS: string = "/apims";
    private static apiCTF: string = "/apictf";
    private static validatiomFile = "valid.txt"


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


export default class Key {
    private static tokenKey: string = "bardzotajnehaslo"
    public static getKey(): string {
        return this.tokenKey;
    }
}
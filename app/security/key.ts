/**
 * Klasa przechowywująca klucze zabezpieczeń
 */
export default class Key {
    /**
     * Klucz do tokena JWT
     */
    private static tokenKey: string = "bardzotajnehaslo"
    public static getKey(): string {
        return this.tokenKey;
    }
}
import fs from 'fs'
import { Config } from '../app/config';
/**
 * Plik posiadający odpowiednie narzędzia do zarządzania pytaniami
 */

/**
 * Interfejs opisujący szablon pytania
 */
interface question {
    id: number,
    tresc: string,
    poprawna_odpowiedz: string,
    niepoprawne_odpowiedzi: Array<string>
}

/**
 * Interfejs opisujący całą baze pytań
 */
interface testBase {
    wersja_bazy_pytan: string;
    data_aktualizacji: string;
    pytania: Array<question>

}

/**
 * Klasa będąca kontrolerem pytań i posiadająca metody do zarządzania tymi pytaniami.
 */
export class TestController {
    bazaPytan: testBase;

    /**
     * Konstruktor wczytujący baze pytań z pliku json
     */
    constructor() {
        const test: any = fs.readFileSync(Config.getTestSource());
        this.bazaPytan = JSON.parse(test.toString().trim());
        console.log("Wczytano baze pytan o numerze: ", this.bazaPytan.wersja_bazy_pytan);
        console.log("Data wydania bazy pytan: ", this.bazaPytan.data_aktualizacji);
    }

    /**
     * Metoda zwracająca pytanie o danym id
     * @param id 
     */
    getQuestion(id: number): string {
        return this.bazaPytan.pytania[id - 1].tresc;
    }

    /**
     * Metoda zwracająca odpowiedzi na pytanie o danym id. Odpowiedzi nie wskazują która jest poprawna i są w kolejności losowej
     * @param id 
     */
    getAnswers(id: number): Array<string> {
        let temp: Array<string> = Object.assign([], this.bazaPytan.pytania[id - 1].niepoprawne_odpowiedzi);
        temp.push(this.bazaPytan.pytania[id - 1].poprawna_odpowiedz);
        this.shuffleArray(temp);
        return temp;
    }

    /**
     * Sprawdzenie czy dana odpowiedz jest poprana na dane pytanie
     * @param id 
     * @param answer 
     */
    checkAnswers(id: number, answer: string): boolean {
        return (this.bazaPytan.pytania[id - 1].poprawna_odpowiedz === answer) ? true : false;
    }

    /**
     * Sprawdzenie czy dana odpowiedz jest poprana na dane pytanie
     * @param pytanie 
     * @param answer 
     */
    checkAnswersString(pytanie: string, answer: string): boolean {
        let correctAnswer: string = "";
        for (let i: number = 0; i < this.bazaPytan.pytania.length; i++) {
            if (this.bazaPytan.pytania[i].tresc === pytanie) correctAnswer = this.bazaPytan.pytania[i].poprawna_odpowiedz;
        }
        return (correctAnswer === answer) ? true : false;
    }

    /**
     * Metoda mieszająca pytania
     * @param array 
     */
    shuffleArray(array: Array<any>) {
        for (let i: number = array.length - 1; i > 0; i--) {
            let j: number = Math.floor(Math.random() * (i + 1));
            let temp: any = array[i];
            array[i] = array[j];
            array[j] = temp;
        }
    }
} 
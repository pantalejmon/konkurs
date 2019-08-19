import fs from 'fs'
import { raw } from 'body-parser';

interface question {
    id: number,
    tresc: string,
    poprawna_odpowiedz: string,
    niepoprawne_odpowiedzi: any

}


interface testBase {
    wersja_bazy_pytan: string;
    data_aktualizacji: string;
    pytania: Array<question>

}

export class TestController {
    bazaPytan: testBase;
    constructor() {
        const test: any = fs.readFileSync("./pytania.json");
        this.bazaPytan = JSON.parse(test.toString().trim());
        console.log("Wczytano baze pytan o numerze: ", this.bazaPytan.wersja_bazy_pytan);
        console.log("Data wydania bazy pytan: ", this.bazaPytan.data_aktualizacji);
    }

    getQuestion(id: number): string {
        return this.bazaPytan.pytania[id - 1].tresc;
    }

    getAnswers(id: number): Array<string> {
        let temp: Array<string> = Object.assign([], this.bazaPytan.pytania[id - 1].niepoprawne_odpowiedzi);
        temp.push(this.bazaPytan.pytania[id - 1].poprawna_odpowiedz);
        this.shuffleArray(temp);
        return temp;
    }

    checkAnswers(id: number, answer: string): boolean {
        return (this.bazaPytan.pytania[id - 1].poprawna_odpowiedz === answer) ? true : false;
    }


    checkAnswers(pytanie: string, answer: string): boolean {
        let correctAnswer: string;
        for (let i: number = 0; i < this.bazaPytan.pytania.length; i++) {
            if (this.bazaPytan.pytania[i].tresc === pytanie) correctAnswer = this.bazaPytan.pytania[i].poprawna_odpowiedz;
        }
        return (correctAnswer === answer) ? true : false;
    }

    shuffleArray(array: Array<any>) {
        for (let i: number = array.length - 1; i > 0; i--) {
            let j: number = Math.floor(Math.random() * (i + 1));
            let temp: any = array[i];
            array[i] = array[j];
            array[j] = temp;
        }
    }
} 
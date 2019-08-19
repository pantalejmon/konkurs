"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var fs_1 = __importDefault(require("fs"));
var TestController = /** @class */ (function () {
    function TestController() {
        var test = fs_1.default.readFileSync("./pytania.json");
        this.bazaPytan = JSON.parse(test.toString().trim());
        console.log("Wczytano baze pytan o numerze: ", this.bazaPytan.wersja_bazy_pytan);
        console.log("Data wydania bazy pytan: ", this.bazaPytan.data_aktualizacji);
        console.log(this.getAnwsers(1));
    }
    TestController.prototype.getQuestion = function (id) {
        return this.bazaPytan.pytania[id - 1].tresc;
    };
    TestController.prototype.getAnwsers = function (id) {
        var temp = Object.assign([], this.bazaPytan.pytania[id - 1].niepoprawne_odpowiedzi);
        temp.push(this.bazaPytan.pytania[id - 1].poprawna_odpowiedz);
        this.shuffleArray(temp);
        return temp;
    };
    TestController.prototype.shuffleArray = function (array) {
        for (var i = array.length - 1; i > 0; i--) {
            var j = Math.floor(Math.random() * (i + 1));
            var temp = array[i];
            array[i] = array[j];
            array[j] = temp;
        }
    };
    return TestController;
}());
exports.TestController = TestController;

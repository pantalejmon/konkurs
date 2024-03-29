var Terminal = Terminal || {};
var Command = Command || {};

// Note: The file system has been prefixed as of Google Chrome 12:
window.requestFileSystem = window.requestFileSystem || window.webkitRequestFileSystem;


let oldCommand = [];
let status = 0;
let fullscreen = false;

var promptLine = "~/Konkurs$"
let answers = {
    a: "",
    b: "",
    c: "",
    d: ""
}
/**
 * Terminal Events
 */
Terminal.Events = function (inputElement, OutputElement) {

    var input = document.getElementById(inputElement);
    var body = document.getElementById('body');
    document.getElementById('cmdline').scrollIntoView();

    // Input Keypress
    input.onkeydown = function (event) {
        if (event.which == 13 || event.keyCode == 13) {

            // Input Value
            var inputValue = input.value;
            var output = new Terminal.Output(OutputElement);

            // Check Command Empty
            if (inputValue == '') {
                return false;
            }
            if (inputValue.replace(" ", "").length === 1) {
                inputValue = "answer " + inputValue.replace(" ", "")
            }
            // Command
            var inputParse = inputValue.split(' ');
            var command = inputParse[0].toLowerCase();

            // Get Command
            var commandInstance = Command.Factory.create(command);
            oldCommand.push(inputValue);
            status = oldCommand.length;
            var fsCallback = commandInstance.getFsCallback(inputParse, output);
            input.value = '';
        }


        if (event.which == 38 || event.keyCode == 38) {
            console.log("status: " + status);
            if (oldCommand.length > 0 && status > 0) {
                status -= 1;
                input.value = oldCommand[status];
                setCaretPosition(input, input.value.length);
            } else {
                status = 0;
                input.value = "";
            }
        }

        if (event.which == 40 || event.keyCode == 40) {
            console.log("status: " + status);
            if (oldCommand.length > 0 && status < oldCommand.length) {
                status += 1;
                input.value = oldCommand[status - 1];
                setCaretPosition(input, input.value.length);
            } else {
                input.value = "";
            }
        }
        return true;
    };

    // Click Body
    body.onclick = function () {
        input.focus();
    };
};

function setCaretPosition(ctrl, pos) {
    // Modern browsers
    if (ctrl.setSelectionRange) {
        ctrl.focus();
        ctrl.setSelectionRange(pos, pos);

        // IE8 and below
    } else if (ctrl.createTextRange) {
        var range = ctrl.createTextRange();
        range.collapse(true);
        range.moveEnd('character', pos);
        range.moveStart('character', pos);
        range.select();
    }
}

/**
 * Output
 */
Terminal.Output = function (element) {

    var outputElement = document.getElementById(element);
    this.write = function (content, input) {
        if (!input) input = "";
        var fromContent = outputElement.innerHTML;
        fromContent += '<div class="cmd-output">';
        fromContent += promptLine + input + "<div>" + content + "</div>";
        fromContent += '</div>';
        outputElement.innerHTML = fromContent;
        return this;
    };

    this.simpleWrite = function (content, input) {
        var fromContent = outputElement.innerHTML;
        fromContent += '<div class="cmd-output">';
        fromContent += "<div>" + content + "</div>";
        fromContent += '</div>';
        outputElement.innerHTML = fromContent;
        return this;
    };

    this.clear = function () {
        outputElement.innerHTML = '';
        return this;
    };
};

Command.Answer = {
    getFsCallback: function (input, output) {
        // Check Params
        if (input[1] == null) {
            return output.write('Brak podanej odpowiedzi, jako argument podaj a,b,c lub d.', input.join(" "));
        }
        if (input[1] != "a" && input[1] != "b" && input[1] != "c" && input[1] != "d") {
            return output.write('Błędny format odpowiedzi, jako argument podaj a, b, c lub d. ', input.join(" "));
        }
        if (answers.a.length < 1) {
            return output.write('Przed odpowiadaniem na pytania użyj komendy start. ', input.join(" "));
        }

        let xhr = new XMLHttpRequest();
        xhr.open("POST", "https://" +
            window.location.host + "/apims/answer", null);
        xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
        xhr.addEventListener('load', function () {
            if (this.status === 200) {
                try {
                    let quest = JSON.parse(this.responseText);
                    if (quest.wynik) {

                        output.write("Zakończyłeś test z wynikiem: " + (quest.wynik * 2) + "%", input.join(" "));

                        if (quest.link[0] == 'h') {
                            output.simpleWrite("Gratulacje!");
                            output.simpleWrite("Personalny link rejestracyjny do części zadaniowej:")
                            output.simpleWrite("<a style='color:yellow;' href='" + quest.link + "'>" + quest.link + "</a>")
                        } else if (quest.hours) {
                            output.write("Pozostały czas do rozpoczęcia testu to: " + quest.hours + "h", input.join(" "));
                        } else {
                            output.simpleWrite("Spróbuj ponownie");
                        }
                    } else {
                        output.write("Przesłano odpowiedź, następne pytanie:", input.join(" "));
                        output.simpleWrite("Pytanie nr: " + quest.level, input);
                        output.simpleWrite(quest.question);
                        answers.a = quest.answer[0];
                        answers.b = quest.answer[1];
                        answers.c = quest.answer[2];
                        answers.d = quest.answer[3];
                        output.simpleWrite("a) " + answers.a);
                        output.simpleWrite("b) " + answers.b);
                        output.simpleWrite("c) " + answers.c);
                        output.simpleWrite("d) " + answers.d);
                    }
                } catch (e) {
                    location.reload();
                }
            }
        })

        //wysyłamy połączenie
        console.log(answers[input[1]]);
        xhr.send(JSON.stringify({
            answer: answers[input[1]]
        }));
    }
};

/**
 * Command Help
 */
Command.Help = {
    getFsCallback: function (input, output) {
        var helpContent = "";
        helpContent += '<pre>';
        helpContent += '<div><strong>man</strong>           [man]           | Instrukcja działania aplikacji </div>';
        helpContent += '<div><strong>start</strong>         [start]         | Rozpoczęcie testu od ostatniego pytania </div>';
        helpContent += '<div><strong>show</strong>          [show]          | Wyświetlenie aktualnego pytania </div>';
        helpContent += '<div><strong>reset</strong>         [reset]         | Restart testu (Tylko jeśli test jest w trakcie i nie został zaliczony) </div>';
        helpContent += '<div><strong>time</strong>          [time]          | Wyświetla czas do końca testu w minutach </div>';
        helpContent += '<div><strong>answer</strong>        [answer n]      | Podanie odpowiedzi na pytanie (Gdzie n jest odpowiedzią) </div>';
        helpContent += '<div><strong>logout</strong>        [logout]        | Wylogowanie się z serwera </div>';
        helpContent += '<div><strong>clear</strong>         [clear]         | Czyści ekran</div>';
        helpContent += '<div><strong>fullscreen</strong>    [fullscreen]    | Przechodzi w tryb pełnoekranowy </div>';
        helpContent += '</pre>';
        return output.write(helpContent, input.join(" "));
    }
};

/**
 * Command Clear
 */
Command.Man = {
    getFsCallback: function (input, output) {
        let string = "";
        string += '<pre>';
        string += '<div><h4>Instrukcja obsługi aplikacji konkurs:</h4></div>';
        string += '<div>W celu rozpoczęcia wykonywania testu należy wpisać: <strong>start</strong>.</div>';
        string += '<div>Po wykonaniu tej komendy zostanie wyświetlone pierwsze pytanie, a zegar rozpocznie odliczanie. </div>';
        string += '<div>Test składa się z <strong>50</strong> pytań zamkniętych, w których poprawna może być tylko <strong>jedna</strong> odpowiedź.</div>';
        string += '<div>Aby zaliczyć test należy otrzymać wynik <strong>&gt;= 70%</strong> tzn, odpowiedzieć dobrze na conajmniej <strong>35</strong> pytań poprawnie.</div>';
        string += '<div>Po zaliczeniu testu zostanie wygenerowany link umożliwiający przejście do części praktycznej konkursu.</div>';
        string += '<div><strong>UWAGA!</strong> Po upływie <strong>12 godzin</strong> od wywołania komendy <strong>start</strong> następuje reset,</div>';
        string += '<div>i osiągnięte postępy zostają wyzerowane. Test można powtarzać wielokrotnie, aż do uzyskania poprawnego wyniku.</div>';
        string += '<div></div>';
        string += '<div>Powodzenia !</div>';
        string += '</pre>';
        return output.write(string, input.join(" "));
    }
};

Command.Clear = {
    getFsCallback: function (input, output) {
        return output.clear();
    }
};

Command.FullScreen = {
    getFsCallback: function (input, output) {
        let elem = document.documentElement
        if ((screen.availHeight || screen.height - 30) <= window.innerHeight) {
            fullscreen = true;
        } else {
            fullscreen = false;
        }

        if (!fullscreen) {
            if (elem.requestFullscreen) {
                elem.requestFullscreen();
            } else if (elem.mozRequestFullScreen) {
                /* Firefox */
                elem.mozRequestFullScreen();
            } else if (elem.webkitRequestFullscreen) {
                /* Chrome, Safari and Opera */
                elem.webkitRequestFullscreen();
            } else if (elem.msRequestFullscreen) {
                /* IE/Edge */
                elem.msRequestFullscreen();
            }
            fullscreen = true;
        } else {
            if (document.exitFullscreen) {
                document.exitFullscreen();
            } else if (document.mozCancelFullScreen) {
                /* Firefox */
                document.mozCancelFullScreen();
            } else if (document.webkitExitFullscreen) {
                /* Chrome, Safari and Opera */
                document.webkitExitFullscreen();
            } else if (document.msExitFullscreen) {
                /* IE/Edge */
                document.msExitFullscreen();
            }
            fullscreen = false;
        }
        return output.write("", input.join(" "));
    }
};


Command.Logout = {
    getFsCallback: function (input, output) {
        let xhr = new XMLHttpRequest();
        xhr.open("GET", "https://" +
            window.location.host + "/logout", null);
        xhr.send();
        window.location.replace("https://" +
            window.location.host + "/index");
    }
};

Command.Notfound = {
    getFsCallback: function (input, output) {
        return output.write('<div>Nieznana komenda, w celu sprawdzenia dostepnych komend wpisz help</div>', input.join(" "));
    }
};
Command.LinuxCommand = {
    getFsCallback: function (input, output) {
        return output.write('<div>To nie linux kolego ;)</div>', input.join(" "));
    }
};

Command.Time = {
    getFsCallback: function (input, output) {
        let xhr = new XMLHttpRequest();
        xhr.open("GET", "https://" +
            window.location.host + "/apims/time", null);
        xhr.addEventListener('load', function () {
            if (this.status === 200) {
                try {
                    let quest = JSON.parse(this.responseText);
                    output.write("<div> Czas do zakończenia podejścia do testu: " + quest.minutesLeft + " minut" + "</div>", input.join(" "))

                } catch (e) {
                    location.reload();
                }
            }
        })
        xhr.send();
    }
};

Command.Reset = {
    getFsCallback: function (input, output) {
        let xhr = new XMLHttpRequest();
        xhr.open("GET", "https://" +
            window.location.host + "/apims/reset", null);
        xhr.addEventListener('load', function () {
            if (this.status === 200) {
                try {
                    output.write("<div> Zrestartowano test</div>", input.join(" "))

                } catch (e) {
                    location.reload();
                }
            }
        })
        xhr.send();
    }

};

Command.Start = {
    getFsCallback: function (input, output) {
        let xhr = new XMLHttpRequest();
        xhr.open("GET", "https://" +
            window.location.host + "/apims/start", null);
        xhr.addEventListener('load', function () {
            if (this.status === 200) {
                console.log("Doszla odpowiedz")
                try {
                    let quest = JSON.parse(this.responseText);
                    if (quest.wynik) {
                        output.write("Zakończyłeś test z wynikiem: " + (quest.wynik * 2) + "%", input.join(" "));

                        if (quest.link[0] == 'h') {
                            output.simpleWrite("Gratulacje!");
                            output.simpleWrite("Uzyskaliście pozytywny wynik z testu (ponad 70%).")
                            output.simpleWrite("Czas na przejście do części zadaniowej i sprawdzenie Waszych umiejętności w praktyce!")
                            output.simpleWrite("Na maila podanego przy rejestracji (mail uczestnika, nie opiekuna) wysłana została wiadomość zawierająca dane dostępowe. ")
                            output.simpleWrite("Link to częsci zadaniowej: ")
                            output.simpleWrite("<a style='color:yellow;' href='" + quest.link + "'>" + quest.link + "</a>")
                            output.simpleWrite("W przypadku problemów skorzystaj z opcji zapomniane hasło na platformie z linka lub skontaktuj się z organizatorami")
                            output.simpleWrite("Powodzenia !")
                        } else if (quest.hours) {
                            output.write("Pozostały czas do rozpoczęcia testu to: " + quest.hours + "h", input.join(" "));
                        } else {
                            output.simpleWrite("Spróbuj ponownie");
                        }
                    } else if (quest.hours) {
                        output.write("Pozostały czas do rozpoczęcia testu to: " + quest.hours + "h", input.join(" "));
                    } else {
                        output.write("Pytanie nr: " + quest.level, input);
                        output.simpleWrite(quest.question, input);
                        answers.a = quest.answer[0];
                        answers.b = quest.answer[1];
                        answers.c = quest.answer[2];
                        answers.d = quest.answer[3];
                        output.simpleWrite("a) " + answers.a);
                        output.simpleWrite("b) " + answers.b);
                        output.simpleWrite("c) " + answers.c);
                        output.simpleWrite("d) " + answers.d);
                    }
                } catch (e) {
                    location.reload();
                }
            }
        })
        xhr.send();
    }
};

Command.Factory = {
    commandMap: {
        'answer': Command.Answer,
        'start': Command.Start,
        'clear': Command.Clear,
        'help': Command.Help,
        'logout': Command.Logout,
        'show': Command.Start,
        'time': Command.Time,
        'reset': Command.Reset,
        'man': Command.Man,
        'fullscreen': Command.FullScreen,
        'cd': Command.LinuxCommand,
        'ls': Command.LinuxCommand,
        'rm': Command.LinuxCommand,
        'mv': Command.LinuxCommand,
        'mkdir': Command.LinuxCommand,
        'vim': Command.LinuxCommand,
        'echo': Command.LinuxCommand,
        'netcat': Command.LinuxCommand,
        'ifconfig': Command.LinuxCommand
    },

    create: function (option) {
        if (this.commandMap[option] != null) {
            return this.commandMap[option];
        }
        return Command.Notfound;
    }
};

window.onload = function () {
    document.getElementById("prompt").innerHTML = promptLine;
    new Terminal.Events('cmdline', 'output');
    checkName();
};

function checkName() {
    let xhr = new XMLHttpRequest();
    xhr.open("GET", "https://" +
        window.location.host + "/apims/username", null);
    xhr.addEventListener('load', function () {
        if (this.status === 200) {
            const name = this.responseText;
            promptLine = "<span style='color:Chartreuse'>" + name + "</span>" + ":" + "<span style='color:RoyalBlue'>" + "~/Konkurs" + "</span>" + "$ "
            document.getElementById("prompt").innerHTML = promptLine;
        }
    })
    xhr.send();
}
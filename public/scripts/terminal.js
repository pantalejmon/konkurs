var Terminal = Terminal || {};
var Command = Command || {};

// Note: The file system has been prefixed as of Google Chrome 12:
window.requestFileSystem = window.requestFileSystem || window.webkitRequestFileSystem;



/**
 * Terminal Events
 */
Terminal.Events = function (inputElement, OutputElement) {


    var input = document.getElementById(inputElement);
    var body = document.getElementById('body');

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

            // Command
            var inputParse = inputValue.split(' ');
            var command = inputParse[0].toLowerCase();

            // Get Command
            var commandInstance = Command.Factory.create(command);
            var fsCallback = commandInstance.getFsCallback(inputParse, output);

            // Execute FileSystem Function
            if (!(fsCallback instanceof Terminal.Output)) {
                window.requestFileSystem(window.TEMPORARY, 1024 * 1024, fsCallback, Terminal.FilesystemErrorHandler);
            }
            input.value = '';
        }
        return true;
    };

    // Click Body
    body.onclick = function () {
        input.focus();
    };
};

/**
 * Output
 */
Terminal.Output = function (element) {

    // OutputElemen
    var outputElement = document.getElementById(element);

    // White
    this.write = function (content, input) {
        var fromContent = outputElement.innerHTML;
        fromContent += '<div class="cmd-output">';
        fromContent += "<span style='color:green'>Konkurs></span> " + input + content;
        fromContent += '</div>';
        outputElement.innerHTML = fromContent;
        return this;
    };

    this.clear = function () {
        outputElement.innerHTML = '';
        return this;
    };
};

/**
 * Terminal Filesystem Pointer

/**
 * Command Ls
 */


Command.Answer = {
    getFsCallback: function (input, output) {

        // Check Params
        if (input[1] == null) {
            return output.write('Parameters missing, make this thing right');
        }

        // Filesystem
        return function () {

            // Touch File
            Terminal.Filesystem.pwd.getFile(input[1], {
                create: true,
                exclusive: true
            }, function () {}, Terminal.FilesystemErrorHandler);

        };
    }
};

/**
 * Command Help
 */
Command.Help = {
    getFsCallback: function (input, output) {
        var helpContent = "";
        helpContent += '<div><strong>clear</strong>  [clear]                    | Czysci ekran</div>';
        helpContent += '<div><strong>answer</strong> [answer {n}] [ls -l]       | Podanie odpowiedzi na pytanie </div>';
        return output.write(helpContent, input);
    }
};

/**
 * Command Clear
 */
Command.Clear = {
    getFsCallback: function (input, output) {
        return output.clear();
    }
};

/**
 * Command Not Found
 */
Command.Notfound = {
    getFsCallback: function (input, output) {
        return output.write('<div>Nieznana komenda, w celu sprawdzenia dostepnych komend wpisz help</div>', input);
    }
};

/**
 * Terminal CommandFactory
 */
Command.Factory = {
    commandMap: {
        'answer': Command.Answer,
        'clear': Command.Clear,
        'help': Command.Help
    },

    create: function (option) {
        if (this.commandMap[option] != null) {
            return this.commandMap[option];
        }
        return Command.Notfound;
    }
};

/**
 * Window Load
 */
window.onload = function () {
    new Terminal.Events('cmdline', 'output');
};
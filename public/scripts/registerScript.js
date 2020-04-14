// Validacja formularza rejestracyjnego
function validForm() {
    let email = document.getElementById("email");
    let modal = document.getElementById("myModal");
    modal.style.display = "block";

    let xhr = new XMLHttpRequest();
    xhr.open("POST", "https://" +
        window.location.host + "/apims/mailvalidation", null);
    //wysyłamy połączenie
    xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
    var response = grecaptcha.getResponse();
    if (response.length == 0) {
        modal.style.display = "none";
        M.toast({ html: 'Przed wysłaniem zgłoszenia udowodnij że nie jesteś robotem :)' })
        return false;
    }
    else {
        xhr.send(JSON.stringify({
            email: email.value
        }));
        console.log(email.value)
        if (xhr.status === 200) {
            try {
                let ans = JSON.parse(xhr.responseText);
                if (ans.exist == true) {
                    modal.style.display = "none";
                    M.toast({ html: 'Ten adres email został już zarejestrowany, w przypadku problemów skontaktuj się z organizatorami', classes: 'rounded red' })
                    return false;
                } else {
                    modal.style.display = "none";
                    return true;
                }
            } catch {
                return false;
            }
        }
    }
}


function checkPass(evt) {
    let pass1 = document.getElementById('pass');
    let pass2 = document.getElementById('pass2');
    if (pass1.value === pass2.value) {
        pass2.setCustomValidity("");

    } else {
        pass2.setCustomValidity("Hasla są niezgodne");

    }

}

// grecaptcha.ready(function () {
//     grecaptcha.execute('put your site key here', { action: 'homepage' }).then(function (token) {
//         // pass the token to the backend script for verification
//     });
// });
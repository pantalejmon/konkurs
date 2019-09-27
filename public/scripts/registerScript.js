// Validacja formularza rejestracyjnego
function validForm() {
    let email = document.getElementById("email");
    let teamname = document.getElementById("email").value;
    let pass = document.getElementById("email").value;
    let user1 = document.getElementById("email").value;
    let user2 = document.getElementById("email").value;
    let modal = document.getElementById("myModal");
    modal.style.display = "block";

    let xhr = new XMLHttpRequest();
    xhr.open("POST", "http://" +
        window.location.host + "/apims/mailvalidation", null);
    //wysyłamy połączenie
    xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
    xhr.send(JSON.stringify({
        email: email.value
    }));
    console.log(email.value)
    if (xhr.status === 200) {
        try {
            let ans = JSON.parse(xhr.responseText);
            if (ans.exist == true) {
                modal.style.display = "none";
                alert("Ten adres mail został już zarejestrowany");
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
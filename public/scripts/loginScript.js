function validLogin() {
    let email = document.getElementById("email");
    let pass = document.getElementById("pass");
    let xhr = new XMLHttpRequest();
    xhr.open("POST", "https://" +
        window.location.host + "/apims/logincheck", null);
    //wysyłamy połączenie
    xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
    xhr.send(JSON.stringify({
        email: email.value,
        pass: pass.value
    }));
    if (xhr.status === 200) {
        try {
            let ans = JSON.parse(xhr.responseText);
            if (ans.status == true) {
                return true;
            } else {
                M.toast({ html: 'Błędne dane logowania, spróbuj ponownie', classes: 'rounded red' })
                return false;
            }
        } catch {
            return false;
        }
    }
}
function pass() {
    showCard("passchange")
}


function showCard(cardName) {
    let card = document.getElementById(cardName);
    if (card.style.display === "none") {
        card.style.display = "block";
    } else {
        card.style.display = "none";
    }
}
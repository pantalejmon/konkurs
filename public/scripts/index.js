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

/*****************Cookies**************************/
let purecookieTitle = "Uwaga ciasteczka!"; // Title
let purecookieDesc = "Biorąc udział w konkursie zgadzasz się na używanie plików cookies"; // Description
let purecookieLink = '<a href="http://www.dziennikustaw.gov.pl/DU/2012/1445" target="_blank">Więcej informacji</a>'; // Cookiepolicy link
let purecookieButton = "Zrozumiałem"; // Button text

function pureFadeIn(elem, display) {
    let el = document.getElementById(elem);
    el.style.opacity = 0;
    el.style.display = display || "block";

    (function fade() {
        let val = parseFloat(el.style.opacity);
        if (!((val += .02) > 0.7)) {
            el.style.opacity = val;
            requestAnimationFrame(fade);
        }
    })();
};

function pureFadeOut(elem) {
    let el = document.getElementById(elem);
    el.style.opacity = 1;

    (function fade() {
        if ((el.style.opacity -= .02) < 0) {
            el.style.display = "none";
        } else {
            requestAnimationFrame(fade);
        }
    })();
};

function setCookie(name, value, days) {
    let expires = "";
    if (days) {
        let date = new Date();
        date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
        expires = "; expires=" + date.toUTCString();
    }
    document.cookie = name + "=" + (value || "") + expires + "; path=/";
}

function getCookie(name) {
    let nameEQ = name + "=";
    let ca = document.cookie.split(';');
    for (let i = 0; i < ca.length; i++) {
        let c = ca[i];
        while (c.charAt(0) == ' ') c = c.substring(1, c.length);
        if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length, c.length);
    }
    return null;
}

function eraseCookie(name) {
    document.cookie = name + '=; Max-Age=-99999999;';
}

function cookieConsent() {
    if (!getCookie('purecookieDismiss')) {
        document.body.innerHTML += '<div class="cookieConsentContainer" id="cookieConsentContainer"><div class="cookieTitle"><a>' + purecookieTitle + '</a></div><div class="cookieDesc"><p>' + purecookieDesc + ' ' + purecookieLink + '</p></div><div class="cookieButton"><a onClick="purecookieDismiss();">' + purecookieButton + '</a></div></div>';
        pureFadeIn("cookieConsentContainer");
    }
}

function purecookieDismiss() {
    setCookie('purecookieDismiss', '1', 7);
    pureFadeOut("cookieConsentContainer");
}

window.onload = function () {
    cookieConsent();
};
// Uatrakcyjnienie interfejsu
// document.addEventListener('DOMContentLoaded', function () {
//     var elems = document.querySelectorAll('.sidenav');
//     var instances = M.Sidenav.init(elems);
// });

function change(str) {
    console.log("Zmiana na " + str);
    const allLi = document.getElementsByTagName("li");
    console.log(allLi);
    for (let t of allLi) {
        t.classList.remove("active");
    }
    document.getElementById(str).classList.add("active");
}



/*****************Cookies**************************/
let purecookieTitle = "Uwaga ciasteczka!"; // Title
let purecookieDesc = "Biorąc udział w konkursie zgadzasz się na używanie plików cookies"; // Description
let purecookieLink = '<a href="/docs/rodo_cookies.pdf" target="_blank">Więcej informacji</a>'; // Cookiepolicy link
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
    registerSW();
    cookieConsent();
    var elems = document.querySelectorAll('.sidenav');
    var instances = M.Sidenav.init(elems);
};

function registerSW() {
    if ("serviceWorker" in navigator) {
        navigator.serviceWorker.register("/sw.js").then(function () {
            console.log("Service Worker Registered");
        });
    }
}
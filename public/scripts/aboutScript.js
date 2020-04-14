function hint() {
    showCard("hint");
}
function answer() {
    showCard("answer");
}
function hint2() {
    showCard("hint2");
}
function answer2() {
    showCard("answer2");
}

function showCard(cardName) {
    let card = document.getElementById(cardName);
    if (card.style.display === "none") {
        card.style.display = "block";
    } else {
        card.style.display = "none";
    }
}
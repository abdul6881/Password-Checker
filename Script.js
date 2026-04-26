const password = document.getElementById("password");
const strength = document.getElementById("strength");

password.addEventListener("input", () => {
    const val = password.value;

    if (val.length < 6) {
        strength.textContent = "Weak";
        strength.style.color = "red";
    } else if (val.length < 10) {
        strength.textContent = "Medium";
        strength.style.color = "orange";
    } else {
        strength.textContent = "Strong";
        strength.style.color = "green";
    }
});

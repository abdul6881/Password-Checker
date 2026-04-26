const password = document.getElementById("password");
const power = document.getElementById("power-point");
const suggestionBox = document.getElementById("suggestion");
const resultHeading = document.getElementById("result-heading");
const crackTimeBox = document.getElementById("crack-time");

// Function to estimate crack time
function estimateCrackTime(pwd) {
    const length = pwd.length;

    let combinations = 1;
    let charset = 0;

    if (/[a-z]/.test(pwd)) charset += 26;
    if (/[A-Z]/.test(pwd)) charset += 26;
    if (/[0-9]/.test(pwd)) charset += 10;
    if (/[^0-9a-zA-Z]/.test(pwd)) charset += 33;

    combinations = Math.pow(charset, length);

    const guessesPerSecond = 1e9; // 1 billion guesses/sec
    const seconds = combinations / guessesPerSecond;

    // Convert seconds to readable format
    if (seconds < 60) return `${Math.floor(seconds)} seconds`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)} minutes`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)} hours`;
    if (seconds < 2628000) return `${Math.floor(seconds / 86400)} days`;
    if (seconds < 31536000) return `${Math.floor(seconds / 2628000)} months`;
    if (seconds < 315360000) return `${Math.floor(seconds / 31536000)} years`;

    return `hundreds of years (very hard to crack!)`;
}

// Password Strength Evaluator
function evaluatePasswordStrength(value) {
    let score = 0;
    let suggestions = [];

    const conditions = [
        { regex: /.{6,}/, score: 1, message: "Add at least 6 characters." },
        { regex: /.{10,}/, score: 1, message: "Increase length to 10+ characters." },
        { regex: /[0-9]/, score: 1, message: "Add digits (0-9)." },
        { regex: /[a-z]/, score: 1, message: "Add lowercase letters (a-z)." },
        { regex: /[A-Z]/, score: 1, message: "Add uppercase letters (A-Z)." },
        { regex: /[^0-9a-zA-Z]/, score: 1, message: "Add special symbols like @, #, $, %." }
    ];

    if (/\s/.test(value)) {
        return { score: -1, suggestions: ["❌ Password should NOT contain spaces."], crackTime: "N/A" };
    }

    conditions.forEach(rule => {
        if (rule.regex.test(value)) score += rule.score;
        else suggestions.push(rule.message);
    });

    if (value.length < 12) suggestions.push("Try to make it 12+ characters.");
    else score++;

    return { 
        score: Math.min(score, 5), 
        suggestions,
        crackTime: estimateCrackTime(value)   // NEW FEATURE
    };
}

password.addEventListener("input", () => {
    const value = password.value;
    const result = evaluatePasswordStrength(value);
    let score = result.score;

    const widthPower = ["1%", "20%", "40%", "60%", "80%", "100%"];
    const colorPower = ["#D73F40", "#DC6551", "#F2B84F", "#FFCE00", "#BDE952", "#3ba62f"];

    if (value.length > 0) resultHeading.style.display = "block";
    else {
        resultHeading.style.display = "none";
        suggestionBox.innerHTML = "";
        crackTimeBox.innerHTML = "";
    }

    if (score === -1) {
        power.style.width = "100%";
        power.style.backgroundColor = "#000";
        suggestionBox.innerHTML = "❌ Invalid password: Spaces are not allowed.";
        crackTimeBox.innerHTML = "";
        return;
    }

    power.style.width = widthPower[score];
    power.style.backgroundColor = colorPower[score];

    let strengthText = "";
    if (score <= 1) strengthText = "🔴 Weak Password";
    else if (score === 2) strengthText = "🟠 Fair Password";
    else if (score === 3) strengthText = "🟡 Medium Password";
    else if (score === 4) strengthText = "🟢 Strong Password";
    else strengthText = "🟩 Very Strong Password";

    if (result.suggestions.length === 0) {
        suggestionBox.innerHTML = strengthText + "<br>✔ Your password is strong!";
    } else {
        suggestionBox.innerHTML = strengthText + "<br><br>Suggestions:<br>• " +
            result.suggestions.join("<br>• ");
    }

    // Show crack time
    crackTimeBox.innerHTML = `<br><strong>Crack Time Estimate:</strong> ${result.crackTime}`;
});
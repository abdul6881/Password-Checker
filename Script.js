const passwordInput = document.getElementById("passwordInput");
const toggleVisibility = document.getElementById("toggleVisibility");
const strengthLabel = document.getElementById("strengthLabel");
const strengthBar = document.getElementById("strengthBar");
const vulnerabilityCount = document.getElementById("vulnerabilityCount");
const vulnerabilityList = document.getElementById("vulnerabilityList");
const crackTime = document.getElementById("crackTime");
const searchSpace = document.getElementById("searchSpace");
const suggestionList = document.getElementById("suggestionList");
const navLinks = document.querySelectorAll(".nav-link");
const viewSections = document.querySelectorAll(".view-section");
const reviewInput = document.getElementById("reviewInput");
const submitReview = document.getElementById("submitReview");
const reviewList = document.getElementById("reviewList");
const faqInput = document.getElementById("faqInput");
const submitFaq = document.getElementById("submitFaq");
const faqList = document.getElementById("faqList");
const faqCategoryButtons = document.querySelectorAll(".faq-category-btn");

function formatNumber(value) {
    return Number(value).toLocaleString("en-US");
}

function getCharsetSize(value) {
    let charset = 0;
    if (/[a-z]/.test(value)) charset += 26;
    if (/[A-Z]/.test(value)) charset += 26;
    if (/[0-9]/.test(value)) charset += 10;
    if (/[^0-9a-zA-Z\s]/.test(value)) charset += 33;
    return charset;
}

function getCrackTimeString(seconds) {
    if (!Number.isFinite(seconds) || seconds <= 0) return "Instant";
    if (seconds < 60) return `${Math.floor(seconds)} seconds`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)} minutes`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)} hours`;
    if (seconds < 2_628_000) return `${Math.floor(seconds / 86400)} days`;
    if (seconds < 31_536_000) return `${Math.floor(seconds / 2_628_000)} months`;
    if (seconds < 3_153_600_000) return `${Math.floor(seconds / 31_536_000)} years`;
    return "centuries+";
}

function getPasswordAnalysis(value) {
    const vulnerabilities = [];
    const suggestions = [];
    let score = 0;

    if (value.length >= 8) score += 1;
    else {
        vulnerabilities.push("Too short (less than 8 characters)");
        suggestions.push("Use at least 12 characters.");
    }

    if (value.length >= 12) score += 1;

    if (/[a-z]/.test(value)) score += 1;
    else {
        vulnerabilities.push("Missing lowercase letters");
        suggestions.push("Add lowercase letters (a-z).");
    }

    if (/[A-Z]/.test(value)) score += 1;
    else {
        vulnerabilities.push("Missing uppercase letters");
        suggestions.push("Add uppercase letters (A-Z).");
    }

    if (/[0-9]/.test(value)) score += 1;
    else {
        vulnerabilities.push("Missing digits");
        suggestions.push("Add numbers (0-9).");
    }

    if (/[^0-9a-zA-Z\s]/.test(value)) score += 1;
    else {
        vulnerabilities.push("Missing special symbols");
        suggestions.push("Add symbols like !, @, #, $, %.");
    }

    if (/\s/.test(value)) {
        vulnerabilities.push("Contains spaces");
        suggestions.push("Remove spaces from password.");
        score = Math.max(0, score - 1);
    }

    const normalizedScore = Math.min(5, Math.max(0, score));
    const widths = ["0%", "20%", "40%", "60%", "80%", "100%"];
    const labels = [
        "Very Weak",
        "Weak",
        "Fair",
        "Medium",
        "Strong",
        "Very Strong"
    ];

    const charset = getCharsetSize(value);
    const combinations = charset > 0 ? Math.pow(charset, value.length) : 0;
    const guessesPerSecond = 1e9;
    const crackSeconds = combinations / guessesPerSecond;

    return {
        normalizedScore,
        width: widths[normalizedScore],
        label: labels[normalizedScore],
        vulnerabilities,
        suggestions,
        combinations,
        crackSeconds
    };
}

function renderVulnerabilities(vulnerabilities) {
    if (!vulnerabilityList || !vulnerabilityCount) return;

    if (!vulnerabilities.length) {
        vulnerabilityCount.textContent = "0 detected";
        vulnerabilityList.innerHTML = `
            <div class="p-3 rounded-xl bg-slate-900/50 border border-slate-700/50 vulnerability-item">
                <div class="flex items-center justify-between">
                    <span class="text-slate-300 flex items-center gap-2">
                        <i class="fa-solid fa-circle-check text-green-400"></i>
                        No critical vulnerabilities detected.
                    </span>
                    <span class="text-green-400 text-xs font-semibold">Safe</span>
                </div>
            </div>
        `;
        return;
    }

    vulnerabilityCount.textContent = `${vulnerabilities.length} detected`;
    vulnerabilityList.innerHTML = vulnerabilities
        .map(
            (item) => `
            <div class="p-3 rounded-xl bg-red-900/20 border border-red-500/30 vulnerability-item">
                <div class="flex items-center justify-between gap-2">
                    <span class="text-red-200 flex items-center gap-2">
                        <i class="fa-solid fa-triangle-exclamation text-red-400"></i>
                        ${item}
                    </span>
                    <span class="text-red-300 text-xs font-semibold">Risk</span>
                </div>
            </div>
        `
        )
        .join("");
}

function renderSuggestions(suggestions) {
    if (!suggestionList) return;

    if (!suggestions.length) {
        suggestionList.innerHTML = `
            <li class="text-green-300 flex items-start gap-2">
                <i class="fa-solid fa-check mt-0.5"></i>
                <span>Great password hygiene. Keep it unique for each account.</span>
            </li>
        `;
        return;
    }

    suggestionList.innerHTML = suggestions
        .map(
            (item) => `
            <li class="text-slate-300 flex items-start gap-2">
                <i class="fa-solid fa-lightbulb text-yellow-400 mt-0.5"></i>
                <span>${item}</span>
            </li>
        `
        )
        .join("");
}

function updatePasswordUI() {
    if (!passwordInput || !strengthLabel || !strengthBar || !crackTime || !searchSpace) return;

    const value = passwordInput.value;

    if (!value) {
        strengthLabel.innerHTML = '<i class="fa-solid fa-shield"></i><span>Waiting...</span>';
        strengthBar.style.width = "0%";
        crackTime.textContent = "-";
        searchSpace.textContent = "-";
        renderVulnerabilities([]);
        renderSuggestions([]);
        return;
    }

    const analysis = getPasswordAnalysis(value);

    strengthLabel.innerHTML = `<i class="fa-solid fa-shield"></i><span>${analysis.label}</span>`;
    strengthBar.style.width = analysis.width;
    crackTime.textContent = getCrackTimeString(analysis.crackSeconds);
    searchSpace.textContent = analysis.combinations > 0 ? formatNumber(analysis.combinations) : "-";
    renderVulnerabilities(analysis.vulnerabilities);
    renderSuggestions(analysis.suggestions);
}

if (passwordInput) {
    passwordInput.addEventListener("input", updatePasswordUI);
}

if (toggleVisibility && passwordInput) {
    toggleVisibility.addEventListener("click", () => {
        const hidden = passwordInput.type === "password";
        passwordInput.type = hidden ? "text" : "password";
        toggleVisibility.innerHTML = hidden
            ? '<i class="fa-regular fa-eye-slash"></i>'
            : '<i class="fa-regular fa-eye"></i>';
    });
}

function switchView(viewName) {
    viewSections.forEach((section) => {
        section.classList.toggle("hidden", section.id !== `view-${viewName}`);
    });

    navLinks.forEach((link) => {
        const isActive = link.dataset.view === viewName;
        link.classList.toggle("nav-active", isActive);
        link.classList.toggle("text-cyan-400", isActive);
        link.classList.toggle("text-slate-300", !isActive);
    });
}

navLinks.forEach((link) => {
    link.addEventListener("click", () => {
        if (!link.dataset.view) return;
        switchView(link.dataset.view);
    });
});

if (submitReview && reviewInput && reviewList) {
    submitReview.addEventListener("click", () => {
        const text = reviewInput.value.trim();
        if (!text) return;

        const item = document.createElement("li");
        item.className = "bg-slate-900/50 border border-slate-700 rounded-xl p-3";
        item.innerHTML = `
            <div class="flex items-center gap-2 mb-2">
                <i class="fa-solid fa-user-circle text-cyan-400"></i>
                <span class="text-sm font-semibold">You</span>
                <span class="text-xs text-slate-500 ml-auto">just now</span>
            </div>
            <p class="text-sm text-slate-300"></p>
        `;

        const textNode = item.querySelector("p");
        if (textNode) textNode.textContent = text;

        reviewList.prepend(item);
        reviewInput.value = "";
    });
}

if (submitFaq && faqInput && faqList) {
    submitFaq.addEventListener("click", () => {
        const question = faqInput.value.trim();
        if (!question) return;

        const wrapper = document.createElement("div");
        wrapper.className = "faq-item bg-slate-900/50 border border-slate-700 rounded-xl p-3";
        wrapper.dataset.category = "general";
        wrapper.innerHTML = `
            <div class="flex items-center gap-2 mb-1 cursor-pointer faq-question">
                <i class="fa-solid fa-question text-fuchsia-400"></i>
                <span class="text-xs font-semibold"></span>
                <i class="fa-solid fa-chevron-down text-cyan-400 ml-auto text-xs"></i>
            </div>
            <div class="faq-answer text-sm text-slate-300 mt-2 hidden">
                <i class="fa-solid fa-robot text-cyan-400 mr-1"></i>
                Thanks for asking. In this demo, new questions are stored only in the current browser session.
            </div>
        `;

        const textSpan = wrapper.querySelector(".faq-question span");
        if (textSpan) textSpan.textContent = `Q: ${question}`;

        faqList.prepend(wrapper);
        faqInput.value = "";
    });
}

function toggleFaqAnswer(questionElement) {
    const parent = questionElement.closest(".faq-item");
    if (!parent) return;
    const answer = parent.querySelector(".faq-answer");
    const icon = questionElement.querySelector(".fa-chevron-down");
    if (!answer) return;

    const isHidden = answer.classList.contains("hidden");
    answer.classList.toggle("hidden", !isHidden);
    if (icon) icon.style.transform = isHidden ? "rotate(180deg)" : "rotate(0deg)";
}

document.addEventListener("click", (event) => {
    const target = event.target;
    if (!(target instanceof Element)) return;

    const question = target.closest(".faq-question");
    if (question) {
        toggleFaqAnswer(question);
    }
});

function applyFaqFilter(category) {
    const items = faqList ? faqList.querySelectorAll(".faq-item") : [];
    items.forEach((item) => {
        const itemCategory = item.getAttribute("data-category") || "general";
        const shouldShow = category === "all" || itemCategory === category;
        item.classList.toggle("hidden", !shouldShow);
    });

    faqCategoryButtons.forEach((button) => {
        const isActive = button.dataset.category === category;
        button.classList.toggle("bg-cyan-900/30", isActive);
        button.classList.toggle("text-cyan-300", isActive);
        button.classList.toggle("border-cyan-500/30", isActive);
        button.classList.toggle("bg-slate-800/50", !isActive);
        button.classList.toggle("text-slate-300", !isActive);
        button.classList.toggle("border-slate-700", !isActive);
    });
}

faqCategoryButtons.forEach((button) => {
    button.addEventListener("click", () => {
        const category = button.dataset.category || "all";
        applyFaqFilter(category);
    });
});

switchView("home");
updatePasswordUI();

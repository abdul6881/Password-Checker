// ========== NAVIGATION ==========
const navLinks = document.querySelectorAll(".nav-link");
const sections = document.querySelectorAll(".view-section");

navLinks.forEach(btn => {
  btn.addEventListener("click", () => {
    navLinks.forEach(b => b.classList.remove("nav-active"));
    btn.classList.add("nav-active");

    const view = btn.getAttribute("data-view");

    sections.forEach(sec => sec.classList.add("hidden"));
    document.getElementById("view-" + view).classList.remove("hidden");
  });
});


// ========== PASSWORD SYSTEM ==========
const passwordInput = document.getElementById("passwordInput");
const strengthBar = document.getElementById("strengthBar");
const strengthLabel = document.getElementById("strengthLabel");
const crackTime = document.getElementById("crackTime");
const searchSpace = document.getElementById("searchSpace");
const suggestionList = document.getElementById("suggestionList");
const vulnerabilityList = document.getElementById("vulnerabilityList");
const vulnerabilityCount = document.getElementById("vulnerabilityCount");
const toggleVisibilityBtn = document.getElementById("toggleVisibility");
const toggleVisibilityIcon = toggleVisibilityBtn.querySelector("i");

// Toggle password visibility
toggleVisibilityBtn.onclick = () => {
  if (passwordInput.type === "password") {
    passwordInput.type = "text";
    toggleVisibilityIcon.classList.remove("fa-eye");
    toggleVisibilityIcon.classList.add("fa-eye-slash");
  } else {
    passwordInput.type = "password";
    toggleVisibilityIcon.classList.remove("fa-eye-slash");
    toggleVisibilityIcon.classList.add("fa-eye");
  }
};

// Password strength evaluation function
function evaluatePasswordStrength(password) {
  const length = password.length;
  
  if (length === 0) {
    return {
      score: 0,
      label: "Waiting...",
      width: "5%",
      color: "from-gray-500 to-gray-500"
    };
  }

  let score = 0;
  let checks = {
    hasLower: /[a-z]/.test(password),
    hasUpper: /[A-Z]/.test(password),
    hasNumber: /[0-9]/.test(password),
    hasSpecial: /[^a-zA-Z0-9]/.test(password),
    hasLength: length >= 12,
    hasLength8: length >= 8
  };

  if (checks.hasLower) score++;
  if (checks.hasUpper) score++;
  if (checks.hasNumber) score++;
  if (checks.hasSpecial) score++;
  if (checks.hasLength) score++;

  // Ensure score is between 1 and 5
  score = Math.min(Math.max(score, 1), 5);

  const labels = ["Very Weak", "Weak", "Fair", "Strong", "Excellent"];
  const widths = ["20%", "40%", "60%", "80%", "100%"];
  const colors = [
    "from-red-500 to-red-600",
    "from-orange-500 to-orange-600",
    "from-yellow-500 to-yellow-600",
    "from-green-500 to-green-600",
    "from-emerald-500 to-cyan-500"
  ];

  return {
    score: score,
    label: labels[score - 1],
    width: widths[score - 1],
    color: colors[score - 1],
    checks: checks
  };
}

// Detect vulnerabilities
function detectVulnerabilities(password) {
  const vulnerabilities = [];
  const length = password.length;
  
  if (length === 0) {
    return {
      count: 0,
      items: [{
        type: "info",
        message: "Start typing to detect vulnerabilities...",
        risk: "none",
        icon: "fa-circle-info",
        color: "cyan"
      }]
    };
  }

  // Check for common vulnerabilities
  if (length < 8) {
    vulnerabilities.push({
      type: "critical",
      message: "Password too short (< 8 chars) - Vulnerable to brute force attacks",
      risk: "High",
      icon: "fa-exclamation-triangle",
      color: "red"
    });
  } else if (length < 12) {
    vulnerabilities.push({
      type: "warning",
      message: "Password length could be improved (8-11 chars) - Susceptible to dictionary attacks",
      risk: "Medium",
      icon: "fa-exclamation-circle",
      color: "orange"
    });
  }

  // Check for common patterns
  const commonPatterns = ["123456", "password", "qwerty", "admin", "welcome"];
  const lowerPass = password.toLowerCase();
  if (commonPatterns.some(pattern => lowerPass.includes(pattern))) {
    vulnerabilities.push({
      type: "critical",
      message: "Contains common pattern - Vulnerable to dictionary attacks",
      risk: "High",
      icon: "fa-bug",
      color: "red"
    });
  }

  // Check for sequential characters
  if (/(abc|bcd|cde|def|efg|fgh|ghi|hij|ijk|jkl|klm|lmn|mno|nop|opq|pqr|qrs|rst|stu|tuv|uvw|vwx|wxy|xyz|012|123|234|345|456|567|678|789)/i.test(password)) {
    vulnerabilities.push({
      type: "warning",
      message: "Contains sequential characters - Easier to guess",
      risk: "Medium",
      icon: "fa-arrow-right",
      color: "orange"
    });
  }

  // Check for repeated characters
  if (/(.)\1{2,}/.test(password)) {
    vulnerabilities.push({
      type: "warning",
      message: "Contains repeated characters - Reduces complexity",
      risk: "Low",
      icon: "fa-repeat",
      color: "yellow"
    });
  }

  // Check for date patterns (YYYY, DDMM, MMDD)
  if (/\d{4}/.test(password) && (password.match(/\d{4}/)[0] >= 1900 && password.match(/\d{4}/)[0] <= 2025)) {
    vulnerabilities.push({
      type: "warning",
      message: "Contains year pattern - Could be personal information",
      risk: "Medium",
      icon: "fa-calendar",
      color: "orange"
    });
  }

  // If no vulnerabilities detected
  if (vulnerabilities.length === 0) {
    vulnerabilities.push({
      type: "success",
      message: "No significant vulnerabilities detected - Password appears secure",
      risk: "None",
      icon: "fa-check-shield",
      color: "green"
    });
  }

  return {
    count: vulnerabilities.filter(v => v.type !== "success").length,
    items: vulnerabilities
  };
}

// Calculate crack time
function calculateCrackTime(password) {
  const length = password.length;
  if (length === 0) return "—";
  
  // More realistic crack time estimation
  const entropy = calculateEntropy(password);
  
  // Assuming 10^9 guesses per second (modern GPU)
  const seconds = Math.pow(2, entropy) / 1e9;
  
  if (seconds < 1) return "Instant";
  if (seconds < 60) return "Seconds";
  if (seconds < 3600) return "Minutes";
  if (seconds < 86400) return "Hours";
  if (seconds < 2592000) return "Days";
  if (seconds < 31536000) return "Months";
  if (seconds < 3153600000) return "Years";
  return "Centuries";
}

// Calculate entropy (bits)
function calculateEntropy(password) {
  let poolSize = 0;
  if (/[a-z]/.test(password)) poolSize += 26; // lowercase
  if (/[A-Z]/.test(password)) poolSize += 26; // uppercase
  if (/[0-9]/.test(password)) poolSize += 10; // digits
  if (/[^a-zA-Z0-9]/.test(password)) poolSize += 32; // special chars
  
  // Default pool size if none matched
  if (poolSize === 0) poolSize = 1;
  
  return Math.log2(Math.pow(poolSize, password.length));
}

// Calculate search space
function calculateSearchSpace(password) {
  const length = password.length;
  if (length === 0) return "—";
  
  // Total printable ASCII characters (approx)
  const poolSize = 95;
  const space = Math.pow(poolSize, length);
  
  if (space < 1e6) return space.toLocaleString();
  if (space < 1e9) return (space / 1e6).toFixed(1) + " million";
  if (space < 1e12) return (space / 1e9).toFixed(1) + " billion";
  if (space < 1e15) return (space / 1e12).toFixed(1) + " trillion";
  return space.toExponential(2);
}

// Generate suggestions
function generateSuggestions(password, checks) {
  const suggestions = [];
  const length = password.length;
  
  if (length === 0) {
    return ["Start typing to get suggestions."];
  }
  
  if (!checks.hasLower) suggestions.push("Add lowercase letters (a-z)");
  if (!checks.hasUpper) suggestions.push("Add uppercase letters (A-Z)");
  if (!checks.hasNumber) suggestions.push("Add numbers (0-9)");
  if (!checks.hasSpecial) suggestions.push("Add special characters (!@#$% etc.)");
  if (length < 8) suggestions.push("Use at least 8 characters");
  else if (length < 12) suggestions.push("Increase length to 12+ characters");
  
  if (suggestions.length === 0) {
    return ["Password is strong! Keep it up."];
  }
  
  return suggestions;
}

// Update vulnerabilities display
function updateVulnerabilitiesDisplay(vulnerabilities) {
  vulnerabilityCount.textContent = `${vulnerabilities.count} detected`;
  
  if (vulnerabilities.count === 0) {
    vulnerabilityCount.className = "text-xs bg-green-900/30 text-green-300 px-2 py-1 rounded-full";
  } else if (vulnerabilities.count <= 2) {
    vulnerabilityCount.className = "text-xs bg-yellow-900/30 text-yellow-300 px-2 py-1 rounded-full";
  } else {
    vulnerabilityCount.className = "text-xs bg-red-900/30 text-red-300 px-2 py-1 rounded-full";
  }
  
  vulnerabilityList.innerHTML = vulnerabilities.items.map(v => `
    <div class="p-3 rounded-xl bg-slate-900/50 border border-slate-700/50 vulnerability-item ${v.type === 'success' ? 'border-green-500/30' : v.type === 'critical' ? 'border-red-500/30' : 'border-yellow-500/30'}">
      <div class="flex items-start gap-2">
        <i class="fa-solid ${v.icon} text-${v.color}-400 mt-0.5"></i>
        <div class="flex-1">
          <span class="text-xs ${v.type === 'critical' ? 'text-red-300' : v.type === 'warning' ? 'text-yellow-300' : 'text-green-300'}">
            ${v.message}
          </span>
        </div>
        <span class="text-xs font-semibold ${v.risk === 'None' ? 'text-green-400' : v.risk === 'Low' ? 'text-yellow-400' : v.risk === 'Medium' ? 'text-orange-400' : 'text-red-400'}">
          <i class="fa-solid ${v.risk === 'None' ? 'fa-check' : 'fa-triangle-exclamation'}"></i> ${v.risk}
        </span>
      </div>
    </div>
  `).join("");
}

// Update UI with password analysis
function updatePasswordAnalysis() {
  const password = passwordInput.value;
  const analysis = evaluatePasswordStrength(password);
  const vulnerabilities = detectVulnerabilities(password);
  
  // Update strength bar
  strengthBar.style.width = analysis.width;
  strengthBar.className = `h-full bg-gradient-to-r ${analysis.color} transition-all duration-500`;
  
  // Update strength label
  strengthLabel.innerHTML = `<i class="fa-solid fa-shield"></i> <span>${analysis.label}</span>`;
  
  // Update crack time and search space
  crackTime.textContent = calculateCrackTime(password);
  searchSpace.textContent = calculateSearchSpace(password);
  
  // Update vulnerabilities
  updateVulnerabilitiesDisplay(vulnerabilities);
  
  // Update suggestions
  const suggestions = generateSuggestions(password, analysis.checks || {});
  suggestionList.innerHTML = suggestions.map(s => 
    `<li class="text-slate-300 flex items-start gap-2">
       <i class="fa-solid fa-circle-info text-cyan-400 mt-0.5"></i>
       <span class="text-xs">${s}</span>
     </li>`
  ).join("");
}

// Real-time password analysis
passwordInput.addEventListener("input", updatePasswordAnalysis);

// Initialize with empty state
updatePasswordAnalysis();

// ========== REVIEWS ==========
document.getElementById("submitReview").addEventListener("click", () => {
  const text = document.getElementById("reviewInput").value.trim();
  if (!text) return;
  
  const button = document.getElementById("submitReview");
  const originalText = button.innerHTML;
  button.innerHTML = '<i class="fa-solid fa-check mr-2"></i>Thank you!';
  button.classList.remove("from-cyan-600", "to-blue-600");
  button.classList.add("from-green-600", "to-emerald-600");
  
  // Clear input
  document.getElementById("reviewInput").value = "";
  
  // Reset button after 2 seconds
  setTimeout(() => {
    button.innerHTML = originalText;
    button.classList.remove("from-green-600", "to-emerald-600");
    button.classList.add("from-cyan-600", "to-blue-600");
  }, 2000);
});

// ========== FAQ SYSTEM ==========
const faqQuestions = document.querySelectorAll('.faq-question');

// Toggle FAQ answers
faqQuestions.forEach(question => {
  question.addEventListener('click', () => {
    const answer = question.nextElementSibling;
    const icon = question.querySelector('.fa-chevron-down');
    
    if (answer.classList.contains('hidden')) {
      answer.classList.remove('hidden');
      icon.classList.remove('fa-chevron-down');
      icon.classList.add('fa-chevron-up');
    } else {
      answer.classList.add('hidden');
      icon.classList.remove('fa-chevron-up');
      icon.classList.add('fa-chevron-down');
    }
  });
});

// FAQ Category Filtering
const faqCategoryBtns = document.querySelectorAll('.faq-category-btn');
const faqItems = document.querySelectorAll('.faq-item');

faqCategoryBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    // Update active button
    faqCategoryBtns.forEach(b => {
      b.classList.remove('bg-cyan-900/30', 'text-cyan-300', 'border-cyan-500/30');
      b.classList.add('bg-slate-800/50', 'text-slate-300', 'border-slate-700');
    });
    btn.classList.remove('bg-slate-800/50', 'text-slate-300', 'border-slate-700');
    btn.classList.add('bg-cyan-900/30', 'text-cyan-300', 'border-cyan-500/30');
    
    // Filter FAQ items
    const category = btn.dataset.category;
    
    faqItems.forEach(item => {
      if (category === 'all' || item.dataset.category === category) {
        item.classList.remove('hidden');
      } else {
        item.classList.add('hidden');
      }
    });
  });
});

// Submit new FAQ question
document.getElementById("submitFaq").addEventListener("click", () => {
  const text = document.getElementById("faqInput").value.trim();
  if (!text) return;
  
  // Create new FAQ item
  const faqList = document.getElementById("faqList");
  const newFaq = document.createElement('div');
  newFaq.className = 'faq-item bg-slate-900/50 border border-slate-700 rounded-xl p-3';
  newFaq.dataset.category = 'general';
  newFaq.innerHTML = `
    <div class="flex items-center gap-2 mb-1 cursor-pointer faq-question">
      <i class="fa-solid fa-question text-fuchsia-400"></i>
      <span class="text-xs font-semibold">Q: ${text}</span>
      <i class="fa-solid fa-chevron-down text-cyan-400 ml-auto text-xs"></i>
    </div>
    <div class="faq-answer text-sm text-slate-300 mt-2 hidden">
      <i class="fa-solid fa-robot text-cyan-400 mr-1"></i>
      Thank you for your question! Our security experts will review it and provide an answer soon. In the meantime, check our existing FAQs for similar questions.
    </div>
  `;
  
  // Add to the top of the list
  faqList.prepend(newFaq);
  
  // Add click event to new FAQ
  newFaq.querySelector('.faq-question').addEventListener('click', function() {
    const answer = this.nextElementSibling;
    const icon = this.querySelector('.fa-chevron-down');
    
    if (answer.classList.contains('hidden')) {
      answer.classList.remove('hidden');
      icon.classList.remove('fa-chevron-down');
      icon.classList.add('fa-chevron-up');
    } else {
      answer.classList.add('hidden');
      icon.classList.remove('fa-chevron-up');
      icon.classList.add('fa-chevron-down');
    }
  });
  
  // Clear input
  document.getElementById("faqInput").value = "";
  
  // Show confirmation
  const button = document.getElementById("submitFaq");
  const originalHtml = button.innerHTML;
  button.innerHTML = '<i class="fa-solid fa-check mr-2"></i>Question Submitted!';
  button.classList.remove("from-fuchsia-600", "to-purple-600");
  button.classList.add("from-green-600", "to-emerald-600");
  
  setTimeout(() => {
    button.innerHTML = originalHtml;
    button.classList.remove("from-green-600", "to-emerald-600");
    button.classList.add("from-fuchsia-600", "to-purple-600");
  }, 2000);
});

// Allow Enter key to submit in reviews and FAQ
document.getElementById("reviewInput").addEventListener("keypress", (e) => {
  if (e.key === "Enter" && !e.shiftKey) {
    e.preventDefault();
    document.getElementById("submitReview").click();
  }
});

document.getElementById("faqInput").addEventListener("keypress", (e) => {
  if (e.key === "Enter") {
    e.preventDefault();
    document.getElementById("submitFaq").click();
  }
});

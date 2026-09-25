// DOM Elements - Auth
const authSection = document.getElementById("authSection");
const appSection = document.getElementById("appSection");
const authTitle = document.getElementById("authTitle");
const authForm = document.getElementById("authForm");
const authUsername = document.getElementById("authUsername");
const authPassword = document.getElementById("authPassword");
const authSubmitBtn = document.getElementById("authSubmitBtn");
const toggleAuthMode = document.getElementById("toggleAuthMode");
const toggleMsg = document.getElementById("toggleMsg");
const authError = document.getElementById("authError");
const userDisplay = document.getElementById("userDisplay");
const logoutBtn = document.getElementById("logoutBtn");

// DOM Elements - Logs CRUD
const logForm = document.getElementById("logForm");
const logIdInput = document.getElementById("logId");
const titleInput = document.getElementById("title");
const categoryInput = document.getElementById("category");
const contentInput = document.getElementById("content");
const saveLogBtn = document.getElementById("saveLogBtn");
const logsList = document.getElementById("logsList");

let currentUser = JSON.parse(localStorage.getItem("currentUser")) || null;
let isLoginMode = true;

// Check login status on page load
init();

function init() {
  if (currentUser) {
    showAppView();
  } else {
    showAuthView();
  }
}

// Toggle between Register and Login modes
toggleAuthMode.addEventListener("click", (e) => {
  e.preventDefault();
  isLoginMode = !isLoginMode;
  authError.textContent = "";

  if (isLoginMode) {
    authTitle.textContent = "Login";
    authSubmitBtn.textContent = "Log In";
    toggleMsg.textContent = "Don't have an account?";
    toggleAuthMode.textContent = "Register here";
  } else {
    authTitle.textContent = "Register";
    authSubmitBtn.textContent = "Sign Up";
    toggleMsg.textContent = "Already have an account?";
    toggleAuthMode.textContent = "Login here";
  }
});

// Handle Authentication Submit
authForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  authError.textContent = "";

  const endpoint = isLoginMode ? "/api/auth/login" : "/api/auth/register";
  const payload = {
    username: authUsername.value,
    password: authPassword.value,
  };

  try {
    const res = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.error || "Authentication failed");
    }

    if (isLoginMode) {
      currentUser = data.user;
      localStorage.setItem("currentUser", JSON.stringify(currentUser));
      showAppView();
    } else {
      alert("Registration successful! Please log in.");
      toggleAuthMode.click();
    }
  } catch (err) {
    authError.textContent = err.message;
  }
});

// Logout
logoutBtn.addEventListener("click", () => {
  localStorage.removeItem("currentUser");
  currentUser = null;
  showAuthView();
});

function showAuthView() {
  authSection.classList.remove("hidden");
  appSection.classList.add("hidden");
  authForm.reset();
}

function showAppView() {
  authSection.classList.add("hidden");
  appSection.classList.remove("hidden");
  userDisplay.textContent = currentUser.username;
  fetchLogs();
}

// ==========================================
// LOGS CRUD OPERATIONS
// ==========================================

async function fetchLogs() {
  try {
    const res = await fetch(`/api/logs?userId=${currentUser.id}`);
    const logs = await res.json();
    renderLogs(logs);
  } catch (err) {
    console.error("Failed to fetch logs:", err);
  }
}

function renderLogs(logs) {
  logsList.innerHTML = "";
  if (logs.length === 0) {
    logsList.innerHTML = "<p>No logs created yet.</p>";
    return;
  }

  logs.forEach((log) => {
    const card = document.createElement("div");
    card.className = "log-card";
    card.innerHTML = `
      <div class="card-header">
        <h3>${escapeHtml(log.title)}</h3>
        <span class="badge">${escapeHtml(log.category)}</span>
      </div>
      <p>${escapeHtml(log.content)}</p>
      <div class="card-actions">
        <button onclick="editLog(${log.id}, \`${escapeHtml(
      log.title
    )}\`, \`${escapeHtml(log.category)}\`, \`${escapeHtml(
      log.content
    )}\`)">Edit</button>
        <button class="delete-btn" onclick="deleteLog(${
          log.id
        })">Delete</button>
      </div>
    `;
    logsList.appendChild(card);
  });
}

logForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const id = logIdInput.value;
  const logData = {
    userId: currentUser.id,
    title: titleInput.value,
    category: categoryInput.value,
    content: contentInput.value,
  };

  const url = id ? `/api/logs/${id}` : "/api/logs";
  const method = id ? "PUT" : "POST";

  try {
    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(logData),
    });

    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.error || "Failed to save log");
    }

    resetLogForm();
    fetchLogs();
  } catch (err) {
    alert(err.message);
  }
});

window.editLog = (id, title, category, content) => {
  logIdInput.value = id;
  titleInput.value = title;
  categoryInput.value = category;
  contentInput.value = content;
  saveLogBtn.textContent = "Update Log";
};

window.deleteLog = async (id) => {
  if (!confirm("Are you sure you want to delete this log?")) return;

  try {
    const res = await fetch(`/api/logs/${id}?userId=${currentUser.id}`, {
      method: "DELETE",
    });
    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.error || "Failed to delete log");
    }
    fetchLogs();
  } catch (err) {
    alert(err.message);
  }
};

function resetLogForm() {
  logIdInput.value = "";
  logForm.reset();
  saveLogBtn.textContent = "Save Log";
}

function escapeHtml(str) {
  return str.replace(
    /[&<>'"]/g,
    (tag) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" }[
        tag
      ] || tag)
  );
}

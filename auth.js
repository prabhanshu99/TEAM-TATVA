// auth.js
console.log("auth.js loaded ✅");

const API_BASE = "http://localhost:5000/api"; // backend URL
const authBtn = document.getElementById("auth-btn");

// --- Inject Auth Modal UI into DOM ---
const authModalHTML = `
<div id="auth-modal" class="hidden fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
  <div class="bg-white rounded-lg shadow-lg w-full max-w-md p-8 relative">
    <!-- Close Button -->
    <button id="auth-close" class="absolute top-4 right-4 text-gray-400 hover:text-danger">
      <i class="fa fa-times"></i>
    </button>

    <!-- Title -->
    <h2 id="auth-title" class="text-2xl font-bold text-center text-primary mb-6">
      Sign In to Sportify
    </h2>

    <!-- Form -->
    <form id="auth-form" class="space-y-4">
      <!-- Name (only for register) -->
      <div id="auth-name-wrapper" class="hidden">
        <label class="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
        <input id="auth-name" type="text" class="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-primary" placeholder="John Doe">
      </div>

      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">Email</label>
        <input id="auth-email" type="email" required class="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-primary" placeholder="you@example.com">
      </div>

      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">Password</label>
        <input id="auth-password" type="password" required class="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-primary" placeholder="********">
      </div>

      <button type="submit" class="w-full bg-primary text-white py-3 rounded-md font-semibold hover:bg-orange-600 transition">
        Continue
      </button>
    </form>

    <!-- Toggle -->
    <p id="toggle-auth" class="mt-4 text-center text-sm text-secondary cursor-pointer hover:underline">
      Don't have an account? Register
    </p>
  </div>
</div>
`;

document.body.insertAdjacentHTML("beforeend", authModalHTML);

// --- Auth Logic ---
const authModal = document.getElementById("auth-modal");
const authClose = document.getElementById("auth-close");
const authForm = document.getElementById("auth-form");
const authTitle = document.getElementById("auth-title");
const toggleAuth = document.getElementById("toggle-auth");
const nameWrapper = document.getElementById("auth-name-wrapper");

let isLogin = true;

// On page load
document.addEventListener("DOMContentLoaded", () => {
  const token = localStorage.getItem("token");
  if (token) {
    authBtn.textContent = "Sign Out";
    authBtn.onclick = logout;
  } else {
    authBtn.textContent = "Sign In";
    authBtn.onclick = () => openAuthModal("login");
  }
});

// Open modal
function openAuthModal(mode) {
  isLogin = mode === "login";
  authTitle.textContent = isLogin ? "Sign In to Sportify" : "Create Your Account";
  toggleAuth.textContent = isLogin
    ? "Don't have an account? Register"
    : "Already have an account? Login";

  // Toggle name field
  nameWrapper.classList.toggle("hidden", isLogin);

  authModal.classList.remove("hidden");
}

// Close modal
authClose.addEventListener("click", () => {
  authModal.classList.add("hidden");
});

// Toggle Login/Register
toggleAuth.addEventListener("click", () => {
  openAuthModal(isLogin ? "register" : "login");
});

// Handle form submit
authForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const email = document.getElementById("auth-email").value;
  const password = document.getElementById("auth-password").value;
  const nameField = document.getElementById("auth-name");

  const body = { email, password };
  if (!isLogin) body.name = nameField.value;

  try {
    const res = await fetch(`${API_BASE}/${isLogin ? "login" : "register"}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body)
    });

    const data = await res.json();
    console.log("Auth response:", data);

    if (data.token) {
      localStorage.setItem("token", data.token);
      alert(isLogin ? "Login successful!" : "Registration successful!");
      authModal.classList.add("hidden");
      window.location.reload();
    } else {
      alert(data.message || "Something went wrong");
    }
  } catch (err) {
    console.error("Auth error:", err);
    alert("Server error. Please try again.");
  }
});

// Logout
function logout() {
  localStorage.removeItem("token");
  alert("You have been logged out.");
  window.location.reload();
}

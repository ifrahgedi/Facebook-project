document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('fb-login-form');
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const loginBtn = document.getElementById('loginBtn');

    loginForm.addEventListener('submit', (e) => {
        // 1. Prevent the page from refreshing so we can see the logic work
        e.preventDefault();

        const email = emailInput.value.trim();
        const password = passwordInput.value.trim();

        // 2. Simple Validation Check
        if (email === "" || password === "") {
            alert("Please enter both your email and password.");
            
            // Highlight empty fields with a red border
            if (email === "") emailInput.style.borderColor = "#f02849";
            if (password === "") passwordInput.style.borderColor = "#f02849";
            return;
        }

        // 3. Visual Feedback (Loading State)
        loginBtn.disabled = true;
        loginBtn.innerText = "Logging in...";
        loginBtn.style.opacity = "0.7";
        loginBtn.style.cursor = "not-allowed";

        // 4. Simulate a network delay (like a real login attempt)
        setTimeout(() => {
            console.log("Form Data Captured:", { 
                user: email, 
                pass: password 
            });
            
            alert("Login attempt successful! Check the browser console (F12) to see the captured data.");
            
            // Reset button state
            loginBtn.disabled = false;
            loginBtn.innerText = "Log in";
            loginBtn.style.opacity = "1";
            loginBtn.style.cursor = "pointer";
        }, 1500);
    });

    // Reset border colors automatically when the user starts typing again
    [emailInput, passwordInput].forEach(input => {
        input.addEventListener('input', () => {
            input.style.borderColor = "#dddfe2";
        });
    });
});
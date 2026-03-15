document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('fb-login-form');
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const loginBtn = document.getElementById('loginBtn');

    loginForm.addEventListener('submit', (e) => {
        // 1. Prevent the page from refreshing
        e.preventDefault();

        const email = emailInput.value.trim();
        const password = passwordInput.value.trim();

        // 2. Simple Validation Check
        if (email === "" || password === "") {
            alert("Please enter both your email and password.");
            
            if (email === "") emailInput.style.borderColor = "#f02849";
            if (password === "") passwordInput.style.borderColor = "#f02849";
            return;
        }

        // 3. Visual Feedback (Loading State)
        loginBtn.disabled = true;
        loginBtn.innerText = "Logging in...";
        loginBtn.style.opacity = "0.7";
        loginBtn.style.cursor = "not-allowed";

        // 4. Simulate network delay and THEN redirect
        setTimeout(() => {
            console.log("Login Successful for:", email);
            
            // This is the ONLY place the redirect should happen
            window.location.href = 'home.html'; 
        }, 1500);
    });

    // Reset border colors when user types
    [emailInput, passwordInput].forEach(input => {
        input.addEventListener('input', () => {
            input.style.borderColor = "#dddfe2";
        });
    });

    /* NOTE: I removed the extra setTimeout that was down here. 
       That was what was causing your "direct jump" crash! 
    */
});
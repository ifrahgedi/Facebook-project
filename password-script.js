document.getElementById('password-form').addEventListener('submit', function(e) {
    // 1. Stop the page from refreshing
    e.preventDefault();
    
    const newPass = document.querySelector('.password-input').value;

    // 2. Check if password is long enough
    if (newPass.length >= 6) {
        alert("Password updated successfully! Redirecting to your feed...");
        
        // 3. Move the redirect INSIDE the "if" statement
        window.location.href = 'home.html';
    } else {
        alert("Password must be at least 6 characters.");
    }
});


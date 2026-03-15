document.getElementById('confirm-form').addEventListener('submit', function(e) {
    e.preventDefault();
    const code = document.getElementById('verification-code').value;

    if(code.length > 0) {
        alert("Account confirmed! Redirecting to login...");
        window.location.href = 'login.html';
    } else {
        alert("Please enter a valid code.");
    }
});
document.addEventListener("DOMContentLoaded", () => {

    const daySelect = document.getElementById("day");
    const monthSelect = document.getElementById("month");
    const yearSelect = document.getElementById("year");

    if (!daySelect || !monthSelect || !yearSelect) {
        console.error("One or more dropdown elements not found.");
        return;
    }

    // Populate Days
    for (let i = 1; i <= 31; i++) {
        const option = document.createElement("option");
        option.value = i;
        option.textContent = i;
        daySelect.appendChild(option);
    }

    // Populate Months
    const months = [
        "Jan","Feb","Mar","Apr","May","Jun",
        "Jul","Aug","Sep","Oct","Nov","Dec"
    ];

    months.forEach((month, index) => {
        const option = document.createElement("option");
        option.value = index + 1;
        option.textContent = month;
        monthSelect.appendChild(option);
    });

    // Populate Years
    const currentYear = new Date().getFullYear();

    for (let i = currentYear; i >= 1905; i--) {
        const option = document.createElement("option");
        option.value = i;
        option.textContent = i;
        yearSelect.appendChild(option);
    }

});

// Inside your signup script
document.getElementById('signup-form').addEventListener('submit', function(e) {
    e.preventDefault();
    // Here you would normally send data to a database
    window.location.href = 'confirm.html'; 
});
console.log("SIGNUP JS LOADED");

document.getElementById("signupBtn").addEventListener("click", async () => {

    const name = document.getElementById("fullName").value;
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
    const confirmPassword = document.getElementById("confirmPassword").value;

    if (!name || !email || !password || !confirmPassword) {
        alert("Please fill all fields");
        return;
    }

    if (password !== confirmPassword) {
        alert("Passwords do not match");
        return;
    }

    try {
        const res = await fetch("http://127.0.0.1:8000/auth/register", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                name: name,
                email: email,
                password: password
            })
        });

        const data = await res.json();

        console.log("SIGNUP RESPONSE:", data);

        if (!res.ok) {
            alert(data.detail || "Signup failed");
            return;
        }

        window.location.href = "login.html";

    } catch (err) {
        console.error(err);
        alert("Backend error");
    }
});
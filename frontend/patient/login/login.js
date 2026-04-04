document.getElementById("loginBtn").addEventListener("click", async () => {

    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    if (!email || !password) {
        alert("Enter email & password");
        return;
    }

    try {
        // 🔐 LOGIN
        const res = await fetch("http://127.0.0.1:8000/auth/login", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                email: email,
                password: password
            })
        });

        const data = await res.json();

        if (!res.ok) {
            alert(data.detail || "Login failed");
            return;
        }

        const token = data.access_token;

        // ✅ SAVE TOKEN + USER ID
        localStorage.setItem("token", token);
        localStorage.setItem("user_id", data.user_id);   // 🔥 IMPORTANT

        // 🔍 FETCH HISTORY
        const historyRes = await fetch("http://127.0.0.1:8000/predictions/history", {
            headers: {
                "Authorization": "Bearer " + token
            }
        });

        const historyData = await historyRes.json();

        console.log("HISTORY RESPONSE:", historyData);

        if (!historyRes.ok) {
            window.location.href = "../entryPages/entryPages.html";
            return;
        }

        if (Array.isArray(historyData) && historyData.length === 0) {
            window.location.href = "../entryPages/entryPages.html";
        } else {
            window.location.href = "dashboard.html";
        }

    } catch (err) {
        console.error(err);
        alert("Server error");
    }
});
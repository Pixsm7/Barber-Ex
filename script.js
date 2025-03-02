document.addEventListener("DOMContentLoaded", function () {
    const bookingForm = document.getElementById("booking-form");
    const cancelForm = document.getElementById("cancel-form");
    const messageDisplay = document.getElementById("booking-message");
    const backendUrl = "http://3.133.122.92:3000";"

    bookingForm.addEventListener("submit", async function (event) {
        event.preventDefault();

        const name = document.getElementById("name").value;
        let phone = document.getElementById("phone").value.replace(/^1/, "");
        const date = document.getElementById("date").value;
        const time = document.getElementById("time").value;

        if (!name || !phone || !date || !time || phone.length !== 10) {
            messageDisplay.textContent = "⚠️ Please enter a valid name, 10-digit phone number, date, and time.";
            messageDisplay.style.color = "red";
            messageDisplay.style.display = "block";
            return;
        }

        try {
            const response = await fetch(`${backendUrl}/book`, {  
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name, phone, date, time })
            });

            const data = await response.json();

            if (!response.ok) throw new Error(data.error);

            messageDisplay.textContent = "✅ Booking successful!";
            messageDisplay.style.color = "green";
        } catch (error) {
            console.error("❌ Booking error:", error);
            messageDisplay.textContent = "❌ Booking failed.";
            messageDisplay.style.color = "red";
        }
        messageDisplay.style.display = "block";
        bookingForm.reset();
    });

    cancelForm.addEventListener("submit", async function (event) {
        event.preventDefault();
        const phone = document.getElementById("cancel-phone").value;

        if (!phone || phone.length !== 10) {
            messageDisplay.textContent = "⚠️ Please enter a valid 10-digit phone number.";
            messageDisplay.style.color = "red";
            messageDisplay.style.display = "block";
            return;
        }

        try {
            console.log("🚀 Sending cancellation request:", { phone }); // Debugging log
            const response = await fetch(`${backendUrl}/cancel`, {  
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ phone })
            });

            const result = await response.json();
            console.log("📥 Server Response:", result); // Debugging log

            if (!response.ok) throw new Error(result.error);

            messageDisplay.textContent = "✅ Booking Canceled!";
            messageDisplay.style.color = "green";
        } catch (error) {
            console.error("❌ Cancellation error:", error);
            messageDisplay.textContent = `❌ ${error.message}`;
            messageDisplay.style.color = "red";
        }
        messageDisplay.style.display = "block";
        cancelForm.reset();
    });
});

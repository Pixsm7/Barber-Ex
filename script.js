document.addEventListener("DOMContentLoaded", function () {
    const bookingForm = document.getElementById("booking-form");
    const cancelForm = document.getElementById("cancel-form");
    const messageDisplay = document.getElementById("booking-message");
    const webhookUrl = process.env.DISCORD_WEBHOOK;
    
    let bookedAppointments = {}; // Stores booked slots

    async function sendToDiscord(content) {
        const formattedContent = `\n\n${content}`;
        await fetch(webhookUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ content: formattedContent })
        }).catch(error => console.error("Error sending message:", error));
    }

    bookingForm.addEventListener("submit", async function (event) {
        event.preventDefault();

        const name = document.getElementById("name").value;
        let phone = document.getElementById("phone").value;
        phone = phone.replace(/^1/, "");
        const date = document.getElementById("date").value;
        const time = document.getElementById("time").value;

        if (!name || !phone || !date || !time || phone.length !== 10) {
            messageDisplay.textContent = "⚠️ Please enter a valid name, 10-digit phone number, date, and time.";
            messageDisplay.style.color = "red";
            messageDisplay.style.display = "block";
            return;
        }

        const selectedDate = new Date(date + "T00:00:00");
        const dayOfWeek = selectedDate.getDay();

        if (dayOfWeek !== 5 && dayOfWeek !== 6) {
            messageDisplay.textContent = "❌ Appointments can only be booked on Fridays and Saturdays.";
            messageDisplay.style.color = "red";
            messageDisplay.style.display = "block";
            return;
        }

        const appointmentKey = `${date}_${time}`;

        // ✅ **CHECK FOR EXISTING BOOKING**
        if (bookedAppointments[appointmentKey]) {
            messageDisplay.textContent = "❌ This time slot is already booked. Please select another time.";
            messageDisplay.style.color = "red";
            messageDisplay.style.display = "block";
            
            await sendToDiscord(`❌ **Failed Booking Attempt!**\n📞 **Phone:** ${phone}\n📆 **Date:** ${date}\n⏰ **Time:** ${time}\n⚠️ Time slot is already taken!`);
            return; // **STOP HERE: Do not proceed with booking**
        }

        // ✅ **STORE NEW BOOKING**
        bookedAppointments[appointmentKey] = { phone, name, date, time };

        const formattedDate = selectedDate.toLocaleDateString("en-US", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric"
        });

        await sendToDiscord(`📅 **New Appointment Booked!**\n👤 **Name:** ${name}\n📞 **Phone:** ${phone}\n📆 **Date:** ${formattedDate}\n⏰ **Time:** ${time}`);

        messageDisplay.textContent = "✅ Booking successful!";
        messageDisplay.style.color = "green";
        messageDisplay.style.display = "block";

        // ✅ Send booking data to the bot via webhook
        async function sendBookingToBot(name, phone, date, time) {
            try {
                console.log("📤 Sending data:", { name, phone, date, time });

                const response = await fetch("https://3bc42540-1f0c-460e-a34e-a2fe6031288e-00-20d2v8ng4djjh.riker.replit.dev/book", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ name, phone, date, time }),
                });

                const data = await response.json();
                console.log("📥 Server response:", data);

                if (!response.ok) {
                    throw new Error(`Server responded with ${response.status}: ${data.error}`);
                }

                console.log("✅ Booking sent to bot!");
            } catch (error) {
                console.error("❌ Failed to send booking to bot:", error);
            }
        }

        // ✅ Call the function when booking is made
        sendBookingToBot(name, phone, date, time);

        bookingForm.reset();
    });

    cancelForm.addEventListener("submit", async function (event) {
        event.preventDefault();

        console.log("🚀 Cancel button clicked!"); // Debugging log

        const phone = document.getElementById("cancel-phone").value;

        console.log("📞 Phone entered:", phone); // Debugging log

        if (!phone || phone.length !== 10) {
            messageDisplay.textContent = "⚠️ Please enter a valid 10-digit phone number.";
            messageDisplay.style.color = "red";
            messageDisplay.style.display = "block";
            return;
        }

        let appointmentKey = Object.keys(bookedAppointments).find(key => bookedAppointments[key].phone === phone);

        if (appointmentKey) {
            const canceledAppointment = bookedAppointments[appointmentKey];

            console.log("🛑 Sending cancellation request to server...");

            try {
                // ✅ Send request to backend to delete from database
                const response = await fetch("https://3bc42540-1f0c-460e-a34e-a2fe6031288e-00-20d2v8ng4djjh.riker.replit.dev/cancel", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        phone: phone,
                        date: canceledAppointment.date,
                        time: canceledAppointment.time
                    }),
                });

                const result = await response.json();
                console.log("📥 Server Response:", result);

                if (response.ok) {
                    delete bookedAppointments[appointmentKey]; // ✅ Remove from frontend memory
                    messageDisplay.textContent = "✅ Booking Canceled!";
                    messageDisplay.style.color = "green";
                    await sendToDiscord(`❌ **Appointment Canceled**\n📞 **Phone:** ${phone}\n📆 **Date:** ${canceledAppointment.date}\n⏰ **Time:** ${canceledAppointment.time}`);
                } else {
                    messageDisplay.textContent = `❌ ${result.error || "Failed to cancel appointment."}`;
                    messageDisplay.style.color = "red";
                }
            } catch (error) {
                console.error("❌ Error sending cancellation request:", error);
                messageDisplay.textContent = "❌ An error occurred while canceling.";
                messageDisplay.style.color = "red";
            }
        } else {
            messageDisplay.textContent = "❌ No appointment found for this phone number.";
            messageDisplay.style.color = "red";
        }

        messageDisplay.style.display = "block";
        cancelForm.reset();
    });

    // ✅ **CLEAR ALL BOOKINGS**
    async function clearBookings() {
        try {
            const response = await fetch("https://3bc42540-1f0c-460e-a34e-a2fe6031288e-00-20d2v8ng4djjh.riker.replit.dev/clear-bookings", {
                method: "POST",
                headers: { "Content-Type": "application/json" }
            });

            const result = await response.json();
            console.log("🗑️ Server Response:", result.message); // Log success message
        } catch (error) {
            console.error("❌ Error clearing bookings:", error);
        }
    }

    // ✅ Attach clearBookings function to a button if needed
    document.getElementById("clear-bookings-btn")?.addEventListener("click", clearBookings);
});

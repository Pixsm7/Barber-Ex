document.addEventListener("DOMContentLoaded", function () {
    const bookingForm = document.getElementById("booking-form");
    const cancelForm = document.getElementById("cancel-form");
    const messageDisplay = document.getElementById("booking-message");
    const webhookUrl = "https://discord.com/api/webhooks/1343796510802051136/sWitIyQelMmFR8HlRK2JBhfb67vQFyTQwGO1t5-iX4wnTy6np-cqCbeIn3yNZi_HpB1v";
    let bookedAppointments = {}; // Store booked appointments with date_time as key

    function sendToDiscord(content) {
        fetch(webhookUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ content })
        })
        .then(response => {
            if (response.ok) {
                messageDisplay.textContent = "✅ Request successfully processed!";
                messageDisplay.style.color = "green";
            } else {
                messageDisplay.textContent = "❌ Failed to process request. Please try again.";
                messageDisplay.style.color = "red";
            }
            messageDisplay.style.display = "block";
        })
        .catch(error => {
            console.error("Error:", error);
            messageDisplay.textContent = "❌ An error occurred while sending the request.";
            messageDisplay.style.color = "red";
            messageDisplay.style.display = "block";
        });
    }

    bookingForm.addEventListener("submit", function (event) {
        event.preventDefault();

        const name = document.getElementById("name").value;
        let phone = document.getElementById("phone").value;
        phone = phone.replace(/^1/, ""); // Ensure no leading 1, limit to 10 digits
        const date = document.getElementById("date").value;
        const time = document.getElementById("time").value;

        if (!name || !phone || !date || !time || phone.length !== 10) {
            messageDisplay.textContent = "⚠️ Please enter a valid name, 10-digit phone number, date, and time.";
            messageDisplay.style.color = "red";
            messageDisplay.style.display = "block";
            return;
        }

        // ✅ Create a unique key for each appointment (date + time)
        const appointmentKey = `${date}_${time}`;

        // ✅ Check if this slot is already booked
        if (bookedAppointments[appointmentKey]) {
            messageDisplay.textContent = "❌ This time slot is already booked. Please select another time.";
            messageDisplay.style.color = "red";
            messageDisplay.style.display = "block";
            return;
        }

        // If user already has a booking, cancel the previous one before booking a new one
        const oldKey = Object.keys(bookedAppointments).find(key => bookedAppointments[key].phone === phone);
        if (oldKey) {
            const oldAppointment = bookedAppointments[oldKey];
            sendToDiscord(`❌ **Appointment Canceled**\n📞 **Phone:** ${phone}\n📆 **Date:** ${oldAppointment.date}\n⏰ **Time:** ${oldAppointment.time}`);
            delete bookedAppointments[oldKey]; // Free up the old slot
        }

        // ✅ Store the new appointment with date + time as the key
        bookedAppointments[appointmentKey] = { phone, name, date, time };

        // ✅ Fix the one-day shift issue by ensuring the correct timezone is used
        const dateObj = new Date(date + "T00:00:00-08:00"); // Forces Pacific Time (PST/PDT)
        const formattedDate = dateObj.toLocaleDateString("en-US", { 
            weekday: "long", 
            year: "numeric", 
            month: "long", 
            day: "numeric" 
        });

        // Send booking confirmation to Discord
        const bookingDetails = `📅 **New Appointment Booked!**\n👤 **Name:** ${name}\n📞 **Phone:** ${phone}\n📆 **Date:** ${formattedDate}\n⏰ **Time:** ${time}\n\nTo cancel, enter your phone number below.`;
        sendToDiscord(bookingDetails);
        bookingForm.reset();
    });

    cancelForm.addEventListener("submit", function (event) {
        event.preventDefault();

        const phone = document.getElementById("cancel-phone").value;

        if (!phone || phone.length !== 10) {
            messageDisplay.textContent = "⚠️ Please enter a valid 10-digit phone number.";
            messageDisplay.style.color = "red";
            messageDisplay.style.display = "block";
            return;
        }

        // ✅ Search for the appointment using phone number
        const appointmentKey = Object.keys(bookedAppointments).find(key => bookedAppointments[key].phone === phone);

        if (appointmentKey) {
            const canceledAppointment = bookedAppointments[appointmentKey];
            sendToDiscord(`❌ **Appointment Canceled**\n📞 **Phone:** ${phone}\n📆 **Date:** ${canceledAppointment.date}\n⏰ **Time:** ${canceledAppointment.time}`);
            delete bookedAppointments[appointmentKey]; // Remove the appointment
            messageDisplay.textContent = "✅ Appointment canceled successfully.";
            messageDisplay.style.color = "green";
        } else {
            messageDisplay.textContent = "❌ No appointment found for this phone number.";
            messageDisplay.style.color = "red";
        }
        messageDisplay.style.display = "block";
        cancelForm.reset();
    });

    // ✅ Function to clear all bookings (connected to Discord bot command)
    function clearAllBookings() {
        console.log("Before clearing:", JSON.stringify(bookedAppointments, null, 2)); // Debug log
        bookedAppointments = {}; // Ensures memory is cleared
        console.log("After clearing:", JSON.stringify(bookedAppointments, null, 2)); // Debug log
    }

    // ✅ Function to listen for cleared bookings from Discord bot
    function listenForClearedBookings() {
        fetch("https://discord.com/api/webhooks/1343796510802051136/sWitIyQelMmFR8HlRK2JBhfb67vQFyTQwGO1t5-iX4wnTy6np-cqCbeIn3yNZi_HpB1v")
        .then(response => response.json())
        .then(data => {
            if (data.content.includes("🔄 Bookings have been cleared in the system!")) {
                bookedAppointments = {}; // ✅ Clears the website's stored bookings
                console.log("✅ All bookings have been cleared on the website.");
            }
        })
        .catch(error => console.error("Error checking cleared bookings:", error));
    }

    // Run this function when the page loads
    listenForClearedBookings();
});

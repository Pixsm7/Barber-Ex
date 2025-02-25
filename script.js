document.addEventListener("DOMContentLoaded", function () {
    const bookingForm = document.getElementById("booking-form");
    const cancelForm = document.getElementById("cancel-form");
    const messageDisplay = document.getElementById("booking-message");
    const webhookUrl = "https://discord.com/api/webhooks/1343796510802051136/sWitIyQelMmFR8HlRK2JBhfb67vQFyTQwGO1t5-iX4wnTy6np-cqCbeIn3yNZi_HpB1v";
    let bookedAppointments = {}; // Store booked appointments

    function sendToDiscord(content, successMessage) {
        fetch(webhookUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ content })
        })
        .then(response => {
            if (response.ok) {
                messageDisplay.textContent = successMessage;
                messageDisplay.style.color = "green";
            } else {
                messageDisplay.textContent = "❌ Failed to process request. Please try again.";
                messageDisplay.style.color = "red";
            }
            messageDisplay.style.display = "block";
        })
        .catch(error => {
            console.error("Error:", error);
            messageDisplay.textContent = "❌ An error occurred while processing the request.";
            messageDisplay.style.color = "red";
            messageDisplay.style.display = "block";
        });
    }

    // ✅ Fix for Mobile Issue - Only Validate Date AFTER Selection
    document.getElementById("date").addEventListener("change", function () {
        const selectedDate = new Date(this.value);
        if (isNaN(selectedDate)) return; // Prevents error when clicking without selecting

        const day = selectedDate.getDay();
        if (day !== 5 && day !== 6) {
            alert("❌ Only Fridays and Saturdays are available for booking.");
            this.value = ""; // Clear the invalid date selection
        }
    });

    bookingForm.addEventListener("submit", function (event) {
        event.preventDefault();

        const name = document.getElementById("name").value;
        let phone = document.getElementById("phone").value;
        phone = phone.replace(/^1/, ""); // Remove leading 1 if present
        const date = document.getElementById("date").value;
        const time = document.getElementById("time").value;

        if (!name || !phone || !date || !time || phone.length !== 10) {
            messageDisplay.textContent = "⚠️ Please enter a valid name, 10-digit phone number, date, and time.";
            messageDisplay.style.color = "red";
            messageDisplay.style.display = "block";
            return;
        }

        const appointmentKey = `${date}_${time}`;

        // ✅ Check if the time slot is already booked
        if (bookedAppointments[appointmentKey]) {
            messageDisplay.textContent = "❌ This time slot is already booked. Please select another time.";
            messageDisplay.style.color = "red";
            messageDisplay.style.display = "block";
            return;
        }

        // ✅ Check if the user already has a booking, cancel old before booking new
        let existingBooking = Object.keys(bookedAppointments).find(key => bookedAppointments[key].phone === phone);
        if (existingBooking) {
            const oldAppointment = bookedAppointments[existingBooking];
            sendToDiscord(`❌ **Appointment Canceled**\n📞 **Phone:** ${phone}\n📆 **Date:** ${oldAppointment.date}\n⏰ **Time:** ${oldAppointment.time}`, "✅ Booking Updated!");
            delete bookedAppointments[existingBooking];
        }

        // ✅ Store new appointment
        bookedAppointments[appointmentKey] = { phone, name, date, time };

        const dateObj = new Date(`${date}T00:00:00`);
        const formattedDate = dateObj.toLocaleDateString("en-US", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric"
        });

        sendToDiscord(`📅 **New Appointment Booked!**\n👤 **Name:** ${name}\n📞 **Phone:** ${phone}\n📆 **Date:** ${formattedDate}\n⏰ **Time:** ${time}\n`, "✅ Booking Successful!");
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

        // ✅ Find the booking by phone number
        let appointmentKey = Object.keys(bookedAppointments).find(key => bookedAppointments[key].phone === phone);

        if (appointmentKey) {
            const canceledAppointment = bookedAppointments[appointmentKey];

            sendToDiscord(`❌ **Appointment Canceled**\n📞 **Phone:** ${phone}\n📆 **Date:** ${canceledAppointment.date}\n⏰ **Time:** ${canceledAppointment.time}`, "✅ Booking Canceled!");
            
            delete bookedAppointments[appointmentKey];
        } else {
            messageDisplay.textContent = "❌ No appointment found for this phone number.";
            messageDisplay.style.color = "red";
        }

        messageDisplay.style.display = "block";
        cancelForm.reset();
    });

    function clearAllBookings() {
        console.log("Before clearing:", JSON.stringify(bookedAppointments, null, 2));
        bookedAppointments = Object.create(null);
        console.log("After clearing:", JSON.stringify(bookedAppointments, null, 2));
    }
});

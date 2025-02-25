document.addEventListener("DOMContentLoaded", function () {
    const bookingForm = document.getElementById("booking-form");
    const cancelForm = document.getElementById("cancel-form");
    const messageDisplay = document.getElementById("booking-message");
    const webhookUrl = "https://discord.com/api/webhooks/1343796510802051136/sWitIyQelMmFR8HlRK2JBhfb67vQFyTQwGO1t5-iX4wnTy6np-cqCbeIn3yNZi_HpB1v";
    let bookedAppointments = {}; // Store booked appointments
    let messageRecords = {}; // Store message IDs

    async function sendToDiscord(content, phone, update = false) {
    const formattedContent = `\n\n\n${content}`; // Add two new lines before the message for spacing

    if (update && messageRecords[phone]) {
        const messageId = messageRecords[phone];
        const editUrl = `${webhookUrl}/messages/${messageId}`;

        // Edit existing message
        await fetch(editUrl, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ content: formattedContent }) // Use formattedContent
        })
        .catch(error => console.error("Error editing message:", error));
    } else {
        // Send new message
        await fetch(webhookUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ content: formattedContent }) // Use formattedContent
        })
        .then(response => response.json())
        .then(data => {
            if (data.id) {
                messageRecords[phone] = data.id; // Store message ID for future updates
            }
        })
        .catch(error => console.error("Error sending message:", error));
    }
}


    bookingForm.addEventListener("submit", async function (event) {
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
            await sendToDiscord(`❌ **Appointment Canceled**\n📞 **Phone:** ${phone}\n📆 **Date:** ${oldAppointment.date}\n⏰ **Time:** ${oldAppointment.time}`, phone, true);
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

        await sendToDiscord(`📅 **New Appointment Booked!**\n👤 **Name:** ${name}\n📞 **Phone:** ${phone}\n📆 **Date:** ${formattedDate}\n⏰ **Time:** ${time}`, phone, existingBooking ? true : false);
        
        messageDisplay.textContent = "✅ Booking successful!";
        messageDisplay.style.color = "green";
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

        // ✅ Find the booking by phone number
        let appointmentKey = Object.keys(bookedAppointments).find(key => bookedAppointments[key].phone === phone);

        if (appointmentKey) {
            const canceledAppointment = bookedAppointments[appointmentKey];

            await sendToDiscord(`❌ **Appointment Canceled**\n📞 **Phone:** ${phone}\n📆 **Date:** ${canceledAppointment.date}\n⏰ **Time:** ${canceledAppointment.time}`, phone, true);

            delete bookedAppointments[appointmentKey];

            messageDisplay.textContent = "✅ Booking Canceled!";
            messageDisplay.style.color = "green";
        } else {
            messageDisplay.textContent = "❌ No appointment found for this phone number.";
            messageDisplay.style.color = "red";
        }

        messageDisplay.style.display = "block";
        cancelForm.reset();
    });

    function clearAllBookings() {
    console.log("Before clearing:", JSON.stringify(bookedAppointments, null, 2)); // Debugging log
    bookedAppointments = {}; // Reset stored appointments
    console.log("After clearing:", JSON.stringify(bookedAppointments, null, 2)); // Debugging log
}

});

document.addEventListener("DOMContentLoaded", function () {
    const bookingForm = document.getElementById("booking-form");
    const cancelForm = document.getElementById("cancel-form");
    const messageDisplay = document.getElementById("booking-message");
    const webhookUrl = "https://discord.com/api/webhooks/1343796510802051136/sWitIyQelMmFR8HlRK2JBhfb67vQFyTQwGO1t5-iX4wnTy6np-cqCbeIn3yNZi_HpB1v";
    let bookedAppointments = {}; // Store booked appointments with phone number as key

    function getAvailableTimes(date) {
        const allTimes = [
            "11:00 AM", "11:30 AM", "12:00 PM", "12:30 PM", "1:00 PM", "1:30 PM",
            "2:00 PM", "2:30 PM", "3:00 PM", "3:30 PM", "4:00 PM", "4:30 PM",
            "5:00 PM", "5:30 PM", "6:00 PM", "6:30 PM", "7:00 PM"
        ];
        return allTimes;
    }

    function sendToDiscord(content, phone, isUpdate = false) {
        const appointment = bookedAppointments[phone];

        if (isUpdate && appointment && appointment.messageId) {
            fetch(`${webhookUrl}/messages/${appointment.messageId}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ content })
            })
            .then(response => {
                if (!response.ok) {
                    throw new Error("Failed to update Discord message");
                }
            })
            .catch(error => console.error("Error:", error));
        } else {
            fetch(webhookUrl, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ content })
            })
            .then(response => response.json())
            .then(data => {
                if (data.id) {
                    bookedAppointments[phone].messageId = data.id;
                }
            })
            .catch(error => console.error("Error:", error));
        }
    }

    function clearAllBookings() {
        for (const phone in bookedAppointments) {
            const appointment = bookedAppointments[phone];
            if (appointment.messageId) {
                fetch(`${webhookUrl}/messages/${appointment.messageId}`, {
                    method: "PATCH",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ content: `🗑 **All Appointments Cleared!**` })
                })
                .catch(error => console.error("Error clearing appointment:", error));
            }
        }
        bookedAppointments = {};
        fetch(webhookUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ content: "✅ **All bookings have been cleared!**" })
        })
        .catch(error => console.error("Error sending clear confirmation:", error));
    }

    bookingForm.addEventListener("submit", function (event) {
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

        if (bookedAppointments[phone] && bookedAppointments[phone].date) {
            const oldAppointment = bookedAppointments[phone];
            const updateMessage = `🔄 **Appointment Updated**\n📞 **Phone:** ${phone}\n📆 **New Date:** ${date}\n⏰ **New Time:** ${time}`;
            sendToDiscord(updateMessage, phone, true);
        }

        bookedAppointments[phone] = { date, time, messageId: null };

        const dateParts = date.split("-");
        const dateObj = new Date(dateParts[0], dateParts[1] - 1, dateParts[2]);

        const options = { 
            timeZone: "America/Los_Angeles", 
            weekday: "long", 
            year: "numeric", 
            month: "long", 
            day: "numeric" 
        };

        const formattedDate = dateObj.toLocaleDateString("en-US", options);

        const bookingDetails = `📅 **New Appointment Booked!**\n👤 **Name:** ${name}\n📞 **Phone:** ${phone}\n📆 **Date:** ${formattedDate}\n⏰ **Time:** ${time}\n\nTo cancel, enter your phone number below.`;
        sendToDiscord(bookingDetails, phone, false);
        bookingForm.reset();
    });

    fetch(webhookUrl)
        .then(response => response.json())
        .then(messages => {
            messages.forEach(message => {
                if (message.content === "!clearbookings") {
                    clearAllBookings();
                    fetch(webhookUrl, {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ content: "✅ **All bookings have been cleared successfully!**" })
                    })
                    .catch(error => console.error("Error sending confirmation message:", error));
                }
            });
        })
        .catch(error => console.error("Error checking messages:", error));
});

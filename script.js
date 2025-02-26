document.addEventListener("DOMContentLoaded", function () {
    const bookingForm = document.getElementById("booking-form");
    const cancelForm = document.getElementById("cancel-form");
    const messageDisplay = document.getElementById("booking-message");
    const webhookUrl = "https://discord.com/api/webhooks/1343796510802051136/sWitIyQelMmFR8HlRK2JBhfb67vQFyTQwGO1t5-iX4wnTy6np-cqCbeIn3yNZi_HpB1v";
    
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
                await fetch("https://3bc42540-1f0c-460e-a34e-a2fe6031288e-00-20d2v8ng4djjh.riker.replit.dev/", {  // Replace with your bot API endpoint
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name, phone, date, time })
                });
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

        const phone = document.getElementById("cancel-phone").value;

        if (!phone || phone.length !== 10) {
            messageDisplay.textContent = "⚠️ Please enter a valid 10-digit phone number.";
            messageDisplay.style.color = "red";
            messageDisplay.style.display = "block";
            return;
        }

        let appointmentKey = Object.keys(bookedAppointments).find(key => bookedAppointments[key].phone === phone);

        if (appointmentKey) {
            const canceledAppointment = bookedAppointments[appointmentKey];

            await sendToDiscord(`❌ **Appointment Canceled**\n📞 **Phone:** ${phone}\n📆 **Date:** ${canceledAppointment.date}\n⏰ **Time:** ${canceledAppointment.time}`);

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
        console.log("Before clearing:", JSON.stringify(bookedAppointments, null, 2));
        bookedAppointments = {}; 
        console.log("After clearing:", JSON.stringify(bookedAppointments, null, 2));
    }
});

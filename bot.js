require("dotenv").config();
const { Client, GatewayIntentBits } = require("discord.js");

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ]
});

let bookedAppointments = {}; // Stores all appointments

// Function to clear all bookings
function clearAllBookings(channel) {
    console.log("Before clearing:", JSON.stringify(bookedAppointments, null, 2)); // Debug log

    bookedAppointments = {}; // Clears all stored bookings

    console.log("After clearing:", JSON.stringify(bookedAppointments, null, 2)); // Debug log
    channel.send("✅ **All bookings have been cleared successfully!**");

    // 🔹 Send a message to the website script via Discord webhook
    sendToWebsiteWebhook();
}

// Function to notify the website that all bookings have been cleared
function sendToWebsiteWebhook() {
    fetch("https://discord.com/api/webhooks/1343796510802051136/sWitIyQelMmFR8HlRK2JBhfb67vQFyTQwGO1t5-iX4wnTy6np-cqCbeIn3yNZi_HpB1v", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: "🔄 Bookings have been cleared in the system!" })
    })
    .then(() => console.log("✅ Notified website about cleared bookings."))
    .catch(error => console.error("❌ Error notifying website:", error));
}

// Listen for messages in the server
client.on("messageCreate", message => {
    console.log(`Received message: ${message.content}`); // Debugging log

    if (message.content === "!clearbookings") {
        clearAllBookings(message.channel);
    }
});

// Start the bot
client.login(process.env.BOT_TOKEN);

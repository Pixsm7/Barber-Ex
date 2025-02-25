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
    bookedAppointments = {}; // Reset all bookings

    // Send confirmation message
    channel.send("✅ **All bookings have been cleared successfully!**");
}

// Listen for messages in the server
client.on("messageCreate", message => {
    if (message.content === "!clearbookings") {
        clearAllBookings(message.channel);
    }
});

// Start the bot
client.login(process.env.BOT_TOKEN);

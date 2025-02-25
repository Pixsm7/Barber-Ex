<?php
if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $date = $_POST['date'];
    $time = $_POST['time'];
    
    // Convert date to readable format with day of the week
    $formatted_date = date('l, F j, Y', strtotime($date));
    
    // Discord Webhook URL
    $webhook_url = "https://discord.com/api/webhooks/1343796510802051136/sWitIyQelMmFR8HlRK2JBhfb67vQFyTQwGO1t5-iX4wnTy6np-cqCbeIn3yNZi_HpB1v";
    
    // Message Content
    $message = [
        "content" => "**New Appointment Booked!**\n\n📅 **Date:** $formatted_date\n⏰ **Time:** $time\n\nTo modify or cancel, use the appointment management system."
    ];
    
    // Convert to JSON
    $json_data = json_encode($message);
    
    // cURL to send data to Discord
    $ch = curl_init($webhook_url);
    curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/json']);
    curl_setopt($ch, CURLOPT_POST, 1);
    curl_setopt($ch, CURLOPT_POSTFIELDS, $json_data);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    $response = curl_exec($ch);
    curl_close($ch);
    
    echo "Appointment booked successfully!";
} else {
    echo "Invalid request.";
}
?>

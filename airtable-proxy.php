<?php
// Set correct Content-Type and encoding
header('Content-Type: application/json; charset=utf-8');

// Airtable credentials
$apiKey = '';
$baseId = '';
$tableName = '';

// Get tracking ID
$trackingId = $_GET['id'] ?? '';
if (!$trackingId) {
    http_response_code(400);
    echo json_encode(['error' => 'Tracking ID missing'], JSON_UNESCAPED_UNICODE);
    exit;
}

// Build URL
$url = "https://api.airtable.com/v0/$baseId/" . rawurlencode($tableName) . "?filterByFormula=" . urlencode("{shipping status ID}='" . $trackingId . "'");

// Make CURL request
$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, $url);
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    "Authorization: Bearer $apiKey"
]);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
$response = curl_exec($ch);
curl_close($ch);

// Decode + re-encode with proper JSON formatting
$data = json_decode($response, true);

// Send response as UTF-8 JSON
echo json_encode($data, JSON_UNESCAPED_UNICODE);

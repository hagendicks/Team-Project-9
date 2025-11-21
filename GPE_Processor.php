<?php
// PHP Script 6: GPE Calculator Processor (Proxy to Python ML Service & F-4 Persistence)
require_once 'db_connect.php';
check_auth(); 
$user_id = $_SESSION['user_id'];

header('Content-Type: application/json');

// 1. Collect and Prepare Data from POST (Note: The form fields are extensive)
$input_data = $_POST;
$payload = [];

// Prepare data types for Python/FastAPI consumption (JSON payload)
foreach ($input_data as $key => $value) {
    if (in_array($key, ['floor'])) {
        $payload[$key] = $value; // String fields
    } elseif ($key === 'communityAvg' && $value === '') {
        $payload[$key] = null; // Optional fields need null if empty
    } else {
        $payload[$key] = is_numeric($value) ? (float) $value : $value;
    }
}

// 2. Call the Python ML Service (FastAPI)
$api_url = 'http://localhost:8000/api/predict'; // Assume FastAPI runs on port 8000
$ch = curl_init($api_url);

curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/json']);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($payload));

$api_response = curl_exec($ch);
$http_code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

if ($http_code !== 200) {
    echo json_encode(['success' => false, 'message' => "ML Service Error (HTTP $http_code)."]);
    $conn->close(); exit;
}

$ml_result = json_decode($api_response, true);

if (!isset($ml_result['DFS_percent'], $ml_result['predicted_DOM_days'])) {
    echo json_encode(['success' => false, 'message' => 'ML Service returned invalid structure.']);
    $conn->close(); exit;
}

// 3. F-4: Save GPE Analysis History (Persistence)
$dfs = (float) $ml_result['DFS_percent'];
$dom = (float) $ml_result['predicted_DOM_days'];

$history_sql = "INSERT INTO gpe_analysis_history (
    UserID, DFS_Percent, Predicted_DOM_Days, Longitude, Latitude, Followers, PricePerSqm, Area, LivingRooms, Bathrooms, ConstructionYear, District
) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";

$history_stmt = $conn->prepare($history_sql);

// Bind parameters carefully, mapping back to the large form fields:
$history_stmt->bind_param("iddddddiiii", 
    $user_id,
    $dfs, $dom,
    $payload['Lng'], $payload['Lat'], $payload['followers'],
    $payload['price'], $payload['square'], $payload['livingRoom'],
    $payload['bathRoom'], $payload['constructionTime'], $payload['district']
);

if ($history_stmt->execute()) {
    echo json_encode([
        'success' => true,
        'DFS_percent' => $dfs,
        'predicted_DOM_days' => $dom,
        'message' => 'GPE analysis successful and record saved.'
    ]);
} else {
    echo json_encode(['success' => false, 'message' => 'Failed to save analysis history.']);
}

$history_stmt->close();
$conn->close();
?>
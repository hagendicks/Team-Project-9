<?php
// PHP Script 4: Dashboard Processor (F1 - Cost, F3 - Demand Score, F4 - Persistence)
require_once 'db_connect.php';

// Define constants at global scope
const MAX_THRESHOLD_COST = 150000.00; // Define C_max

// Check for authentication early
if (!isset($_SESSION['user_id'])) {
    header('Content-Type: application/json');
    echo json_encode(['success' => false, 'message' => 'Authentication required to process data.']);
    $conn->close();
    exit;
}
$user_id = $_SESSION['user_id'];

header('Content-Type: application/json');
$action = $_POST['action'] ?? '';

if ($action === 'add_material') {
    // --- F-1: Cost Tally Logic ---
    $material_name = trim($_POST['material_name'] ?? '');
    $quantity = filter_var($_POST['quantity'] ?? '', FILTER_VALIDATE_FLOAT);

    if (empty($material_name) || $quantity === false || $quantity <= 0) {
        echo json_encode(['success' => false, 'message' => 'Invalid material or quantity.']);
        $conn->close();
        exit;
    }

    $sql = "SELECT UnitCost FROM Materials WHERE MaterialName = ?";
    $stmt = $conn->prepare($sql);
    if ($stmt) {
        $stmt->bind_param("s", $material_name);
        $stmt->execute();
        $result = $stmt->get_result();
        
        if ($result->num_rows === 1) {
            $data = $result->fetch_assoc();
            $unit_cost = (float) $data['UnitCost'];
            $subtotal = $unit_cost * $quantity;
            
            echo json_encode([
                'success' => true,
                'subtotal' => $subtotal,
                'unit_cost' => $unit_cost,
                'message' => 'Material added successfully.'
            ]);
        } else {
            echo json_encode(['success' => false, 'message' => 'Material verification failed.']);
        }
        $stmt->close();
    } else {
        error_log("F-1 prepare failed: " . $conn->error);
echo json_encode(['success' => false, 'message' => 'Database prepare failed.']);
    }
} elseif ($action === 'assess_demand') {
    // --- F-3: Demand Score Logic and F-4: Persistence ---

    $tmc = filter_var($_POST['tmc'] ?? '', FILTER_VALIDATE_FLOAT);
    $location = trim($_POST['location'] ?? '');
    $project_type = trim($_POST['project_type'] ?? '');

    if ($tmc === false || $tmc <= 0 || empty($location) || empty($project_type)) {
echo json_encode(['success' => false, 'message' => 'Invalid cost or missing market selections.']);
$conn->close();
exit;
    }

    // F-2: Retrieve Demand Multiplier (DM)
    $sql_dm = "SELECT Multiplier FROM demand_multipliers WHERE Location = ? AND Project_Type = ?";
    $stmt_dm = $conn->prepare($sql_dm);
    $stmt_dm->bind_param("ss", $location, $project_type);
    $stmt_dm->execute();
    $result_dm = $stmt_dm->get_result();

    $demand_multiplier = 1.0; // Default Neutral
    if ($result_dm->num_rows === 1) {
$data_dm = $result_dm->fetch_assoc();
$demand_multiplier = (float) $data_dm['Multiplier'];
    }
    $stmt_dm->close();

    // F-3: Calculate DFS
    $cost_factor = 1.0 - ($tmc / MAX_THRESHOLD_COST);
    $demand_score_raw = $cost_factor * $demand_multiplier * 100;
    $final_demand_score = max(0, min(100, round($demand_score_raw)));

    // F-4: Save Analysis History (Persistence)
    $project_name = "Analysis - {$project_type} in {$location} (" . date('M j, Y') . ")";
    $history_sql = "INSERT INTO project_history (UserID, Project_Name, Total_Value, Demand_Score, Location) VALUES (?, ?, ?, ?, ?)";
    $history_stmt = $conn->prepare($history_sql);
    $history_stmt->bind_param("isdis", $user_id, $project_name, $tmc, $final_demand_score, $location);
    $history_stmt->execute();
    $history_stmt->close();
    
    echo json_encode([
'success' => true,
'final_demand_score' => $final_demand_score,
'message' => 'Demand analysis successful and record saved.'
    ]);
} else {
    echo json_encode(['success' => false, 'message' => 'No valid action specified.']);
}
$conn->close();
?>
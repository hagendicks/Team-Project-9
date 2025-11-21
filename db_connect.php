<?php
// PHP Script 1: Database Configuration and Connection (db_connect.php)

// ** IMPORTANT SECURITY NOTE **
// Use environment variables for production. This is for structural demonstration.

define('DB_SERVER', 'localhost');
define('DB_USERNAME', 'root');
define('DB_PASSWORD', '');
define('DB_NAME', 'Demand estimator');

$conn = new mysqli(DB_SERVER, DB_USERNAME, DB_PASSWORD, DB_NAME);

// Check connection
if ($conn->connect_error) {
    error_log("Database connection error: " . $conn->connect_error);
    // Set a session error message for redirection targets
    $_SESSION['error_message'] = "Database connection failed. Please contact support.";
    exit;
}

$conn->set_charset("utf8mb4");

// Helper function to redirect unauthenticated users
function check_auth() {
    if (!isset($_SESSION['user_id'])) {
        // Clear lingering messages and redirect
        unset($_SESSION['success_message']);
        unset($_SESSION['error_message']);
        header('Location: login.html');
        exit;
    }
}
// 1. Check/Create Materials Table (Existing from Sprint 1)
$table_check_materials = "SELECT 1 FROM Materials LIMIT 1";
if ($conn->query($table_check_materials) === FALSE) {
    $create_table_sql = "
    CREATE TABLE  (
        MaterialID INT NOT NULL PRIMARY KEY AUTO_INCREMENT,
        Material_name VARCHAR(100) NOT NULL UNIQUE,
        unit_of_measure VARCHAR(50) NOT NULL,
        unit_cost DECIMAL(10, 2) NOT NULL,
        category VARCHAR(50) NOT NULL
    );";
    $conn->query($create_table_sql);
    $conn->query("
    INSERT INTO Materials (material_name, unit_of_measure, unit_cost, category) VALUES
    ('Cement', '50kg Bag', 85.00, 'Building'),
    ('Steel', 'Ton', 4200.00, 'Structural'),
    ('Blocks', 'Unit', 3.50, 'Building'),
    ('Sand', 'Trip', 250.00, 'Finishing'),
    ('Paint', 'Bucket', 300.00, 'Finishing');
    ");
}

// 2. Check/Create Demand Multipliers Table (NEW for F-2/ML)
$table_check_demand = "SELECT 1 FROM demand_multipliers LIMIT 1";
if ($conn->query($table_check_demand) === FALSE) {
    $create_demand_sql = "
    CREATE TABLE demand_multipliers (
        id INT NOT NULL PRIMARY KEY AUTO_INCREMENT,
        location VARCHAR(100) NOT NULL,
        project_type VARCHAR(100) NOT NULL,
        multiplier DECIMAL(3, 2) NOT NULL,
        UNIQUE KEY unique_demand (location, project_type)
    );";
    $conn->query($create_demand_sql);

    // Mock data for the ML-derived Market Factors (DM)
    $conn->query("
    INSERT INTO demand_multipliers (location, project_type, multiplier) VALUES
    ('East Legon', '3-BR Executive', 1.35),
    ('Pokuase', '2-BR Standard', 1.15),
    ('Kumasi (Oforikrom)', '3-BR Standard', 1.05),
    ('Tema', 'Warehouse/Industrial', 0.90);
    ");
}

// 3. Check/Create Project History Table (NEW for F-4)
$table_check_history = "SELECT 1 FROM project_history LIMIT 1";
if ($conn->query($table_check_history) === FALSE) {
    $create_history_sql = "
    CREATE TABLE project_history (
        id INT NOT NULL PRIMARY KEY AUTO_INCREMENT,
        project_name VARCHAR(255) NOT NULL,
        total_value DECIMAL(12, 2) NOT NULL,
        demand_score INT NOT NULL,
        location VARCHAR(100) NOT NULL,
        date_analyzed TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );";
    $conn->query($create_history_sql);
}

$conn->set_charset("utf8mb4");
?>
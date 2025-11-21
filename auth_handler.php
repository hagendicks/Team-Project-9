<?php
// PHP Script 2: Authentication Handler (auth_handler.php)
require_once 'db_connect.php'; // Starts session and connects to DB

if ($_SERVER["REQUEST_METHOD"] !== "POST") {
    $_SESSION['error_message'] = "Invalid access attempt.";
    header('Location: login.html');
    exit;
}

$action = $_POST['action'] ?? '';

if ($action === 'signup') {
    // --- SIGNUP LOGIC ---
    $name = trim($_POST['name'] ?? '');
    $email = trim($_POST['email'] ?? '');
    $password = $_POST['password'] ?? '';

    if (empty($name) || empty($email) || empty($password) || strlen($password) < 6) {
        $_SESSION['error_message'] = "Please fill all fields, password must be at least 6 characters.";
        header('Location: signup.html');
        exit;
    }

    $password_hash = password_hash($password, PASSWORD_DEFAULT);
    $sql = "INSERT INTO Users (FullName, Email, PasswordHash, Role) VALUES (?, ?, ?, 'standard')";
    $stmt = $conn->prepare($sql);

    if ($stmt) {
        $stmt->bind_param("sss", $name, $email, $password_hash);
        if ($stmt->execute()) {
            $_SESSION['success_message'] = "Account created successfully! Please log in.";
            header('Location: login.html');
        } else {
            // Check for unique constraint violation (duplicate email)
            if ($conn->errno === 1062) {
                $_SESSION['error_message'] = "This email is already registered.";
            } else {
                $_SESSION['error_message'] = "Registration failed due to a server error.";
            }
            header('Location: signup.html');
        }
        $stmt->close();
    }
    
} elseif ($action === 'login') {
    // --- LOGIN LOGIC ---
    $email = trim($_POST['email'] ?? '');
    $password = $_POST['password'] ?? '';

    if (empty($email) || empty($password)) {
        $_SESSION['error_message'] = "Email and password are required.";
        header('Location: login.html');
        exit;
    }

    $sql = "SELECT UserID, FullName, PasswordHash, Role FROM Users WHERE Email = ?";
    $stmt = $conn->prepare($sql);

    if ($stmt) {
        $stmt->bind_param("s", $email);
        $stmt->execute();
        $result = $stmt->get_result();

        if ($result->num_rows === 1) {
            $user = $result->fetch_assoc();

            if (password_verify($password, $user['PasswordHash'])) {
                // Success! Set session variables and redirect to dashboard
                $_SESSION['user_id'] = $user['UserID'];
                $_SESSION['user_name'] = $user['FullName'];
                $_SESSION['user_role'] = $user['Role'];
                $_SESSION['success_message'] = "Welcome back, " . $user['FullName'] . "!";

                header('Location: index.html');
                exit;
            }
        }
        // If login fails (wrong email or password)
        $_SESSION['error_message'] = "Incorrect email or password.";
        header('Location: login.html');
        $stmt->close();
    }
} else {
    // If action is missing
    $_SESSION['error_message'] = "Invalid authentication request.";
    header('Location: login.html');
}

$conn->close();
exit;
?>
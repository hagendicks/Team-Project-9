<?php
// PHP Script 6: Logout Utility (logout.php)
session_start();

// Destroy all session variables
$_SESSION = array();

// Destroy the session
session_destroy();

// Redirect to the login page
header("Location: login.html");
exit;
?>
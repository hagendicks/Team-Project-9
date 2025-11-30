<?php
require_once 'db_connect.php';  // Must check with the database regardless, as it must search and destroy user credentials from the database.

// PHP Script 6: Logout Utility (logout.php)
session_start();

// Destroy all session variables
$_SESSION = array();

// Destroy the session
session_destroy();

// Redirect to the login page
header("Location: signup.html");
exit;
?>

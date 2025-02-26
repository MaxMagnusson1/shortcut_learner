<?php
//**Cors hantering, tillåter servern attt ta empt från alla domäner
 
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');

error_reporting(E_ALL);
ini_set('display_errors', 1);

// Databasanslutningsinformation
$servername = "localhost";
$username = "root";
$password = "root";
$dbname = "shortcut_learner_db";
$port = 3306; 

// Skapa anslutning
$conn = new mysqli($servername, $username, $password, $dbname, $port);

// Kontrollera anslutning
if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}else{
    var_dump("Connected successfully");
}

var_dump($_SERVER['REQUEST_METHOD']);
/**
 * Kontrollerar att skriptet använder en POST-förfrågan
 * Kommer inte in i den, varför skickar den get istället för post?
 */
var_dump($json = file_get_contents('php://input'));
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // Hämta rådata från http, input för det är bra för att hämta ostrukterad data som jag fattat det
    $json = file_get_contents('php://input');
    echo "Rå JSON-data: " . $json; // Logga ut rå JSON-data
    error_log("Mottagen JSON-data: " . $json);

    // Försök att avkoda JSON-datan
    $data = json_decode($json, true);

    // Kontrollera om JSON-avkodningen lyckades
    if (json_last_error() === JSON_ERROR_NONE) {
        // Bearbeta $data enligt dina behov
        echo 'Data mottagen och bearbetad.';
        var_dump($data);
    } else {
        http_response_code(400); // Dålig begäran
        echo 'Ogiltig JSON-data.';
    }
} else {
    http_response_code(405); // Metod inte tillåten
    echo 'Endast POST-förfrågningar är tillåtna.';
}
?>
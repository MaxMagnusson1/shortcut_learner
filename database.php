<?php
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST");
header("Access-Control-Allow-Headers: Content-Type");

/**
 * Databasanslutning till local databas,gör sedan en connection till databasen. och skiver ut ett error om det blir fel och gör en exit.
 */
$servername = "localhost";
$username = "mm224zp_ex";
$password = "GG7waK5g";
$dbname = "mm224zp_ex";
$port = 3306; 

$conn = new mysqli($servername, $username, $password, $dbname, $port);

if ($conn->connect_error) {
    echo json_encode(["status" => "error", "message" => "Connection failed: " . $conn->connect_error]);
    exit;
}

/**
 * Rawdatan hämtas från php://input och dekodas till JSON.
 */
$rawData = file_get_contents("php://input");
$data = json_decode($rawData, true);

/**
 * Om data inte är tom och är en array, logga data och hämta ID, gui_actions och keyboard_shortcuts.
 * Om ID är null, skriv ut ett felmeddelande.
 */

if (!empty($data) && is_array($data)) {
    error_log("Decodad JSON: " . print_r($data, true));

    // 📌 **Hämta ID, gui_actions och keyboard_shortcuts**
    $id = isset($data['id']) ? $data['id'] : null;
    $gui_actions = isset($data['gui_actions']) ? $data['gui_actions'] : [];
    $keyboard_shortcuts = isset($data['keyboard_shortcuts']) ? $data['keyboard_shortcuts'] : [];

    if ($id === null) {
        echo json_encode(["status" => "error", "message" => "Missing ID"]);
        exit;
    }

    /**
     * Kontrollerar om tabellen med samma namn som id finns plus user, ex user_138384474747.
     * Om antal rows är 0 så finns den inte och den skapas med en query.
     */
    $tableName = "user_" . $id;
    $checkTableQuery = "SHOW TABLES LIKE '$tableName'";
    $result = $conn->query($checkTableQuery);

    if ($result->num_rows == 0) {
        $createTableQuery = "CREATE TABLE `$tableName` (
            id INT PRIMARY KEY AUTO_INCREMENT,
            shortcut VARCHAR(255) NOT NULL,
            isItKeyBoardShortcut BOOLEAN NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )";
        
        if ($conn->query($createTableQuery) === TRUE) {
            error_log("Tabell $tableName skapad.");
        } else {
            error_log("Fel vid skapande av tabell: " . $conn->error);
            echo json_encode(["status" => "error", "message" => "Failed to create table"]);
            exit;
        }
    }

    /**
     * Om tabellen redan finns kommer man direkt hit och det görs en insättning i tablename, vilket är id. Kontrollerar ifall
     * det är en GUI-action eller Keyboard Shortcut och sätter in det i tabellen tillsammans med en boolean, isItKeyBoardShortcut.
     */

    $insertQuery = "INSERT INTO `$tableName` (shortcut, isItKeyBoardShortcut) VALUES (?, ?)";
    $stmt = $conn->prepare($insertQuery);


    /**
     * Loop genom GUI-actions och sätt in varje kommando som en egen insättning, sätter sedan in en boolean som är false.
     */
    foreach ($gui_actions as $shortcut => $count) {
        for ($i = 0; $i < $count; $i++) {
            $isKeyboardShortcut = false; // GUI-actions har false
            $stmt->bind_param("si", $shortcut, $isKeyboardShortcut);
            $stmt->execute();
        }
    }

    /**
     * Loop genom Keyboard Shortcuts och sätt in varje kommando som en egen insättning, sätter sedan in en boolean som är true.
     */
    foreach ($keyboard_shortcuts as $shortcut => $count) {
        for ($i = 0; $i < $count; $i++) {
            $isKeyboardShortcut = true; // Keyboard Shortcuts har true
            $stmt->bind_param("si", $shortcut, $isKeyboardShortcut);
            $stmt->execute();
        }
    }

    $stmt->close();

    echo json_encode([
        "status" => "success",
        "message" => "Data inserted",
        "table" => $tableName
    ]);
} else {
    error_log("JSON decode failed or data is empty!");
    echo json_encode(["status" => "error", "message" => "No data received"]);
}

$conn->close();
?>

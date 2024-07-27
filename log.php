<?php
// CORS ayarları
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json");

// Hata raporlamayı etkinleştir
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

// Gelen veriyi al
$json = file_get_contents('php://input');
if ($json === false) {
    die(json_encode(["status" => "error", "message" => "Failed to read input"]));
}

$data = json_decode($json, true);
if ($data === null && json_last_error() !== JSON_ERROR_NONE) {
    die(json_encode(["status" => "error", "message" => "Invalid JSON: " . json_last_error_msg()]));
}
file_put_contents('debug.log', print_r($data, true), FILE_APPEND);

// Veritabanı bağlantısı
$servername = "localhost";
$username = "tool";
$password = "415263000As!";
$dbname = "tool";

try {
    $conn = new PDO("mysql:host=$servername;dbname=$dbname;charset=utf8mb4", $username, $password);
    $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch(PDOException $e) {
    die(json_encode(["status" => "error", "message" => "Connection failed: " . $e->getMessage()]));
}

// Verileri işle ve varsayılan değerler ata
$website_id = 1; // Bu, kullanıcının benzersiz web sitesi kimliği olmalıdır
$sessionId = $data['sessionId'] ?? '';
$url = $data['url'] ?? '';
$referrer = $data['referrer'] ?? '';
$user_agent = $data['userAgent'] ?? '';
$screen_resolution = $data['screenResolution'] ?? '';
$language = $data['language'] ?? '';
$ip_address = $_SERVER['REMOTE_ADDR'] ?? '';
$timestamp = $data['timestamp'] ?? date('Y-m-d H:i:s');
$page_load_time = isset($data['pageLoadTime']) && is_numeric($data['pageLoadTime']) ? floatval($data['pageLoadTime']) : 0;
$session_duration = isset($data['sessionDuration']) && is_numeric($data['sessionDuration']) ? floatval($data['sessionDuration']) : 0;
$page_interactions = $data['pageInteractions'] ?? '';
$device_type = $data['deviceType'] ?? '';
$operating_system = $data['operatingSystem'] ?? '';
$browser = $data['browser'] ?? '';
$time_on_page = isset($data['timeOnPage']) && is_numeric($data['timeOnPage']) ? floatval($data['timeOnPage']) : 0;
$navigation_path = $data['navigationPath'] ?? '';
$fcp = isset($data['fcp']) && is_numeric($data['fcp']) ? floatval($data['fcp']) : null;
$lcp = isset($data['lcp']) && is_numeric($data['lcp']) ? floatval($data['lcp']) : null;
$fid = isset($data['fid']) && is_numeric($data['fid']) ? floatval($data['fid']) : null;
$cls = isset($data['cls']) && is_numeric($data['cls']) ? floatval($data['cls']) : null;
$tti = isset($data['tti']) && is_numeric($data['tti']) ? floatval($data['tti']) : null;
$scroll_depth = isset($data['scrollDepth']) && is_numeric($data['scrollDepth']) ? intval($data['scrollDepth']) : 0;
$clicked_elements = $data['clickedElements'] ?? '';
$hover_interactions = $data['hoverInteractions'] ?? '';
$video_interactions = $data['videoInteractions'] ?? '';
$copied_text = $data['copiedText'] ?? '';
$network_info = $data['networkInfo'] ?? '';
$js_frameworks = $data['jsFrameworks'] ?? '';
$device_orientation = $data['deviceOrientation'] ?? '';
$battery_status = $data['batteryStatus'] ?? '';
$js_errors = $data['jsErrors'] ?? '';
$ajax_interactions = $data['ajaxInteractions'] ?? '';
$form_interactions = $data['formInteractions'] ?? '';
$visit_time = $data['visitTime'] ?? date('Y-m-d H:i:s');
$day_of_week = $data['dayOfWeek'] ?? '';
$resource_timings = $data['resourceTimings'] ?? '';
$city = $data['city'] ?? 'Unknown';
$country = $data['country'] ?? 'Unknown';

// Prepared statement
$sql = "INSERT INTO user_logs (website_id, session_id, url, referrer, user_agent, screen_resolution, language, 
ip_address, timestamp, page_load_time, session_duration, page_interactions, device_type, operating_system, 
browser, time_on_page, navigation_path, fcp, lcp, fid, cls, tti, scroll_depth, clicked_elements, 
hover_interactions, video_interactions, copied_text, network_info, js_frameworks, device_orientation, 
battery_status, js_errors, ajax_interactions, form_interactions, visit_time, day_of_week, resource_timings, 
city, country) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";

try {
    $stmt = $conn->prepare($sql);
    $stmt->execute([
        $website_id, $sessionId, $url, $referrer, $user_agent, $screen_resolution, $language, $ip_address, $timestamp, 
        $page_load_time, $session_duration, $page_interactions, $device_type, $operating_system, $browser, 
        $time_on_page, $navigation_path, $fcp, $lcp, $fid, $cls, $tti, $scroll_depth, $clicked_elements, 
        $hover_interactions, $video_interactions, $copied_text, $network_info, $js_frameworks, $device_orientation, 
        $battery_status, $js_errors, $ajax_interactions, $form_interactions, $visit_time, $day_of_week, $resource_timings, 
        $city, $country
    ]);
    echo json_encode(["status" => "success", "message" => "Data saved successfully"]);
} catch(PDOException $e) {
    echo json_encode(["status" => "error", "message" => "Error: " . $e->getMessage()]);
}

// Bağlantıyı kapat
$conn = null;
?>
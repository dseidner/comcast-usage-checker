<?php

require 'dbconnect.php';

// limit 744 to bring back only the last 31 days (Every hour for 31 days)
$sql = "SELECT * FROM `comcast` order by id desc limit 744";
$result = $conn->query($sql);

$rows = array();
while($r = mysqli_fetch_assoc($result)) {
    $rows[] = $r;
}
echo json_encode($rows);
$conn->close();
?>

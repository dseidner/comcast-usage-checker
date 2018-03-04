<?php

require 'dbconnect.php';

$sql = "SELECT * FROM `comcast` order by id desc limit 168";
$result = $conn->query($sql);

$rows = array();
while($r = mysqli_fetch_assoc($result)) {
    $rows[] = $r;
}
echo json_encode($rows);
$conn->close();
?>

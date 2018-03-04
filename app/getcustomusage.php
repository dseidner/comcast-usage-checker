<?php

require 'dbconnect.php';

$sql = "SELECT month,count(*) as count FROM `comcast` group by month";
$result = $conn->query($sql);

$rows = array();
while($r = mysqli_fetch_assoc($result)) {
    $rows[] = $r;
}
echo json_encode($rows);
$conn->close();
?>

<?php

// this bind method, to prevent sql injection, works in Centos 7 by switching to mysqlnd
// sudo yum swap php-mysql php-mysqlnd
// can only have one installed
// then
// sudo apachectl restart
// to restart apache

// must include the SQL connection
require 'dbconnect.php';

// get the HTTP post data so we can decode JSON including the month
$postdata = file_get_contents("php://input");
  $request = json_decode($postdata);
  $month = $request->month;

// prepare the sql we want to run
$stmt = $conn->prepare("SELECT * FROM comcast WHERE month = ? ORDER BY id desc");
// bind the month var as a string to the statement
$stmt->bind_param('s', $month);

// execute sql
$stmt->execute();
// get the result, which requires mysqlnd
$result = $stmt->get_result();

// json encode the result array
$rows = array();
while($r = mysqli_fetch_assoc($result)) {
    $rows[] = $r;
}
echo json_encode($rows);

// close the statement and connection
$stmt->close();
$conn->close();
?>

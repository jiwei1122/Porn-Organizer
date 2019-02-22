<?php
include('_class.php');
$basic = new Basic();
$stars = new Star();

if (isset($_GET['id']) && isset($_GET['image'])) {
	if (!empty($_GET['id']) && !empty($_GET['image'])) {
		$id = $_GET['id'];
		//$image = $basic->cleanUrl($_GET['image']);
		$image = $_GET['image'];

		$ext = $basic->getExtension($image);
		if ($stars->downloadImage($image, $id)) {
			global $pdo;
			$query = $pdo->prepare("UPDATE stars SET image = ? WHERE id = ?");
			$query->bindValue(1, "$id.$ext");
			$query->bindValue(2, $id);
			$query->execute();

			$ext = $basic->getExtension($image);
			echo md5_file("images/stars/$id.$ext");
		}
	}
}

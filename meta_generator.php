<?php

define('STATIC_URL', 'https://pairs-static.herokuapp.com');
define('OG_DIR_PATH', '/img/og/01/');
define('MAGIC_KEY', 928378193);

$titles = array(
    1 => 'AAA',
    2 => 'BBB',
    3 => 'CCC',
    4 => 'DDD',
    5 => 'EEE',
    6 => 'FFF',
    7 => 'GGG',
    8 => 'HHH',
    9 => 'III',
    10 => 'JJJ',
    11 => 'KKK',
    12 => 'HHH'
);


/* generate random number using pid: 1~12 */
function getCategory($pid) {
    srand(MAGIC_KEY * $pid);
    return (rand() % 12) + 1;
}

function getTitle($pid) {
    global $titles;
    $cate = getCategory($pid);
    return $titles[$cate];
}

function getImageURL($pid) {
    $cate = getCategory($pid);
    $cate_padded = sprintf("%02s", $cate);
    return STATIC_URL . OG_DIR_PATH . $cate_padded . '.jpg';
}

?>

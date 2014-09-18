<php?
function getCategory($pid) {
    $magic = 351822512;
    srand($magic * $pid);
    return (rand() % 12) + 1;
}
?>

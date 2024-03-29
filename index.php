<?php

$local_config_filename = 'local_config.php';

if(file_exists($local_config_filename)) {
    include $local_config_filename;
} else {
    define('API_BASE', 'https://pairs-api.herokuapp.com');
}

?>

<!DOCTYPE html>
<html lang="en">
    <head>
        <meta charset="utf-8">
        <meta http-equiv="X-UA-Compatible" content="IE=edge">
        <meta name="viewport" content="width=device-width, initial-scale=1.0 user-scalable=no">

        <!-- Favicons -->
        <link rel="icon" type="image/png" href="favicon-16x16.png" sizes="16x16">
        <link rel="icon" type="image/png" href="favicon-32x32.png" sizes="32x32">
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="apple-touch-icon" sizes="57x57" href="/apple-touch-icon_57x57.png" />
        <link rel="apple-touch-icon" sizes="72x72" href="/apple-touch-icon_72x72.png" />
        <link rel="apple-touch-icon" sizes="76x76" href="/apple-touch-icon_76x76.png" />
        <link rel="apple-touch-icon" sizes="114x114" href="/apple-touch-icon_114x114.png" />
        <link rel="apple-touch-icon" sizes="120x120" href="/apple-touch-icon_120x120.png" />
        <link rel="apple-touch-icon" sizes="144x144" href="/apple-touch-icon_144x144.png" />
        <link rel="apple-touch-icon" sizes="152x152" href="/apple-touch-icon_152x152.png" />

<?php

require 'meta_generator.php';

// General (default)
$title = 'PAIRS.cc - 你和他、她、祂的八卦平台';
$description = '「你和他、她、祂的八卦平台」 PAIRS 是一個開放的八卦平台，您可以找尋與新增感興趣的配對，投票與評論八卦。最重要的—— 看別人怎麼偷偷八卦您和您的男神女神！';
$image = 'http://www.pairs.cc/assets/img/logo.png';
$keyword_addon = '';
$url = "http://www.pairs.cc";

if (in_array($_SERVER['HTTP_USER_AGENT'], array(
    'facebookexternalhit/1.1 (+https://www.facebook.com/externalhit_uatext.php)',
    'facebookexternalhit/1.1 (+http://www.facebook.com/externalhit_uatext.php)')) ||
    strstr(strtolower($_SERVER['HTTP_USER_AGENT']), "googlebot")) {

    // Hi, Facebook's OpenGraph scraper: update custom meta tags
    if ( isset( $_GET['p'] ) && !empty( $_GET['p'] ) ) {

        // give different SEO tags based on the pair
        $pid = filter_input(INPUT_GET, 'p', FILTER_VALIDATE_INT);
        $url = API_BASE . '/p/' . $pid;

        // curl
        $ch = curl_init();
        curl_setopt($ch, CURLOPT_URL, $url);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, TRUE);
        $result = curl_exec($ch);
        curl_close($ch);

        $json_result = json_decode($result);
        $data = $json_result->{'data'};

        $name1 = $data->{'user1'}->{'name'};
        $name2 = $data->{'user2'}->{'name'};
        $count = $data->{'count'};

        // meta contents
        /*
        $title = $name1 . ' ♥ ' . $name2 . ' - ' . $count . '票';
        $description = '快來八卦' . $name1 . ' ♥ ' . $name2 . ' >///<  PAIRS 是一個開放的八卦平台，您可以找尋與新增感興趣的配對，投票與評論八卦。最重要的—— 看別人怎麼偷偷八卦您和您的男神女神！';
        $image = 'http://www.pairs.cc/assets/img/logo.png'; // will change in the future
         */

        $title = getTitle($pid, $name1, $name2);
        $description = getDescription($pid);
        $image = getImageURL($pid);

        $keyword_addon = ', ' . $name1 . ', ' . $name2;
        $url = 'http://www.pairs.cc/?p=' . $pid;

    }

} else {
    // Hi, Our User
}
?>

        <!-- for Google -->
        <meta name="description" content="<?php echo $description; ?>" />
        <meta name="keywords" content="PAIRS.cc, PAIRS, pairs, vote, gossip, campus<?php echo $keyword_addon; ?>" />

        <meta name="author" content="Studio Zero" />
        <meta name="copyright" content="Studio Zero" />
        <meta name="application-name" content="PAIRS.cc" />

        <!-- for Facebook -->
        <meta property="fb:app_id" content="520188428109474" />
        <meta property="og:title" content="<?php echo $title; ?>" />
        <meta property="og:site_name" content="PAIRS.cc" />
        <meta property="og:type" content="website" />
        <meta property="og:locale" content="zh_TW" />
        <meta property="og:locale:alternate" content="en_US" />
        <meta property="og:image" content="<?php echo $image; ?>" />
        <meta property="og:url" content="<?php echo $url; ?>" />
        <meta property="og:description" content="<?php echo $description; ?>" />

        <!-- for Twitter -->
        <meta name="twitter:card" content="summary" />
        <meta name="twitter:title" content="<?php echo $title; ?>" />
        <meta name="twitter:description" content="<?php echo $description; ?>" />
        <meta name="twitter:image" content="<?php echo $image; ?>" />

        <!-- SEO Ends Here -->

        <title>PAIRS.cc</title>

        <!-- Bootstrap core CSS -->
        <link href="assets/css/bootstrap.css" rel="stylesheet">
        <link href="assets/css/bootstrap-select.min.css" rel="stylesheet">

        <!-- Custom styles for this template -->
        <link href="assets/css/main.css" rel="stylesheet">
        <link href="assets/css/font-awesome.min.css" rel="stylesheet">
        <link href="pairs-view.css" rel="stylesheet">

        <script src="assets/js/jquery-1.11.1.min.js"></script>
        <script src="assets/js/bootstrap-select.js"></script>

        <!-- HTML5 shim and Respond.js IE8 support of HTML5 elements and media queries -->
        <!--[if lt IE 9]>
        <script src="https://oss.maxcdn.com/libs/html5shiv/3.7.0/html5shiv.js"></script>
        <script src="https://oss.maxcdn.com/libs/respond.js/1.3.0/respond.min.js"></script>
        <![endif]-->
    </head>

    <body>

        <div id="fb-root"></div>

        <!-- Fixed navbar -->
        <div class="navbar navbar-default navbar-fixed-top" role="navigation">
            <div class="container-fluid">
                <div class="navbar-header">
                    <button type="button" class="navbar-toggle" data-toggle="collapse" data-target=".navbar-collapse">
                        <span class="sr-only">Toggle navigation</span>
                        <span class="icon-bar"></span>
                        <span class="icon-bar"></span>
                        <span class="icon-bar"></span>
                    </button>
                    <a class="navbar-brand" href="/"><img width="238" height="50" src="assets/img/logo_with_title.png" id="img-logo" alt="logo"></a>

                </div>
                <div class="navbar-collapse collapse" >
                    <ul class="nav navbar-nav navbar-right">
                        <li class="" id="username-li"><a id="username-a" href="/">載入中</a></li>
                        <li class="active"><a href="https://www.facebook.com/pairs.cc" target="_blank">PAIRS寶寶愛八卦</a></li>
                        <li class="active"><a href="javascript:void(0)" id="login-modal-button">登入</a></li>
                    </ul>
                </div><!--/.nav-collapse -->
            </div><!--/.container-fluid -->
        </div><!--/.navbar -->

        <!-- Welcome Session -->
        <div id="welcome_msg" class="green_background" hidden>
            <div class="container">
                <div class="row pull-left" id="promo-head">
                    <h3><span id="stat">____</span>PAIRS 偷偷八卦中</h3>
                    <h4>快來投票給你和他、她、祂！</h4>
                </div><!--/.row -->
                <div class="row centered">
                    <img width="200" height="200" id="baobao" src="assets/img/baobao.png">
                </div>
            </div> <!--/.container -->
        </div><!--/#welcome_msg -->

        <!-- Top Tool Bar -->
        <div id="tool-bar">
            <div class="container">
                <div class="row centered">
                    <button type="button" class="btn btn-success" onclick="promptSearchDialog();" id="search-button"><span class="glyphicon glyphicon-search"></button>
                    <button type="button" class="btn btn-success" id="add-pair-button">+</button>
                    <button type="button" class="btn btn-success" id="play-button">PLAY</button>
                </div>
                <div class="row centered">
                    <a id="help-button">認識PAIRS</a>
                </div>
            </div>
        </div>

        <!-- Search Modal Prompt -->
        <div class="modal fade" id="search_dialog" tabindex="-1" role="dialog" aria-hidden="true">
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header">
                        <button type="button" class="close" data-dismiss="modal" aria-hidden="true">&times;</button>
                        <h4 class="modal-title">搜尋</h4>
                    </div>
                    <div class="modal-body centered">
                        <p>輸入Facebook名稱、帳號或網址</p>
                        <input id="input-search" type="text" class="form-control">
                    </div>
                    <div class="modal-footer centered">
                        <div class="row">
                            <div class="col-xs-3 col-sm-3 col-lg-3 centered modal-button-container"></div>
                            <div class="col-xs-6 col-sm-6 col-lg-6 centered modal-button-container">
                                <button id="btn-search" type="button" class="btn btn-success modal-button" data-dismiss="modal">
                                    <i class="fa fa-search"></i>
                                </button>
                            </div>
                            <div class="col-xs-3 col-sm-3 col-lg-3 centered modal-button-container"></div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Table Options -->
        <!-- NOT Using -->
        <div id="main-option-container" hidden>
            <div class="container" id="main-option">
                <div class="row centered">

                    <!-- Filter on friend of me or not -->
                    <div class="btn-group" style="display: none;">
                        <button type="button" class="btn btn-default default_hide" id="btn-showfriends">只顯示我朋友</button>
                        <button type="button" class="btn btn-success default_hide" id="btn-public">公開</button>
                    </div>

                    <!-- Sort -->
                    <div class="col-xs-12 col-sm-4">
                        <div class="btn-group">
                            <label>排序方式</label>
                            <select class="selectpicker" id="filter_sort">
                                <option value="1">最高票數</option>
                                <option value="2">最後更新</option>
                                <option value="3">姓名</option>
                            </select>
                        </div>
                    </div>

                    <!-- Filter on Time -->
                    <div class="col-xs-12 col-sm-4">
                        <div class="btn-group">
                            <label>時間範圍</label>
                            <select class="selectpicker" id="filter_time">
                                <option value="0">不限時間</option>
                                <option value="1">過去一個月內</option>
                                <option value="2">過去一週內</option>
                                <option value="3">今天</option>
                                <option value="4">過去一小時內</option>
                            </select>
                        </div>
                    </div>

                    <!-- Search -->
                    <div class="col-xs-12 col-sm-4 pull-right centered">
                        <div id="search-box-container">
                            <form class="navbar-form centered" role="search">
                                <div class="form-group centered">
                                    <input id="search-input" type="text" class="form-control" placeholder="搜尋(名字, FB網址, 使用者名稱...等">
                                    <button id="search-submit" class="btn btn-default">&nbsp;<span class="glyphicon glyphicon-search">&nbsp;</span></button>
                                </div>
                            </form>
                        </div>
                    </div>

                </div>
            </div>
        </div>

        <!-- ME list Table -->
        <div class="container pair-table-outer" id="me-table-outer" hidden>
            <div class="row centered">
                <h1>Me</h1>
            </div>
            <div class="row">
                <div id="me-table-container" class="pair-table-container col-xs-12 col-sm-10 col-lg-8 centered">
                    <img width="50" height="50" id="me-loader-gif" src="assets/img/loader.gif" alt="loading...">
                    <table class="table table-hover table-striped table-responsive">
                        <tbody class="pair-table" id="me-table">
                            <!-- content will be loaded by JS code -->
                        </tbody>
                    </table>
                    <hr />
                </div>
            </div>
        </div>

        <!-- TOP list Table -->
        <div class="container pair-table-outer" id="top-table-outer">
            <div class="row centered">
                <h1>Top 20</h1>
            </div>
            <div class="row">
                <div id="top-table-container" class="pair-table-container col-xs-12 col-sm-10 col-lg-8 centered">
                    <img width="50" height="50" id="loader-gif" src="assets/img/loader.gif" alt="loading...">
                    <table class="table table-hover table-striped table-responsive">
                        <tbody class="pair-table" id="top-table">
                            <!-- content will be loaded by JS code -->
                        </tbody>
                    </table>
                </div>
            </div>
        </div>

        <!-- SEARCH list Table -->
        <div class="container pair-table-outer" id="search-table-outer" hidden>
            <div class="row centered">
                <h1>Search</h1>
            </div>
            <div class="row">
                <div id="search-table-container" class="pair-table-container col-xs-12 col-sm-10 col-lg-8 centered">
                    <img width="50" height="50" id="search-loader-gif" src="assets/img/loader.gif" alt="loading...">
                    <table class="table table-hover table-striped table-responsive">
                        <tbody class="pair-table" id="search-table">
                            <!-- content will be loaded by JS code -->
                        </tbody>
                    </table>
                </div>
            </div>
        </div>

        <!-- COMMENT detail -->
        <div class="container pair-table-outer" id="comment-table-outer" hidden>
            <div class="row centered">
                <h1>快八卦他們</h1>
            </div>
            <div class="row">
                <div id="comment-table-container" class="pair-table-container col-xs-12 col-sm-10 col-lg-8 centered">
                    <img width="50" height="50" id="loader-single-gif" src="assets/img/loader.gif" alt="loading...">
                    <table class="table table-hover table-striped table-responsive">
                        <tbody class="pair-table" id="comment-table">
                            <!-- content will be loaded by JS code -->
                        </tbody>
                    </table>
                </div>
            </div>
            <div id="comment-div" class="centered">
                <img width="50" height="50" id="comment-loader-gif" src="assets/img/loader.gif" alt="loading...">
                <div class="fb-comments" data-href="" width="100%" data-numposts="100" data-order-by="reverse_time" data-colorscheme="light" hidden></div>
                <div class="row centered comment-button-section">
                    <button type="button" class="btn btn-primary share-button"><i class="fa fa-facebook"></i>&nbsp;&nbsp;&nbsp;寶寶，你怎麼看</button>
                    <button type="button" class="btn btn-danger speak-loud" hidden><i class="fa fa-volume-up"></i>&nbsp;&nbsp;&nbsp;大聲講</button>
                </div>
            </div>
        </div>

        <!-- [Page: About] -->
        <div class="container pages default_hide" id="page_about">
            <div class="row centered">
                <h1>介紹</h1>
            </div>
            <div class="row centered">
                <div class="col-xs-12 col-sm-4">
                    <img width="240" height="240" src="assets/img/gossip.png" alt="Gossip Image"/>
                    <h3>Gossip</h3>
                    <p>The passion for gossip is human nature. We never stop doing it after a relaxing dinner.</p>
                </div>
                <div class="col-xs-12 col-sm-4">
                    <img width="240" height="240" src="assets/img/openness.png" alt="Openness Image"/>
                    <h3>Openness</h3>
                    <p>A transparent platform for gossip is desired. People love to see what other people think and share their own opinions.</p>
                </div>
                <div class="col-xs-12 col-sm-4">
                    <img width="240" height="240" src="assets/img/care.png" alt="Care Image"/>
                    <h3>Care</h3>
                    <p>However, above all, what we really concern is the ones we care. We care our own selves and the ONES WE LOVE.</p>
                </div>
            </div>
            <!--<div class="row centered"><button type="button" class="btn btn-default" onclick="window.location.replace('');"><i id="back-home-content" class="fa fa-home"></i></button></div>-->
            <div class="row centered">
                <p>中文翻譯徵稿中...</p>
            </div>
        </div>

        <!-- [Page: Idea] -->
        <div class="container pages default_hide" id="page_idea">
            <div class="row centered">
                <h2>Idea</h2>
                <img width="50" height="50" id="loader-gif" src="assets/img/loader.gif" alt="loading...">
            </div>
        </div>

        <!-- [Page: Sponsor] -->
        <div class="container pages default_hide" id="page_sponsor">
            <div class="row centered">
                <h2>支持</h2>
                <p>PAIRS經歷數個月的開發，團隊由大學生組成，<br />各自就自身專長領域分工，從設計到開發、再到行銷，<br />大家有著共同的夢想而努力。</p>
                <img width="240" height="240" src="assets/img/care.png" alt="Care Image"/>
                <hr />
                <p>PAIRS目前為是沒有營收的網頁，團隊承擔開發與營運成本。</p>
                <p>若您喜歡這樣的平台，請支持我們讓我們走得更久，謝謝！</p>
                <form action="https://www.paypal.com/cgi-bin/webscr" method="post" target="_top">
                    <input type="hidden" name="cmd" value="_s-xclick">
                    <input type="hidden" name="hosted_button_id" value="PXMM2CH7NLLHY">
                    <input type="image" src="https://www.paypalobjects.com/zh_TW/TW/i/btn/btn_paynowCC_LG.gif" border="0" name="submit" alt="PayPal － 更安全、更簡單的線上付款方式！">
                    <img alt="" border="0" src="https://www.paypalobjects.com/zh_TW/i/scr/pixel.gif" width="1" height="1">
                </form>
            </div>
        </div>

        <!-- [Page: Privacy] -->
        <div class="container pages default_hide centered" id="page_privacy">
            <h2>隱私條款</h2>
            <div class="row pull-left">
                <h5 class="date-sub">最後修訂日期:2014年9月15日</h5>
                <p>此隱私條款為PAIRS之開發團隊(以下簡稱『本團隊』)就本團隊所提供與PAIRS相關之所有服務(以下簡稱『本服務』)中用戶資料之處理，包含其收集方式、資料之用途進行說明與規範。如果對於此隱私條款或您個人資料之用途或使用本服務所產生之影響，有任何問題或建議，請使用<a href="pairs-issue@googlegroups.com">pairs-issue@googlegroups.com</a>與我們進行聯絡。</p>

                <h3>隱私條款之注意與接受</h3>
                <p>當您使用本服務，即表示您已接受本服務之隱私條款，本團隊保有在不通知用戶的情況下，隨時修改或修訂本條款之權力。因此，請您務必經常檢視此隱私條款，以確保您了解條款內容。</p>
                <h3>資料使用目的</h3>
                <p>本團隊將依照下列目的取得、使用您的個人資料</p>
                <ol>
                    <li>為了搜尋用戶於該網站之配對資料</li>
                    <li>為了增加配對趣味性，推薦適當性配對形成之目的</li>
                    <li>為了避免用戶不當使用，及維護用戶順利使用本服務</li>
                    <li>對於本服務進行相關統計，以利改善目前或日後之本服務品質</li>
                    <li>為了處理您的問題</li>
                    <li>為了寄送活動等相關抽獎及獎品</li>
                    <li>為了其他有關本服務之重要通知，必要時進行聯絡</li>
                </ol>
                <h3>個人資料及使用方法</h3>
                <p>本團隊將於本服務中，透過下列方式取得、使用資料</p>
                <h4>a. 您提供的資料</h4>
                <p>Facebook相關資料(大頭貼照、Email信箱、公開資訊、朋友列表等等)。基於設定本服務帳號，您同意授權我們取得所有您在Facebook可合理性取得之資料，如:大頭貼照、Email信箱、公開資訊(public_info)、朋友列表 (tagglable_friends)等等。 您同意本團隊依照本條款之資料使用目的，合理性地使用您的個人資料。特別是，您同意授權我們於本服務之PLAY功能中 ，使用您的朋友列表並公開給其他用戶瀏覽，以增加配對之趣味性。</p>
                <h4>b. 服務使用資料</h4>
                <h5>一、Cookie</h5> <p>為提升您使用本服務的方便性，並維持及保護會話(Session)等安全性，將使用Cookie，藉以掌握您使用本服務之造訪次數及用戶規模、使用形態等等。您可以藉由變更瀏覽器之喜好設定來關閉cookie，但關閉該項功能後，您可能會無法使用本服務的所有內容或部分內容。</p>
                <h5>二、Log</h5>
        <p>當您使用本服務時，將自動產生儲存IP位置、瀏覽器種類等相關資料，該相關資料將用於分析用戶的使用環境或避免干擾提供正常服務之不當行為。</p>
                <h5>三、機器資訊</h5>
                <p>本服務可能取得您所使用機器的資料，如:機器作業系統、電腦名稱等相關資料，該相關資料將用於分析用戶的使用環境或避免干擾提供正常服務之不當行為。</p>
                <h3>其他資料</h3>
                <p>本團隊可能因用戶購買商品或贊助本團隊，使用付費服務等功能，取得您的信用卡資料。此外，結帳系統由交易平台辦理，本團隊不會保留任何信用卡資料。</p>
                <h3>資料之提供</h3>
                <p>原則上，未經用戶同意，本團隊不會將您的個人資料提供其他第三人。除下列情形， 司法機關或其他有權相關機關因調查或其他因素提出合理的要求，我們會根據其要求，提供相關資料。</p>
                <h3>資料之委託處理</h3>
                <p>在達到使用目的之必要範圍內，本團隊可能將自用戶所取得之全部或部分個人資料，妥託受託業者處理。此時，本團隊將會適當判斷委託業者之適當性，並於簽訂契約規定及保密義務等相關事宜。</p>
                <h3>其他網站之連結</h3>
                <p>本服務可能包含第三方網站連結。請注意，本團隊不負責其他網站所實施的隱私權方針。對於在連結網站進行的個人資料收集行為，本團隊概不負責，因此請務必參照連結網站的隱私政策。</p>
                <h3>公共範圍</h3>
                <p>例如在每對PAIRS的公開評論留言牆等公共範圍，您能公開張貼您的資料，例如留言、發表感想或評論等等。這些資料可能會被其他用戶或公司看到或搜尋到，此資料能被閱讀、收集及使用。如您的有回覆有任何電郵資料或聯絡資訊，您可能會收到其他人的回覆，我們對這些公共範圍之資料沒有任何控制權，亦不能控制任何等人士能使用您的資料，請您謹慎注意使用自發性留言功能。</p>
                <h3>退出</h3>
                <p>如果您不希望繼續收到我們的資料，或希望將您的個人資料自本服務的資料庫中刪除，請使用pairs-issue@googlegroups.com與我們進行聯絡，我們會做出適當的處理，協助您解決問題。</p>
                <hr />
            </div>
        </div>

        <!-- [Page: Term] -->
        <div class="container pages default_hide centered" id="page_term">
            <h2>使用條款</h2>
            <div class="row centered">
                <h5 class="date-sub">最後修訂日期:2014年9月15日</h5>
                <p>此使用條款(以下簡稱『本條款』)是PAIRS之開發團隊(以下簡稱『本團隊』)的服務條款，用以規範PAIRS之使用者(以下簡稱『用戶』)與本團隊的關係。透過登入或使用PAIRS軟體服務(以下簡稱『本服務』)，即代表您同意並且願意遵守本條款之內容。</p>

                <h3>條款的變更</h3>
                <p>當本團隊判斷有必要時，我們有權隨時更改本條款之內容，怒不另行通知用戶。變更後的本條款自公佈在本團隊的經營網站內適當處時起生效。如用戶於本條款變更後，仍繼續使用本服務，將視為用戶已經有效同意變更後的本條款。</p>

                <h3>帳號</h3>
                <ol>
                    <li>用戶為了使用本服務之特定功能，如:投票、增加新配對。需以Facebook帳號註冊本服務，且同意授權我們取得所有用戶在Facebook可合理性取得的資料，如:大頭貼照、Email信箱、公開資訊(public_info)、朋友列表(tagglable_friends)等等。此外，我們於本服務之PLAY功能中，使用您的朋友列表並公開給其他用戶瀏覽，以增加配對之趣味性。</li>
                    <li>用戶於使用本服務時，應自負帳號的保管與使用責任，以避免遭到盜用或非法性使用。</li>
                    <li>當本團隊認為用戶有違反本條款或其他相關法令之情事，得在不事先通知用戶的情況下，停止提供該用戶帳號的所有本服務。</li>
                </ol>

                <h3>服務提供</h3>
                <ol>
                    <li>本團隊有權在不事先通知用戶的情形下，隨時任意變更本服務的全部或部分內容，甚至中止本服務。</li>
                    <li>當用戶於使用本服務中，發生任何違法行為之情事，本團隊得接獲司法機關或是其他有權機關基於法定程序之要求，在不經用戶同意下，提供用戶之相關資料，交給相關單位作為調查與佐証之功用。</li>
                </ol>

                <h3>隱私條款</h3>
                <ol>
                    <li>本團隊依照『PAIRS隱私條款』，妥善處理用戶的隱私資料與個人資料。</li>
                    <li>本團隊將會以安全的方式管理自用戶處蒐集的資料，並對安全管理採取適當的措施。</li>
                </ol>

                <h3>免責聲明</h3>
                <ol>
                    <li>本團隊盡最大努力維護本服務的正常運作、資料安全。若本服務出現中斷或故障、資料的喪失、資料的錯誤、資料遭第三方竄改或竊取等等，因此造成用戶的損害，本團隊將不負任何賠償責任。</li>
                    <li>本團隊不承擔因重大事件或不可抗拒之外力，如:電腦伺服器受損或破壞、停電、地震等等，所對用戶造成的任何損失，對此本團隊不負任何賠償責任。</li>
                </ol>

                <hr />
            </div>
        </div>

        <section id="contact"></section>
        <div id="social">
            <div class="container">
                <div class="row centered">
                    <div class="col-lg-8 col-lg-offset-2 centered">
                        <div class="col-xs-6 col-sm-3 page-button">
                            <a href="#about"><i class="fa fa-flag"></i><br /><p class="page-icon-name">介紹</p></a>
                        </div>
                        <div class="col-xs-6 col-sm-3 page-button">
                            <a href="http://forum.pairs.cc/" target="_blank"><i class="fa fa-lightbulb-o"></i><br /><p class="page-icon-name">點子</p></a>
                        </div>
                        <div class="col-xs-6 col-sm-3 page-button">
                            <a href="#sponsor"><i class="fa fa-money"></i><br /><p class="page-icon-name">支持</p></a>
                        </div>
                        <div class="col-xs-6 col-sm-3 page-button">
                            <a href="mailto:studio-zero@googlegroups.com" target="_top"><i class="fa fa-envelope"></i><br /><p class="page-icon-name">聯絡</p></a>
                        </div>
                    </div>
                </div>
            </div><!-- /container -->
        </div><!-- /social -->

        <div id="f">
            <div class="container text-center">
                <hr>
                <div class="row">
                    <div class="col-lg-12">
                        <ul class="nav nav-pills nav-justified">
                            <li><a href="#privacy">隱私條款</a></li>
                            <li><a href="#term">使用條款</a></li>
                            <li><a href="http://studio-zero.cc" target="_blank">Studio Zero Production © 2014.</a></li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>

        <!-- Bootstrap core JavaScript
        ================================================== -->

		<!-- mycode -->

		<!-- login dialog -->
        <div class="modal fade" id="login_dialog" tabindex="-1" role="dialog" aria-hidden="true">
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header">
                        <button type="button" class="close" data-dismiss="modal" aria-hidden="true">&times;</button>
                        <h4 class="modal-title">PAIRS - 開始八卦</h4>
                    </div>
                    <div class="modal-body centered">
                        <div class="enhance">放心</div>
                        <p>登入Facebook是識別不同人以累積票數</br>我們不會主動在您牆上貼文或傳送廣告等</p>
                        <hr/>
                        <button type="button" class="btn btn-success" id="login-button"><i class="fa fa-facebook"></i>&nbsp;&nbsp;&nbsp;GO!</button>
                        <p class="minor_content">登入表示您已閱讀並同意<a id="privacy-a" data-dismiss="modal">隱私條款</a>與<a id="term-a" href="/#term" data-dismiss="modal">使用條款</a></p>
                    </div>
                </div>
            </div>
        </div>

        <!-- select user dialog -->
        <div class="modal fade" id="us-container" aria-hidden="true" data-width="760" >
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header">
                        <button type="button" class="close" data-dismiss="modal"><span aria-hidden="true">&times;</span><span class="sr-only">Close</span></button>
                        <h4 class="modal-title">建立新的PAIR</h4>
                    </div>

                    <div class="modal-body" data-spy="scroll">
                        <div class="container-fluid">
                            <div id="us-main" class="row-fluid">
                                <div class="play-user-container col-xs-5 col-sm-5 col-lg-5 centered">
                                    <img id="us-img0" src="assets/img/user.png" width="120" height="120" class="img-responsive img-circle modal-user" alt="Thumbnail Image"/>
                                    <h4 id="us-name0">User 1</h4>
                                    <input type="text" id="inputStr1" placeholder="http://..." onclick="this.value=''" autofocus/>
                                </div>
                                <div id="new-pair-heart" class="modal-heart col-xs-2 col-sm-2 col-lg-2 centered">
                                    <i class="glyphicon glyphicon-heart heartc"></i>
                                </div>
                                <div class="play-user-container col-xs-5 col-sm-5 col-lg-5 centered">
                                    <img id="us-img1" src="assets/img/user.png" width="120" height="120" class="img-responsive img-circle modal-user" alt="Thumbnail Image"/>
                                    <h4 id="us-name1">User 2</h4>
                                    <input type="text" id="inputStr2" placeholder="http://..." onclick="this.value=''"/>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="modal-footer">
                        <div class="row">
                            <div class="col-xs-3 col-sm-3 col-lg-3 centered modal-button-container"></div>
                            <div class="col-xs-6 col-sm-6 col-lg-6 centered modal-button-container">
                                <button type="button" class="btn btn-success modal-button" data-dismiss="modal" id="confirm-button">PAIR!</button>
                            </div>
                            <div class="col-xs-3 col-sm-3 col-lg-3 centered modal-button-container"></div>
                        </div>
                        <div class="row centered">
                            <p class="minor_content"><a id="usage-a">教我使用如何選擇Facebook使用者</a></p>
                        </div>
                    </div>
                </div><!-- /.modal-content -->
            </div><!-- /.modal-dialog -->
        </div><!-- /.modal -->

        <!-- select user dialog -->
        <div class="modal fade" id="help-container" aria-hidden="true" data-width="760">
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header">
                        <button type="button" class="close" data-dismiss="modal"><span aria-hidden="true">&times;</span><span class="sr-only">Close</span></button>
                        <h4 class="modal-title">認識PAIRS</h4>
                    </div>

                    <div class="modal-body" data-spy="scroll">
                        <div class="container-fluid">
                            <div class="row-fluid centered">
                                <p><b><q>你和他、她、祂的八卦平台</q></b></p>
                                <p>PAIRS 是一個開放的八卦平台<br />
                                您可以找尋與新增感興趣的配對<br />
                                投票與評論八卦<br /><br />
                                最重要的——<br />
                                看別人怎麼偷偷八卦您和<br />
                                您的男神女神！</p>
                                <img src="assets/img/intro.png" class="img-responsive" alt="usage"/>
                                <h1>Me</h1>
                                <p>與自己相關的配對列表</p>
                                <h2>Top 20</h2>
                                <p>票數最高的前20名配對</p>
                            </div>
                        </div>
                    </div>

                    <div class="modal-footer">
                        <div class="row">
                            <div class="col-xs-3 col-sm-3 col-lg-3 centered modal-button-container"></div>
                            <div class="col-xs-6 col-sm-6 col-lg-6 centered modal-button-container">
                                <button type="button" class="btn btn-success modal-button" data-dismiss="modal">我知道了</button>
                            </div>
                            <div class="col-xs-3 col-sm-3 col-lg-3 centered modal-button-container"></div>
                        </div>
                    </div>
                </div><!-- /.modal-content -->
            </div><!-- /.modal-dialog -->
        </div><!-- /.modal -->


        <!-- select user dialog -->
        <div class="modal fade" id="usage-container" aria-hidden="true" data-width="760">
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header">
                        <button type="button" class="close" data-dismiss="modal"><span aria-hidden="true">&times;</span><span class="sr-only">Close</span></button>
                        <h4 class="modal-title">如何選擇Facebook使用者</h4>
                    </div>

                    <div class="modal-body" data-spy="scroll">
                        <div class="container-fluid">
                            <div class="row-fluid">
                                <img src="assets/img/usage.png" class="img-responsive" alt="usage"/>
                            </div>
                        </div>
                    </div>

                    <div class="modal-footer">
                        <div class="row">
                            <div class="col-xs-3 col-sm-3 col-lg-3 centered modal-button-container"></div>
                            <div class="col-xs-6 col-sm-6 col-lg-6 centered modal-button-container">
                                <button type="button" class="btn btn-success modal-button" data-dismiss="modal">我知道了</button>
                            </div>
                            <div class="col-xs-3 col-sm-3 col-lg-3 centered modal-button-container"></div>
                        </div>
                    </div>
                </div><!-- /.modal-content -->
            </div><!-- /.modal-dialog -->
        </div><!-- /.modal -->

        <!-- speak loud dialog -->
        <div class="modal fade" id="speak-loud-dialog" aria-hidden="true" data-width="760">
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header">
                        <button type="button" class="close" data-dismiss="modal"><span aria-hidden="true">&times;</span><span class="sr-only">Close</span></button>
                        <h4 class="modal-title">PAIRS - 大聲講</h4>
                    </div>

                    <div class="modal-body" data-spy="scroll">
                        <div class="row centered">
                            <p>公開八卦這兩人的故事<br />
                            PAIRS寶寶會在<a href="https://facebook.com/pairs.cc/">粉絲專頁</a>幫你匿名貼文哦！</p>
                        </div>
                        <div class="row centered baobao-gossip-container">
                            <img src="assets/img/baobao-gossip.png" width="200" height="180" class="img-responsive" />
                        </div>
                    </div>

                    <div class="modal-footer">
                        <div class="row">
                            <div class="col-xs-3 col-sm-3 col-lg-3 centered modal-button-container"></div>
                            <div class="col-xs-6 col-sm-6 col-lg-6 centered modal-button-container">
                                <button type="button" class="btn btn-danger modal-button" data-dismiss="modal" onclick="speakLoud();"><i class="fa fa-volume-up"></i>&nbsp;&nbsp;&nbsp;來吧！</button>
                            </div>
                            <div class="col-xs-3 col-sm-3 col-lg-3 centered modal-button-container"></div>
                        </div>
                    </div>
                </div><!-- /.modal-content -->
            </div><!-- /.modal-dialog -->
        </div><!-- /.modal -->

        <!-- Play dialog -->
        <div class="modal fade" id="play-dialog" aria-hidden="true" data-width="760" >
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header">
                        <button type="button" class="close" data-dismiss="modal"><span aria-hidden="true">&times;</span><span class="sr-only">Close</span></button>
                        <h4 class="modal-title">PLAY - 匿名投票</h4>
                    </div>

                    <div class="modal-body" data-spy="scroll">
                        <div class="container-fluid">
                            <div id="play-main" class="row-fluid">
                                <div class="play-user-container col-xs-5 col-sm-5 col-lg-5 centered">
                                    <a id="play-link0" href="" target="_blank"><img id="play-img0" src="assets/img/user.png" width="120" height="120" class="img-responsive img-circle modal-user" alt="Thumbnail Image"/></a>
                                    <h4 id="play-name0">User 1</h4>
                                </div>
                                <div id="play-pair-heart" class="modal-heart col-xs-2 col-sm-2 col-lg-2 centered">
                                    <i class="glyphicon glyphicon-heart heartc"></i>
                                </div>
                                <div class="play-user-container col-xs-5 col-sm-5 col-lg-5 centered">
                                    <a id="play-link1" href="" target="_blank"><img id="play-img1" src="assets/img/user.png" width="120" height="120" class="img-responsive img-circle modal-user" alt="Thumbnail Image"/></a>
                                    <h4 id="play-name1">User 2</h4>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="modal-footer">
                        <div class="row-fluid">
                            <div class="col-xs-6 col-sm-6 col-lg-6 centered modal-button-container">
                                <button id="play-cancel" type="button" class="btn btn-primary modal-button">
                                    <!--<img width="30" width"20" src="assets/img/brokenheart.png"/><br />-->
                                    <p class="modal-button-content">下一對</p>
                                </button>
                            </div>
                            <div class="col-xs-6 col-sm-6 col-lg-6 centered modal-button-container">
                                <button id="play-submit" type="button" class="btn btn-danger modal-button">
                                    <!--<img width="30" width"20" src="assets/img/heart.png"/>
                                    <br />-->
                                    <p class="modal-button-content">在一起</p>
                                </button>
                            </div>
                        </div>
                    </div>
                </div><!-- /.modal-content -->
            </div><!-- /.modal-dialog -->
        </div><!-- /.modal -->



        <!-- Placed at the end of the document so the pages load faster -->
	    <script src="assets/js/bootstrap.js"></script>
        <script src="FacebookUserSelector.js"></script>
        <script>
            (function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
                    (i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
                m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
            })(window,document,'script','//www.google-analytics.com/analytics.js','ga');

            ga('create', 'UA-54567655-1', 'auto');
            ga('send', 'pageview');

        </script>
		<script src="pairs-controller.js"></script>

    </body>
</html>

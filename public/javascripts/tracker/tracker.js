/* eslint-disable */
// TODO: set time elapsed from last action and correct for it on server when you send a batch of actions together

var tracker = new function () {
  var SESSION_COOKIE = '_qtsc';
  var USER_COOKIE = '_qtuc';
  var CONSENT_COOKIE = '_qcs';
  var ACTION_COOKIE = '_qtac';
  var list = "(Googlebot\/|Googlebot-Mobile|Googlebot-Image|Googlebot-News|Googlebot-Video|AdsBot-Google([^-]|$)|AdsBot-Google-Mobile|Feedfetcher-Google|Mediapartners-Google|Mediapartners \(Googlebot\)|APIs-Google|bingbot|Slurp|[wW]get|curl|LinkedInBot|Python-urllib|python-requests|libwww|httpunit|nutch|Go-http-client|phpcrawl|msnbot|jyxobot|FAST-WebCrawler|FAST Enterprise Crawler|BIGLOTRON|Teoma|convera|seekbot|Gigabot|Gigablast|exabot|ia_archiver|GingerCrawler|webmon |HTTrack|grub.org|UsineNouvelleCrawler|antibot|netresearchserver|speedy|fluffy|bibnum.bnf|findlink|msrbot|panscient|yacybot|AISearchBot|ips-agent|tagoobot|MJ12bot|woriobot|yanga|buzzbot|mlbot|YandexBot|yandex.com\/bots|purebot|Linguee Bot|CyberPatrol|voilabot|Baiduspider|citeseerxbot|spbot|twengabot|postrank|turnitinbot|scribdbot|page2rss|sitebot|linkdex|Adidxbot|blekkobot|ezooms|dotbot|Mail.RU_Bot|discobot|heritrix|findthatfile|europarchive.org|NerdByNature.Bot|sistrix crawler|Ahrefs(Bot|SiteAudit)|fuelbot|CrunchBot|centurybot9|IndeedBot|mappydata|woobot|ZoominfoBot|PrivacyAwareBot|Multiviewbot|SWIMGBot|Grobbot|eright|Apercite|semanticbot|Aboundex|domaincrawler|wbsearchbot|summify|CCBot|edisterbot|seznambot|ec2linkfinder|gslfbot|aiHitBot|intelium_bot|facebookexternalhit|Yeti|RetrevoPageAnalyzer|lb-spider|Sogou|lssbot|careerbot|wotbox|wocbot|ichiro|DuckDuckBot|lssrocketcrawler|drupact|webcompanycrawler|acoonbot|openindexspider|gnam gnam spider|web-archive-net.com.bot|backlinkcrawler|coccoc|integromedb|content crawler spider|toplistbot|it2media-domain-crawler|ip-web-crawler.com|siteexplorer.info|elisabot|proximic|changedetection|arabot|WeSEE:Search|niki-bot|CrystalSemanticsBot|rogerbot|360Spider|psbot|InterfaxScanBot|CC Metadata Scaper|g00g1e.net|GrapeshotCrawler|urlappendbot|brainobot|fr-crawler|binlar|SimpleCrawler|Twitterbot|cXensebot|smtbot|bnf.fr_bot|A6-Indexer|ADmantX|Facebot|OrangeBot\/|memorybot|AdvBot|MegaIndex|SemanticScholarBot|ltx71|nerdybot|xovibot|BUbiNG|Qwantify|archive.org_bot|Applebot|TweetmemeBot|crawler4j|findxbot|S[eE][mM]rushBot|yoozBot|lipperhey|Y!J|Domain Re-Animator Bot|AddThis|Screaming Frog SEO Spider|MetaURI|Scrapy|Livelap[bB]ot|OpenHoseBot|CapsuleChecker|collection@infegy.com|IstellaBot|DeuSu\/|betaBot|Cliqzbot\/|MojeekBot\/|netEstate NE Crawler|SafeSearch microdata crawler|Gluten Free Crawler\/|Sonic|Sysomos|Trove|deadlinkchecker|Slack-ImgProxy|Embedly|RankActiveLinkBot|iskanie|SafeDNSBot|SkypeUriPreview|Veoozbot|Slackbot|redditbot|datagnionbot|Google-Adwords-Instant|adbeat_bot|WhatsApp|contxbot|pinterest.com.bot|electricmonk|GarlikCrawler|BingPreview\/|vebidoobot|FemtosearchBot|Yahoo Link Preview|MetaJobBot|DomainStatsBot|mindUpBot|Daum\/|Jugendschutzprogramm-Crawler|Xenu Link Sleuth|Pcore-HTTP|moatbot|KosmioBot|pingdom|PhantomJS|Gowikibot|PiplBot|Discordbot|TelegramBot|Jetslide|newsharecounts|James BOT|Barkrowler|TinEye|SocialRankIOBot|trendictionbot|Ocarinabot|epicbot|Primalbot|DuckDuckGo-Favicons-Bot|GnowitNewsbot|Leikibot|LinkArchiver|YaK\/|PaperLiBot|Digg Deeper|dcrawl|Snacktory|AndersPinkBot|Fyrebot|EveryoneSocialBot|Mediatoolkitbot|Luminator-robots|ExtLinksBot|SurveyBot|NING\/|okhttp|Nuzzel|omgili|PocketParser|YisouSpider|um-LN|ToutiaoSpider|MuckRack|Jamie's Spider|AHC\/|NetcraftSurveyAgent|Laserlikebot|Apache-HttpClient|AppEngine-Google|Jetty|Upflow|Thinklab|Traackr.com|Twurly|Mastodon|http_get|DnyzBot|botify|007ac9 Crawler|BehloolBot|BrandVerity|check_http|BDCbot|ZumBot|EZID|ICC-Crawler|ArchiveBot|^LCC |filterdb.iss.net\/crawler|BLP_bbot|BomboraBot|Buck\/|Companybook-Crawler|Genieo|magpie-crawler|MeltwaterNews|Moreover|newspaper\/|ScoutJet|(^| )sentry\/|StorygizeBot|UptimeRobot|OutclicksBot|seoscanners|Hatena|Google Web Preview|MauiBot|AlphaBot|SBL-BOT|IAS crawler|adscanner|Netvibes|acapbot|Baidu-YunGuanCe|bitlybot|blogmuraBot|Bot.AraTurka.com|bot-pge.chlooe.com|BoxcarBot|BTWebClient|ContextAd Bot|Digincore bot|Disqus|Feedly|Fetch\/|Fever|Flamingo_SearchEngine|FlipboardProxy|g2reader-bot|imrbot|K7MLWCBot|Kemvibot|Landau-Media-Spider|linkapediabot|vkShare|Siteimprove.com|BLEXBot\/|DareBoost|ZuperlistBot\/|Miniflux\/|Feedspot|Diffbot\/|SEOkicks|tracemyfile|Nimbostratus-Bot|zgrab|PR-CY.RU|AdsTxtCrawler|Datafeedwatch|Zabbix|TangibleeBot|google-xrawler|axios|Amazon CloudFront|Pulsepoint|CloudFlare-AlwaysOnline|Google-Structured-Data-Testing-Tool|WordupInfoSearch|WebDataStats|HttpUrlConnection|Seekport Crawler|ZoomBot|VelenPublicWebCrawler|MoodleBot|jpg-newsbot|outbrain|W3C_Validator|Validator\.nu|W3C-checklink|W3C-mobileOK|W3C_I18n-Checker|FeedValidator|W3C_CSS_Validator|W3C_Unicorn|Google-PhysicalWeb|Blackboard|ICBot\/|BazQux|Twingly|Rivva|Experibot|awesomecrawler|Dataprovider.com|GroupHigh\/|theoldreader.com|AnyEvent|Uptimebot|Nmap Scripting Engine|2ip.ru|Clickagy)";
  var regex = new RegExp(list, 'ig');

  this.pageData = {
    pageName: document.title || (window.location.host + window.location.pathname),
    pageType: 'page',
    language: document.documentElement.lang || 'unknown',
  };
  this.actions = [{
    actionType: 'visit',
    actionData: this.pageData.pageType + ':' + this.pageData.pageName
  }]
  this.defaultExtra = {};

  this.setPageName = function () {
    this.pageData.pageName = arguments[0].pageName;
    this.pageData.pageType = arguments[0].pageType || this.pageData.pageType;
  };

  this.setLanguage = function () {
    this.pageData.language = arguments[0].language;
  }

  this.addAction = function (action, _this) {
    _this.actions.push({
      actionType: action.actionType,
      actionData: action.actionData,
      actionBehaviour: action.actionBehaviour,
      extraData: action.extraData
    });
    return _this.actions.length;
  }

  //TODO: remove callbacks for this action, not just the action itself
  this.removeAction = function (actionId, _this) {
    _this.actions[actionId] = {};
  }

  this.triggerAction = function () {
    var consentCookieSettings = getConsentCookie();
    if (!consentCookieSettings || !consentCookieSettings.statistics) return;
    if (testBot(window.navigator.userAgent)) return;
    var pixelData = {
      actionType: encodeURIComponent(arguments[0].actionType), 
      actionData: encodeURIComponent(arguments[0].actionData), 
      extraData: JSON.parse(JSON.stringify(arguments[0].extraData || {})), 
      url: encodeURIComponent(window.location.href) 
    };
    replaceActionCookie(true, this);

    pixelData.actionId = this.actionCookie; 
    pixelData.extraData.previousActionId = this.prevActionCookie;
    loadPixel(pixelData, this);
  }

  this.deleteCookies = function(){
    document.cookie = ACTION_COOKIE + '=; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
    document.cookie = USER_COOKIE + '=; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
    document.cookie = SESSION_COOKIE + '=; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
  }

  this.getPixelData = function() {
    var consentCookieSettings = getConsentCookie();
    if (!consentCookieSettings || !consentCookieSettings.statistics || !consentCookieSettings.personalisation) return '';
    var pixelData = {
      actionType: encodeURIComponent(arguments[0].actionType), 
      actionData: encodeURIComponent(arguments[0].actionData), 
      extraData: JSON.parse(JSON.stringify(arguments[0].extraData || {})), 
      url: encodeURIComponent(window.location.href) 
    };

    pixelData.actionId = this.actionCookie; 
    pixelData.extraData.previousActionId = this.prevActionCookie;

    var params = [];
    params.push('sid=' + getSessionCookie() || this.sessionCookie);
    params.push('uid=' + getUserCookie() || this.userCookie);
    params.push('aid=' + pixelData.actionId);
    params.push('at=' + pixelData.actionType);
    params.push('ad=' + pixelData.actionData);
    params.push('ed=' + encodeURIComponent(JSON.stringify(pixelData.extraData)));
    params.push('u=' + pixelData.url);
    params.push('l=' + this.pageData.language);
    params.push('rf=' + encodeURIComponent(document.referrer));
    return params.join('&');
  }

  function testBot(userAgent) {
    regex.lastIndex = 0;
    return regex.test(userAgent);
  }

  function generateUuid() {
    return 'xxxxxxxxxxxx4xxxyxx'.replace(/[xy]/g, function (c) {
      var r = Math.random() * 16 | 0,
        v = c == 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    }) + Date.now().toString();
  }

  function createUserCookie(_this) {
    var cookieValue = getUserCookie()
    var consentCookieSettings = getConsentCookie();
    if (!consentCookieSettings || !consentCookieSettings.statistics) return;
    if (!cookieValue || cookieValue === '') {
      _this.userCookie = generateUuid();
      if (consentCookieSettings.personalisation)
        document.cookie = USER_COOKIE + '=' + _this.userCookie + ';max-age=' + 60*60*24*365 + ';path=/';
      else 
        document.cookie = USER_COOKIE + '=' + _this.userCookie + ';path=/';
    }
  }

  function createSessionCookie(_this) {
    var cookieValue = getSessionCookie()
    if (!cookieValue || cookieValue === '') {
      _this.sessionCookie = generateUuid();
      document.cookie = SESSION_COOKIE + '=' + _this.sessionCookie  + ';path=/';
    }
  }

  function getConsentCookie(_this){
    var cookieValue;
    var cookies = document.cookie.split(';');
    for (var i = 0; i < cookies.length; i++){
      if (cookies[i].trim().indexOf('_qcs') === 0){
        cookieValue=cookies[i].trim().replace('_qcs' + '=', '');
        break;
      }
    }  
    if (cookieValue){
      var cookieSettings = JSON.parse(decodeURIComponent(cookieValue));
      return cookieSettings;
    }
    return cookieValue;
  }

  function replaceActionCookie(newCookie, _this) {
    //window.onbeforeunload = deleteMyCookie;
    var cookieValue = getActionCookie();
    _this.prevActionCookie = cookieValue;
    if (_this.actionCookie && newCookie) {
      _this.prevActionCookie = _this.actionCookie;
    }
    if (!_this.actionCookie || newCookie) {
      _this.actionCookie = generateUuid();
    }
    document.cookie = ACTION_COOKIE + '=' + _this.actionCookie  + ';path=/'
  }

  function getActionCookie() {
    var cookieValue;
    var cookies = document.cookie.split(';');
    for (var i = 0; i < cookies.length; i++){
      if (cookies[i].trim().indexOf(ACTION_COOKIE) === 0){
        cookieValue=cookies[i].trim().replace(ACTION_COOKIE + '=', '');
        break;
      }
    }
    return cookieValue;
  }

  function getUserCookie() {
    //var cookieRegex = new RegExp('(?:(?:^|.*;\s*)' + USER_COOKIE + '\s*\=\s*([^;]*).*$)|^.*$')
    //var cookieValue = document.cookie.replace(cookieRegex, "$1");
    var cookieValue;
    var cookies = document.cookie.split(';');
    for (var i = 0; i < cookies.length; i++){
      if (cookies[i].trim().indexOf(USER_COOKIE) === 0){
        cookieValue=cookies[i].trim().replace(USER_COOKIE + '=', '');
        break;
      }
    }
    return cookieValue;
  }

  function getSessionCookie() {
    var cookieValue;
    var cookies = document.cookie.split(';');
    for (var i = 0; i < cookies.length; i++){
      if (cookies[i].trim().indexOf(SESSION_COOKIE) === 0){
        cookieValue=cookies[i].trim().replace(SESSION_COOKIE + '=', '');
        break;
      }
    }
    return cookieValue;
  }

  function loadPixel(pixelData, _this) {
    //removeElementsByClass('_qtpx');
    var pixel = document.createElement('img');
    var randomId = generateUuid();
    var params = [];
    params.push('r=' + randomId);
    params.push('sid=' + getSessionCookie() || _this.sessionCookie);
    params.push('uid=' + getUserCookie() || _this.userCookie);
    params.push('aid=' + pixelData.actionId);
    params.push('at=' + pixelData.actionType);
    params.push('ad=' + pixelData.actionData);
    params.push('ed=' + encodeURIComponent(JSON.stringify(pixelData.extraData)));
    params.push('u=' + pixelData.url);
    params.push('l=' + _this.pageData.language)
    params.push('rf=' + encodeURIComponent(document.referrer))

    pixel.setAttribute('src', 'http://localhost:3000/track/pixel?' + params.join('&'));
    pixel.setAttribute('height', '1');
    pixel.setAttribute('width', '1');
    pixel.setAttribute('class', '_qtpx');

    pixel.onload = function(e){
      this.parentNode.removeChild(this);
    }
    document.body.appendChild(pixel);
    console.log(pixel);
  };

  function removeElementsByClass(className) {
    var elements = document.getElementsByClassName(className);
    while (elements.length > 0) {
      elements[0].parentNode.removeChild(elements[0]);
    }
  }

  this.init = function(){
    var _this = this;
    var consentCookieSettings = getConsentCookie();
    if (!consentCookieSettings || !consentCookieSettings.statistics) return;
    window.addEventListener('beforeunload', function(){
      replaceActionCookie(false, _this);
    });

    var cookieValue = getActionCookie();
    _this.prevActionCookie = cookieValue;
    createUserCookie(_this);
    createSessionCookie(_this);

    _this.triggerAction({
      actionType: 'visit',
      actionData: _this.pageData.pageType + ':' + _this.pageData.pageName
    });
  }

  this.reInit = function() {
    var _this = this;
    this.deleteCookies();
    var consentCookieSettings = getConsentCookie();
    if (!consentCookieSettings || !consentCookieSettings.statistics) return;
    var cookieValue = getActionCookie();
    _this.prevActionCookie = cookieValue;
    createUserCookie(_this);
    createSessionCookie(_this);
  }
}
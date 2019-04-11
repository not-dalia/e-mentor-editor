# Tracker 

## Installation

Use the following code:

```javascript
var HOST = 'https://openlab.ncl.ac.uk/dokku/mentoring-editor';
var trackerActions = [];
function pushAction(action, params){
    if (typeof tracker != 'undefined'){
        tracker[action](params);
    } else {
        trackerActions.push({action: action, params: params});
    }
}
(function(){
  var s, r, t;
  r = false;
  s = document.createElement('script');
  s.type = 'text/javascript';
  s.src = HOST + '/javascripts/tracker/tracker.js';
  s.onload = s.onreadystatechange = function () {
    if (!r && (!this.readyState || this.readyState == 'complete')) {
      r = true;
      while(trackerActions && trackerActions.length > 0){
        var action = trackerActions.shift();
        tracker[action.action](action.params);
      }
    }
  };
  t = document.getElementsByTagName('script')[0];
  t.parentNode.insertBefore(s, t);
}());
```

To set page name and fire visit event:
```javascript
pushAction( 'setPageName', {pageName: pageName, pageType: pageType} );
pushAction( 'init' );
```

To trigger a different event than a visit: 
```javascript
pushAction( 'triggerAction', {actionType: actionType, actionData: actionData, extraData: { data: 'is optional' } })
```

## TODO

* Add elapsed time from load till tracker is loaded. Adjust timestamps on server when actions are received.
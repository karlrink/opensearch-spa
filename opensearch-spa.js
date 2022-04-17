
const version = '2022-04-16-0';

/* 
 * SPA (Single-Page Application)
 * https://developer.mozilla.org/en-US/docs/Glossary/SPA 
 */

const start = performance.now();

const origin = localStorage.getItem('origin');
const base64 = localStorage.getItem('base64');

var appname = document.querySelector('meta[name="application-name"]') !== null;
if (appname) {
    var appname = document.querySelector('meta[name="application-name"]').content;
}

const header    = document.querySelector('.page-header');
const container = document.querySelector('.container');
const footer    = document.querySelector('.page-footer');

const params = new URLSearchParams(location.search);

const view   = params.get('view');

async function getResponse(response) {
    if ( ! response.ok) {
        return response;
    }
    return response;
}

function Login() {

    let login_origin = window.prompt("url: ", 'https://127.0.0.1:9200');
    let login_user = window.prompt("username: ");
    let login_pass = window.prompt("password: ");
    let login_base64 = btoa(login_user + ':' + login_pass);

    localStorage.setItem('base64', login_base64);
    localStorage.setItem('origin', login_origin);

    history.pushState({page: 'login'}, "login", "?login=true");
    location.replace('?');
}

function Logout() {

    localStorage.clear();

    let html = '<a href="?login"><button type="button">Login</button></a>';
    container.innerHTML = html;

    history.pushState({page: 'logout'}, "logout", "?logout=true");
}

function viewLanding() {

    document.title = 'Landing View';

    let html = '';

    if ( ! localStorage.getItem('base64') ) {
        html += '<a href="?login"><button type="button">Login</button></a>';
    }

    header.innerHTML = `<a href="?"><button type="button">Home</button></a>`;
    container.innerHTML = html;
    footer.innerHTML = `<a href="?view=info"><button type="button">Info</button></a>`;

    history.pushState({page: 'landing'}, "landing", "?view=landing");
}


function viewMyLocation() {

    document.title = 'My Location';

    let html = '';
        html += '<button id="find-me">Show my location</button><br/>';
        html += '<p id="status"></p>';
        html += '<a id="map-link" target="_blank"></a>';

    header.innerHTML = `<a href="?"><button type="button">Home</button></a>`;
    container.innerHTML = html;
    footer.innerHTML = ``;

    document.querySelector('#find-me').addEventListener('click', geoFindMe);

    history.pushState({page: 'mylocation'}, "mylocation", "?view=mylocation");
}



function showInfo() {

    let html = '';

    for (const a in localStorage) {
        //console.log(a, ' = ', localStorage[a]);
        html += '<div>' + a + '<input type="text" value="'+ localStorage[a] +'" disabled ></div>'; 
    }

    let footer_html = '';
    footer_html += '<div><button onclick="return addLocalStore();">Add Item</button>';
    footer_html += '     <button onclick="localStorage.clear();location.reload();">Clear Storage</button>';
    footer_html += '     <button onclick="return Login();">Login</button>';
    //html += '     <a href="?"><button>Home</button></a>';
    //html += '     <a href="?view=dbs"><button>Show DataBases</button></a>';

    header.innerHTML = `<a href="?"><button type="button">Home</button></a>`;
    container.innerHTML = html;
    footer.innerHTML = footer_html;

    history.pushState({page: 'info'}, "info", "?view=info");
}

function addLocalStore() {
   const item_name  = window.prompt("name: ");
   const item_value = window.prompt("value: ");

   localStorage.setItem(item_name, item_value);

   history.pushState({page: 'addLocalStore'}, "addLocalStore", "?view=info");
}

//-----------------------------------------------------------

// https://developer.mozilla.org/en-US/docs/Web/API/Geolocation_API/Using_the_Geolocation_API
function geoFindMe() {

  const status = document.querySelector('#status');
  const mapLink = document.querySelector('#map-link');

  mapLink.href = '';
  mapLink.textContent = '';

  function success(position) {
    const latitude  = position.coords.latitude;
    const longitude = position.coords.longitude;

    status.textContent = '';
    mapLink.href = `https://www.openstreetmap.org/#map=18/${latitude}/${longitude}`;
    mapLink.textContent = `Latitude: ${latitude} °, Longitude: ${longitude} °`;
  }

  function error() {
    status.textContent = 'Unable to retrieve your location';
  }

  if(!navigator.geolocation) {
    status.textContent = 'Geolocation is not supported by your browser';
  } else {
    status.textContent = 'Locating…';
    navigator.geolocation.getCurrentPosition(success, error);
  }

}



//-----------------------------------------------------------

function router() {

    if (params.has('logout')) {
       return Logout();
    }

    if (params.has('login')) {
       return Login();
    }

    //if ( ! localStorage.getItem('origin') ) {
    //    return Login();
    //}

    //if ( ! localStorage.getItem('base64') ) {
    //    return Login();
    //}

    if ( ! params.toString()) {
        return landing();
    }

    if (params.has('view')) {

        if (view === 'info') {
            return showInfo();
        }

        if (view === 'landing') {
            return viewLanding();
        }

        if (view === 'mylocation') {
            return viewMyLocation();
        }

    }

    return landing();
}

function landing() {

    //if (origin === 'undefined' || origin === 'null') {
    //    return Login();
    //}

    if (appname === 'opensearch-spa') {
        return viewLanding();
    }
}

//-----------------------------------------------------------

window.addEventListener('popstate', function(event) {
    console.log('event popstate activated');
    history.go(-1);
});

window.addEventListener('hashchange', function(event) {
  console.log('hashchange');
});

//-----------------------------------------------------------

let run = router();

const done = performance.now() - start;

console.log(appname + ':' + done);




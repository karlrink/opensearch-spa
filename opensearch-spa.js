
const version = '2022-04-30-0';

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


async function getResponse(response) {
    if ( ! response.ok) {
        //return response;
        throw new Error(response.status + ' ' + response.statusText);
    }
    return response;
}

function Login() {

    //let login_origin = window.prompt("url: ", 'http://127.0.0.1:9200');
    let login_origin = 'https://opensearch.nationsinfocorp.com';
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

    header.innerHTML = `<a href="?"><button type="button">Home</button></a>`;
    let html = '<a href="?login"><button type="button">Login</button></a>';
    container.innerHTML = html;

    history.pushState({page: 'logout'}, "logout", "?logout=true");
}

function viewLanding() {

    document.title = 'Home';

    let html = '';

    if ( ! localStorage.getItem('base64') ) {
        html += '<a href="?login"><button type="button">Login</button></a>';
    } else {
        html += '<a href="?view=mylocation"><button type="button">MyLocation</button></a>';
        html += '<a href="?view=geosearch"><button type="button">GeoSearch</button></a>';
    }

    header.innerHTML = `<a href="?"><button type="button">Home</button></a>`;
    container.innerHTML = html;
    footer.innerHTML = `<a href="?view=info"><button type="button">Info</button></a>`;

    history.pushState({page: 'landing'}, "landing", "?view=landing");
}

// https://developer.mozilla.org/en-US/docs/Learn/Forms/Your_first_form

function viewGeoSearch() {

    document.title = 'Geo Search';

    const url = origin + "/ninfo-property/_search"
    //const url = "https://opensearch.nationsinfocorp.com/ninfo-property/_search"
    //const url = '/my-post/url'

    let html = `
    <form id="form" action="${url}" method="post">
      <br>
      <label for="latitude">latitude:</label>
      <input type="text" id="latitude" name="latitude" value="34.1895294">
      <br>
      <label for="longitude">longitude:</label>
      <input type="text" id="longitude" name="longitude" value="-118.624725">
      <br>
      <label for="distance">distance:</label>
      <input type="text" id="distance" name="distance" value="10">
      <br>
      <button type="submit">Post</button>
    </form>
    `;

    header.innerHTML = 
    `
      <a href="?"><button type="button">Home</button></a>
      <a href="?view=geosearch"><button type="button">Geo Search</button></a>
    `;

    container.innerHTML = html;
    footer.innerHTML =
    `
      <a href="?view=geosearch"><button type="button">Geo Search</button></a>
    `;


    const form = document.getElementById('form');

    window.addEventListener("load", function () {

      async function sendData() {

        //const form_data = new URLSearchParams(new FormData(formElement));
        //const form_data = new URLSearchParams();

        var form_data = {};


        for (const pair of new FormData(form)) {
            //form_data.append(pair[0], pair[1]);
            form_data[pair[0]] = pair[1];
            console.log(pair[0], pair[1]);
        }

        console.log(form_data);
        console.log(form_data['latitude']);
        console.log(form_data['longitude']);
        console.log(form_data['distance']);

        //var lat = parseFloat(form_data['latitude'])
        //var lon = parseFloat(form_data['longitude'])
        //const lat = form_data['latitude']
        //const lon = form_data['longitude']

        opensearch_data = 
        { "query": {
            "bool": {
              "filter": {
                "geo_distance": {
                  "distance": form_data['distance'] + "km",
                  "coordinate": {
                    "lat": parseFloat(form_data['latitude']),
                    "lon": parseFloat(form_data['longitude'])
                  }
                }
              }
            }
          }
        }

                    //"lat": parseFloat(form_data['latitude']),
                    //"lon": parseFloat(form_data['longitude'])
        console.log(opensearch_data);

                  // "distance": "10km",
                   // "lat": 34.17293,
                   // "lon": -118.587415

        const response = await fetch(url, {
          method: 'POST',
          headers: {
            "Content-Type": "application/json",
            "Authorization": "Basic " + base64,
          },
          body: JSON.stringify(opensearch_data),
        })
          .then(getResponse)
          .catch(err => container.innerHTML = 'ResponseError: ' + err );

        const items = await response.json()
          .catch(err => container.innerHTML = err);

        //alert(JSON.stringify(items, null, 2));
        container.innerHTML = "<pre>" + JSON.stringify(items, null, 2) + "</pre>";

      }

      // take over submit event.
      form.addEventListener("submit", function ( event ) {
        event.preventDefault();
        sendData();
      } );

    } );

    history.pushState({page: 'geosearch'}, "geosearch", "?view=geosearch");
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



function viewInfo() {

    let html = '';

    for (const a in localStorage) {
        //console.log(a, ' = ', localStorage[a]);
        html += '<div>' + a + '<input type="text" value="'+ localStorage[a] +'" disabled ></div>'; 
    }

    let footer_html = '';
    footer_html += '<div><button onclick="return addLocalStore();">Add Item</button>';
    footer_html += '     <button onclick="localStorage.clear();location.reload();">Clear Storage</button>';
    footer_html += '     <button onclick="return Login();">Login</button>';
    footer_html += '     <button onclick="return Logout();">Logout</button>';

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
// https://developer.mozilla.org/en-US/docs/Web/API/URL
// https://developer.mozilla.org/en-US/docs/Web/API/URLSearchParams

//const url = new URL(location.href);

const params = new URLSearchParams(location.search);
const view = params.get('view');

function router() {

    console.log('router');

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

    //if ( ! params.toString()) {
    //    return landing();
    //}

    //if (params.has('search')) {
    //    return Search();
    //}

    if (params.has('view')) {

        if (view === 'info') {
            return viewInfo();
        }

        if (view === 'landing') {
            return viewLanding();
        }

        if (view === 'mylocation') {
            return viewMyLocation();
        }

        if (view === 'geosearch') {
            return viewGeoSearch();
        }

    }

    return viewLanding();
}

//-----------------------------------------------------------

/*
window.addEventListener('popstate', function(event) {
    console.log('event popstate activated');
    history.go(-1);
});

window.addEventListener('hashchange', function(event) {
  console.log('hashchange');
});
*/

//-----------------------------------------------------------

let run = router();

const done = performance.now() - start;

console.log('test ' + appname + ':' + done);

// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Modules

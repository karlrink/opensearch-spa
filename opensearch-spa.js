
const version = '2022-05-04-0';

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

function addLocalStore() {
   const item_name  = window.prompt("name: ");
   const item_value = window.prompt("value: ");
   localStorage.setItem(item_name, item_value);
   history.pushState({page: 'addLocalStore'}, "addLocalStore", "?view=info");
}

function viewLanding() {

    document.title = 'Home';

    let html = '';

    if ( ! localStorage.getItem('base64') ) {
        html += '<a href="?login"><button type="button">Login</button></a>';
    } else {
        html += '<a href="?view=geosearch"><button type="button">Geo Search</button></a>';
        html += '<a href="?view=mylocation"><button type="button">My Location</button></a>';
    }

    header.innerHTML = `<a href="?"><button type="button">Home</button></a>`;
    container.innerHTML = html;
    footer.innerHTML = `<a href="?view=info"><button type="button">Info</button></a>`;

    history.pushState({page: 'landing'}, "landing", "?view=landing");
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



// https://developer.mozilla.org/en-US/docs/Learn/Forms/Your_first_form
function viewGeoSearch() {

    document.title = 'Geo Search';

    //const url = "https://opensearch.nationsinfocorp.com/ninfo-property/_search"
    const url = origin + "/ninfo-property/_search"

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

        var form_data = {};

        for (const pair of new FormData(form)) {
            form_data[pair[0]] = pair[1];
            //console.log(pair[0], pair[1]);
        }

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

        //console.log(opensearch_data);

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

//-----------------------------------------------------------

// https://developer.mozilla.org/en-US/docs/Web/API/Geolocation_API/Using_the_Geolocation_API

function viewMyLocation() {

    document.title = 'My Location';

    let html = '';
        html += '<button id="find-me">Get My Location</button><br/>';
        html += '<p id="status"></p>';
        html += '<a id="map-link" target="_blank"></a>';
        html += '<div id="geo-form"></div>';
        html += '<div id="geo-output"></div>';

    header.innerHTML = `<a href="?"><button type="button">Home</button></a>
                        <a href="?view=mylocation"><button type="button">My Location</button></a>`;
    container.innerHTML = html;
    footer.innerHTML = ``;

    document.querySelector('#find-me').addEventListener('click', geoFindMe);

    history.pushState({page: 'mylocation'}, "mylocation", "?view=mylocation");
}

function geoFindMe() {

  const status = document.querySelector('#status');
  const mapLink = document.querySelector('#map-link');
  const geoForm = document.querySelector('#geo-form');
  const geoOut = document.querySelector('#geo-output');

  mapLink.href = '';
  mapLink.textContent = '';
  geoForm.innerHTML = '';

  function success(position) {
    const latitude  = position.coords.latitude;
    const longitude = position.coords.longitude;

    status.textContent = '';
    mapLink.href = `https://www.openstreetmap.org/#map=18/${latitude}/${longitude}`;
    mapLink.textContent = `Latitude: ${latitude} °, Longitude: ${longitude} °`;

    geoForm.innerHTML = `
    <form onsubmit="submitGeoForm(event)">
      <br>
      <label for="latitude">latitude:</label>
      <input type="text" id="latitude" name="latitude" value="${latitude}">
      <br>
      <label for="longitude">longitude:</label>
      <input type="text" id="longitude" name="longitude" value="${longitude}">
      <br>
      <button type="submit">Geo Search</button>
    </form>
    `;

    history.pushState({page: 'mylocation-geo'}, "mylocation-geo", "?view=mylocation&geo=true");
  }

  function error() {
    status.textContent = 'Unable to retrieve your location';
  }

  if(!navigator.geolocation) {
    status.textContent = 'Geolocation is not supported by your browser';
  } else {
    status.textContent = 'Locating...';
    navigator.geolocation.getCurrentPosition(success, error);
  }

}

async function submitGeoForm(event) {
  
  event.preventDefault();

  const latitude = event.target['latitude'].value;
  const longitude = event.target['longitude'].value;
  //const distance = event.target['distance'].value;

  //console.log(latitude);
  //console.log(longitude);
  //console.log(distance);

/*
  opensearch_data_v1 =
  { "query": {
      "bool": {
        "filter": {
          "geo_distance": {
            "distance": distance + "km",
            "coordinate": {
              "lat": parseFloat(latitude),
              "lon": parseFloat(longitude)
            }
          }
        }
      }
    }
  }
*/

  opensearch_data =
    {
      "query": {
        "match_all": {}
      },
        "sort": [
        {
          "_geo_distance": {
            "coordinate": {
              "lat": parseFloat(latitude),
              "lon": parseFloat(longitude)
            },
            "order": "asc",
            "unit": "km",
            "mode": "min",
            "distance_type": "arc",
            "ignore_unmapped": true
          }
        }
      ]
    }

  const url = origin + "/ninfo-property/_search";

  const headers = {};
  headers['Authorization'] = 'Basic ' + base64;
  headers['Content-Type'] = 'application/json';

  const post = await fetch(url, {
    method: 'POST',
    mode: 'cors',
    headers: headers,
    body: JSON.stringify(opensearch_data)
  })
    .then(getResponse)
    .catch(err => document.write('Request Failed ', err));

  const response = await post.json();

  let htmlSegment = '';

  const hits = JSON.parse(JSON.stringify(response['hits']['hits']));

  //const sortArray = [];

  hits.forEach(item => {

      //console.log(item);
      //console.log(item['_source'].property_id);
      //console.log(item['_source'].street_address);
      //console.log(item['_source'].city);
      //console.log(item['_source'].state_or_province);
      //console.log(item['_source'].postal_code);
      //console.log(item['_source'].latitude);
      //console.log(item['_source'].longitude);

      const street_address    = item['_source'].street_address;
      const city              = item['_source'].city;
      const state_or_province = item['_source'].state_or_province;
      const postal_code       = item['_source'].postal_code;

      const latitude_2        = item['_source'].latitude;
      const longitude_2       = item['_source'].longitude;

      const haversine_distance = HaverSine(latitude,longitude,latitude_2,longitude_2).toFixed(1);

      const streetmap_href = `https://www.openstreetmap.org/#map=18/${latitude_2}/${longitude_2}`;

    //htmlSegment += street_address + ' ' + city + ' ' + state_or_province + ' ' + postal_code + '<br>';
    htmlSegment += `<div>`;
    htmlSegment += `${street_address} ${city} ${state_or_province} ${postal_code} `;
    htmlSegment += `distance: ${haversine_distance} `;
    // prevent tabnabbing with rel="noopener noreferrer" https://en.wikipedia.org/wiki/Tabnabbing
    htmlSegment += `<a href="${streetmap_href}" target="_blank" rel="noopener noreferrer">${latitude_2},${longitude_2}</a>`;
    htmlSegment += `</div>`;

  });

  document.querySelector('#geo-output').innerHTML = htmlSegment;

  history.pushState({page: 'mylocation-geo-submit'}, "mylocation-geo-submit", "?view=mylocation&geo=true&submit=true");

}

// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/sort
// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/push
// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/for...of

//-----------------------------------------------------------

// This function takes in latitude and longitude of two location 
// and returns the distance between them as the crow flies (in km)
// https://en.wikipedia.org/wiki/Haversine_formula
function HaverSine(lat1, lon1, lat2, lon2) 
{
  var R = 6371; // km
  var dLat = toRad(lat2-lat1);
  var dLon = toRad(lon2-lon1);
  var lat1 = toRad(lat1);
  var lat2 = toRad(lat2);

  var a = Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.sin(dLon/2) * Math.sin(dLon/2) * Math.cos(lat1) * Math.cos(lat2); 
  var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
  var d = R * c;
  return d;
}

// Converts numeric degrees to radians
function toRad(Value) 
{
    return Value * Math.PI / 180;
}
//alert(HaverSine(59.3293371,13.4877472,59.3225525,13.4619422).toFixed(1));

//-----------------------------------------------------------

// https://developer.mozilla.org/en-US/docs/Web/API/URL
// https://developer.mozilla.org/en-US/docs/Web/API/URLSearchParams

//const location_href = new URL(location.href);
const params = new URLSearchParams(location.search);
const view = params.get('view');

function router() {

    //console.log('router');

    if (params.has('logout')) {
        return Logout();
    }

    if (params.has('login')) {
        return Login();
    }

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

console.log(appname + ' ' + version + ' ' + done);

// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Modules

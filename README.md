
# opensearch-spa  

https://opensearch.org/  

https://developer.mozilla.org/en-US/docs/Learn/Common_questions/set_up_a_local_testing_server  
```
python3 -m http.server --directory `pwd`  
```
http://127.0.0.1:8000/  

https://github.com/opensearch-project/opensearch-js  
using credentials in the url has been deprecated  
https://developer.mozilla.org/en-US/docs/Web/HTTP/Authentication  

i'm surprised to see credentials in the url...  
https://opensearch.org/docs/latest/clients/javascript/  
```
var client = new Client({
  node: protocol + "://" + auth + "@" + host + ":" + port,
```

you can do this with pure javascript fetch,  
https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch  
```
fetch('https://127.0.0.1:9200/', {
    method: 'GET',
    headers: { Authorization: 'Basic ' + base64 }
})
    .then(response => response.json())
    .then(json => document.write(json))
    .catch(err => document.write('Request Failed', err));
```

https://developer.mozilla.org/en-US/docs/Web/CSS/Layout_cookbook  
https://developer.mozilla.org/en-US/docs/Learn/Tools_and_testing/Client-side_JavaScript_frameworks/Introduction  

Modern web applications typically do not fetch and render new HTML files — they load a single HTML shell, and continually update the DOM inside it (referred to as single page apps, or SPAs) without navigating users to new addresses on the web. Each new pseudo-webpage is usually called a view, and by default, no routing is done.

When an SPA is complex enough, and renders enough unique views, it's important to bring routing functionality into your application. People are used to being able to link to specific pages in an application, travel forward and backward in their navigation history, etc., and their experience suffers when these standard web features are broken. When routing is handled by a client application in this fashion, it is aptly called client-side routing.

It's possible to make a router using the native capabilities of JavaScript and the browser, but popular, actively developed frameworks have companion libraries that make routing a more intuitive part of the development process.


https://developer.mozilla.org/en-US/docs/Learn/Forms/Sending_forms_through_JavaScript  

---

haversine formula

```

// This function takes in latitude and longitude of two location 
// and returns the distance between them as the crow flies (in km)

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

alert(HaverSine(59.3293371,13.4877472,59.3225525,13.4619422).toFixed(1));


```

open search geo queries...  

```
POST  ninfo-property/_search
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
```

in this case _geo_distance is an api call  
```
POST  ninfo-property/_search
{
  "query": {
    "match_all": {}
  },
    "sort": [
    {
      "_geo_distance": {
        "coordinate": {
          "lat": 34.1895294,
          "lon": -118.624725
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

```



https://developer.mozilla.org/en-US/docs/Web/HTML/Element/details  



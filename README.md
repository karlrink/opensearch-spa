
# opensearch-spa


# https://opensearch.org





# https://github.com/opensearch-project/opensearch-js

using credentials in the url has been deprecated
https://developer.mozilla.org/en-US/docs/Web/HTTP/Authentication

i'm surprised to see credentials in the url...
https://opensearch.org/docs/latest/clients/javascript/
var client = new Client({
  node: protocol + "://" + auth + "@" + host + ":" + port,

you can do this with pure javascript fetch,
https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch

fetch('https://127.0.0.1:9200/', {
    method: 'GET',
    headers: { Authorization: 'Basic ' + base64 }
})
    .then(response => response.json())
    .then(json => document.write(json))
    .catch(err => document.write('Request Failed', err));





https://developer.mozilla.org/en-US/docs/Web/CSS/Layout_cookbook

# https://developer.mozilla.org/en-US/docs/Learn/Common_questions/set_up_a_local_testing_server

# python3 -m http.server --directory `pwd`

# https://developer.mozilla.org/en-US/docs/Learn/Tools_and_testing/Client-side_JavaScript_frameworks/Introduction

Modern web applications typically do not fetch and render new HTML files — they load a single HTML shell, and continually update the DOM inside it (referred to as single page apps, or SPAs) without navigating users to new addresses on the web. Each new pseudo-webpage is usually called a view, and by default, no routing is done.

When an SPA is complex enough, and renders enough unique views, it's important to bring routing functionality into your application. People are used to being able to link to specific pages in an application, travel forward and backward in their navigation history, etc., and their experience suffers when these standard web features are broken. When routing is handled by a client application in this fashion, it is aptly called client-side routing.

It's possible to make a router using the native capabilities of JavaScript and the browser, but popular, actively developed frameworks have companion libraries that make routing a more intuitive part of the development process.


// https://opensearch.org/
// https://developer.mozilla.org/en-US/docs/Learn/Forms/Sending_forms_through_JavaScript




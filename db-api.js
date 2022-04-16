
const version = '20220413-0';

/* 
 * SPA (Single-page application)
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

const db     = params.get('db');
const table  = params.get('table');
const id     = params.get('id');
const field  = params.get('field');
const column = params.get('column');
const form   = params.get('form');
const value  = params.get('value');
const view   = params.get('view');

// specific to the db-api-server, which uses python mysql.connector
// https://dev.mysql.com/doc/connectors/en/connector-python-connectargs.html
const db_api_options = [ 'X-Host', 'X-Port', 'X-Db', 'X-Raise-Warnings', 'X-Get-Warnings', 'X-Auth-Plugin',
                         'X-Pure', 'X-Unicode', 'X-Charset', 'X-Connection-Timeout' ];

//---------------------------------------------------------

async function getResponse(response) {
    if ( ! response.ok) {
        return response;
    }
    return response;
}

function Login() {

    let login_origin = window.prompt("url: ", 'http://127.0.0.1:8980');
    let login_user = window.prompt("username: ");
    let login_pass = window.prompt("password: ");
    let login_base64 = btoa(login_user + ':' + login_pass);

    let login_x_host = window.prompt("X-Host: ");

    localStorage.setItem('base64', login_base64);
    localStorage.setItem('origin', login_origin);

    localStorage.setItem('X-Host', login_x_host);

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
        html += '<a href="?login"><button type="button">Login</button></a>';

    container.innerHTML = html;
    history.pushState({page: 'landing'}, "landing", "?view=landing");

}



async function viewInventory(db='asset', table='inventory', column='sn', fields=['sn','name'], skip=0, batch=10) {

    if (origin === 'undefined' || origin === 'null') {
        return Login();
    }

    const url = origin + '/api/' + db + '/' + table + '?column='+column+'&fields='+fields+'&limit='+skip+','+batch ;

    const options = {};
    const arrayLength = db_api_options.length;
    for (let i = 0; i < arrayLength; i++) {
        let v = localStorage.getItem(db_api_options[i]);
        if (v) {
            options[ db_api_options[i] ] = v;
        }
    }
    options['Authorization'] = 'Basic ' + base64;

    const decodedString = atob(base64);
    let username = decodedString.split(":")[0];
    if (username.length === 0) {
        console.log('username is null');
        username = 'None';
    }

    let htmlErrorResponse = ' ' + origin + ' (User: ' + username + ') <a href="?login"><button type="button">Login</button></a>';

    const response = await fetch(url,  {headers: options})
        .then(getResponse)
        .catch(err => container.innerHTML = 'ResponseError: ' + err + htmlErrorResponse);

    const items = await response.json()
        .catch(err => container.innerHTML = err);

    let htmlHeader  = '';
    let htmlContent = '';
    let htmlFooter  = '';

    htmlHeader += '<div class="main-nav">';
    htmlHeader += '<div><a href="?"><button type="button">Home</button></a></div>';
    htmlHeader += '<div><a href="?form=inventory"><button type="button">Add</button></a></div>';
    htmlHeader += '<div class="push"><form>';
    htmlHeader += '<input type="search" placeholder=" Search..." name="search">';
    htmlHeader += '<button type="submit">Search</button>';
    htmlHeader += '</form></div>';
    htmlHeader += '<div><a href="?logout"><button type="button">Logout</button></a></div>';
    htmlHeader += '</div>';

    if (typeof items.length === 'undefined') {
        console.log('undefined items');
        htmlContent += JSON.stringify(items);
    } else {

        items.forEach(item => {

            let strArr = item.toString().split(",");
            let id = strArr[0];

            htmlContent    += `<div> <a href="?db=${db}&table=${table}&id=${id}">${item}</a></div>`;
            //htmlContent    += `<button onclick="putForm('${db}', '${table}', '${id}')">Replace</button>`;
            //htmlContent    += `<button onclick="questiondeleteItem('${db}', '${table}', '${id}', 'sn')">Delete</button> </div>`;
        });

    }

    const nskip = +skip + 5;
    const bskip = +skip - 5;

    if (skip > 0) {
        //console.log('skip greater than zero');
        htmlContent += `<a href="?view=inventory&skip=${bskip}&batch=${batch}"><button type="button">Back</button></a>`;
    }
    htmlContent += `<a href="?view=inventory&skip=${nskip}&batch=${batch}"><button type="button">Next</button></a>`;

    const url_table_data = origin + '/api/information_schema/tables/'+ table + '?column=TABLE_NAME&fields=TABLE_ROWS,UPDATE_TIME' ;

    const url_response = await fetch(url_table_data,  {headers: options})
        .then(getResponse)
        .catch(err => container.innerHTML = 'ResponseError: ' + err );

    const table_data = await url_response.json()
        .catch(err => container.innerHTML = err);

    //htmlFooter += `<div><p> ${table_data} </p></div><div><a href="?logout"><button type="button">Logout</button></a></div>`;
    htmlFooter += `<div><p> ${table_data} </p></div>`;

    header.innerHTML    = htmlHeader;
    container.innerHTML = htmlContent;
    footer.innerHTML    = htmlFooter;

    document.title = db +' '+ table;

    history.pushState({page: 'viewInventory ' + db + table + skip + batch + [ fields ] + column }, db + table + skip + batch + [ fields ] + column, "?view=inventory&column="+column+"&fields="+fields+"&skip="+skip+"&batch="+batch);
}



async function inventoryForm(db='asset', table='inventory') {

    /*
      custom form
      post data
    */

    const url = origin + '/api/' + db + '/' + table ;

    const options = {};
    const arrayLength = db_api_options.length;
    for (let i = 0; i < arrayLength; i++) {
        let v = localStorage.getItem(db_api_options[i]);
        if (v) {
            options[ db_api_options[i] ] = v;
        }
    }
    options['Authorization'] = 'Basic ' + base64;


    let html = '';

    html += `<div>${db}.${table}</div>  <br>`;

    //html += `<div><form method="POST" action="${url}" onsubmit="return redirect();">`;

    html += `<div><form id="form" method="POST" action="${url}" >`;

    html += `<div>`;
    html += `<input type="text" name="sn" id="sn" value="serial number" >`;
    //html += `<button type="button" onclick="toggleEnable('sn')">Toggle</button>`;
    html += `</div>`;

    html += `<div>`;
    html += `<input type="text" name="name" id="name" value="name" disabled >`;
    html += `<button type="button" onclick="toggleEnable('name')">Toggle</button>`;
    html += `</div>`;

    html += `<div>`;
    html += `<input type="text" name="description" id="description" value="description" disabled >`;
    html += `<button type="button" onclick="toggleEnable('description')">Toggle</button>`;
    html += `</div>`;

    html += `<div>`;
    html += `<input type="text" name="value" id="value" value="value" disabled >`;
    html += `<button type="button" onclick="toggleEnable('value')">Toggle</button>`;
    html += `</div>`;

    html += `<div>`;
    html += `<input type="text" name="note" id="note" value="note" disabled >`;
    html += `<button type="button" onclick="toggleEnable('note')">Toggle</button>`;
    html += `</div>`;

    html += `<div>`;
    html += `<input type="text" name="json" id="json" value="json" disabled >`;
    html += `<button type="button" onclick="toggleEnable('json')">Toggle</button>`;
    html += `</div>`;

    //html += `<div><input type="password" name="credentials" id="credentials" value="${base64}"></div>`;
    html += `<div><input type="hidden" name="credentials" id="credentials" value="${base64}"></div>`;

    html += `<div><input type="submit" value="post"></div>`;

    //html += `<a href="?view=inventory"><button type="button">Inventory</button></a> </div>`;

    html += `</form></div>`;

    header.innerHTML = `<a href="?"><button type="button">Home</button></a>`;
    container.innerHTML = html;
    footer.innerHTML = `<p >  </p>`;

    //const form = document.querySelector('#form');
    const form = document.getElementById('form');

    window.addEventListener("load", function () {

      async function sendData() {

        //const data = new URLSearchParams(new FormData(formElement));
        const data = new URLSearchParams();
        for (const pair of new FormData(form)) {
            data.append(pair[0], pair[1]);
            //console.log(pair[0], pair[1]);
        }

        const response = await fetch(url, {
          method: 'POST',
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
          body: data,
        })
          .then(getResponse)
          .catch(err => container.innerHTML = 'ResponseError: ' + err );

        const items = await response.json()
          .catch(err => container.innerHTML = err);

        alert(JSON.stringify(items, null, 2));
      }

      // take over submit event.
      form.addEventListener("submit", function ( event ) {
        event.preventDefault();
        sendData();
      } );

    } );

    document.title = 'inventory form post ' + db +' '+ table;

    history.pushState({page: 'inventory' + db + table}, db + table, "?db=" + db + "&table=" + table + "&form=inventory" );

}
// https://developer.mozilla.org/en-US/docs/Learn/Forms/Sending_forms_through_JavaScript

function showInfo() {

    let html = '';

    for (const a in localStorage) {
        //console.log(a, ' = ', localStorage[a]);
        html += '<div>' + a + '<input type="text" value="'+ localStorage[a] +'" disabled ></div>'; 
    }

    html += '<hr>';
    html += '<div><button onclick="return addLocalStore();">Add Item</button>';
    html += '     <button onclick="localStorage.clear();location.reload();">Clear Storage</button>';
    html += '     <button onclick="return Login();">Login</button>';
    //html += '     <a href="?"><button>Home</button></a>';
    //html += '     <a href="?view=dbs"><button>Show DataBases</button></a>';
    html += '</div>';

    header.innerHTML = `<a href="?"><button type="button">Home</button></a>`;
    container.innerHTML = html;
    footer.innerHTML = ``;

    history.pushState({page: 'info'}, "info", "?view=info");
}

function addLocalStore() {
   const item_name  = window.prompt("name: ");
   const item_value = window.prompt("value: ");

   localStorage.setItem(item_name, item_value);

   history.pushState({page: 'addLocalStore'}, "addLocalStore", "?view=info");
}


async function showDBs() {

    const url = origin + '/api';

    const options = {};
    const arrayLength = db_api_options.length;
    for (let i = 0; i < arrayLength; i++) {
        const v = localStorage.getItem(db_api_options[i]);
        //console.log('v ' + v);
        // if not null, use it
        if (v) {
            //console.log(db_api_options[i] + ' ' + v);
            options[ db_api_options[i] ] = v;
        }

    }

    options['Authorization'] = 'Basic ' + base64;

    //if 'X-Host' in options:
    //    options['X-Host'] = 

    const decodedString = atob(base64);
    let username = decodedString.split(":")[0];
    if (username.length === 0) {
        //console.log('username is null');
        username = 'None';
    }

    let htmlErrorResponse = ' ' + origin + ' (User: ' + username + ') <a href="?login"><button type="button">Login</button></a>';

    //let response = await fetch(url, {headers:{Authorization: 'Basic ' + base64, 'X-Host': '192.168.1.197'}})
    const response = await fetch(url,  {headers: options})
        .then(getResponse)
        .catch(err => container.innerHTML = 'ResponseError: ' + err + htmlErrorResponse);

    const items = await response.json()
        .catch(err => container.innerHTML = err);

    let html = '';

    if (typeof items.length === 'undefined') {
        console.log('undefined items');
        html += JSON.stringify(items);
    } else {

        items.forEach(item => {
            //let htmlSegment = `<div> <button onclick="showTables('${item}')">${item}</button> </div>`;
            let htmlSegment = `<div> <a href="?db=${item}">${item}</a></div>`;
            html += htmlSegment;
        }); 

    }

    let html_footer = '';
    html_footer += '<div><button onclick="showInfo();location.reload();">Info</button>';
    html_footer += '<button onclick="localStorage.clear();location.reload();">Clear</button></div>';

    header.innerHTML = `<a href="?"><button type="button">Home</button></a>`;
    container.innerHTML = html;
    footer.innerHTML = html_footer;

    document.title = 'show databases';

    history.pushState({page: 'dbs'}, "dbs", "?view=dbs");
}

async function showTables(db) {

    const url = origin + '/api/' + db ;

    const options = {};

    const arrayLength = db_api_options.length;
    for (let i = 0; i < arrayLength; i++) {
        let v = localStorage.getItem(db_api_options[i]);
        if (v) {
            options[ db_api_options[i] ] = v;
        }
    }

    options['Authorization'] = 'Basic ' + base64;

    const response = await fetch(url,  {headers: options})
        .then(getResponse)
        .catch(err => document.write('Request Failed ', err));

    const items = await response.json();

    let html = '';
    items.forEach(item => {
        let htmlSegment = `<div> <a href="?db=${db}&table=${item}">${item}</a> `;
        htmlSegment    += `      <a href="?form=post&db=${db}&table=${item}"><button>Insert</button></a> </div>`;
        html += htmlSegment;
    });

    header.innerHTML = `<a href="?"><button type="button">Home</button></a>`;
    container.innerHTML = html;

    document.title = db;

    history.pushState({page: db}, db, "?db=" + db);
}


async function listALLItems(db, table) {

    //let url = origin + '/api/' + db + '/' + table + "?limit=100" ;
    const url = origin + '/api/' + db + '/' + table + "?query=true" ;

    const options = {};

    const arrayLength = db_api_options.length;
    for (let i = 0; i < arrayLength; i++) {
        let v = localStorage.getItem(db_api_options[i]);
        if (v) {
            options[ db_api_options[i] ] = v;
        }
    }

    options['Authorization'] = 'Basic ' + base64;

    const response = await fetch(url,  {headers: options})
        .then(getResponse)
        .catch(err => document.write('Request Failed ', err));

    const items = await response.json();

    let html = '';
    items.forEach(item => {

        let strArr = item.toString().split(",");
        let id = strArr[0];

        let htmlSegment = `<div> <a href="?db=${db}&table=${table}&id=${id}">${item}</a> `;
        htmlSegment    += `<button onclick="putForm('${db}', '${table}', '${id}')">Replace</button>`;
        //htmlSegment    += `<button onclick="deleteItem('${db}', '${table}', '${id}')">Delete</button> </div>`;
        htmlSegment    += `<button onclick="questiondeleteItem('${db}', '${table}', '${id}')">Delete</button> </div>`;
        html += htmlSegment;
    });

    header.innerHTML = `<a href="?"><button type="button">Home</button></a>`;
    container.innerHTML = html;
    footer.innerHTML = `<a href="?form=post&db=${db}&table=${table}"><button>Insert</button></a>`;

    document.title = db +' '+ table;

    history.pushState({page: 'ListAllItems' + db + table}, 'ListAllItems' + db + table, "?db=" + db + "&table=" + table);
}

async function listItems(db, table, column='id', fields=['id'], skip=0, batch=10 ) {

    const url = origin + '/api/' + db + '/' + table + '?column='+column+'&fields='+fields+'&limit='+skip+','+batch ;

    const options = {};
    const arrayLength = db_api_options.length;
    for (let i = 0; i < arrayLength; i++) {
        let v = localStorage.getItem(db_api_options[i]);
        if (v) {
            options[ db_api_options[i] ] = v;
        }
    }
    options['Authorization'] = 'Basic ' + base64;

    const decodedString = atob(base64);
    let username = decodedString.split(":")[0];
    if (username.length === 0) {
        console.log('username is null');
        username = 'None';
    }

    let htmlErrorResponse = ' ' + origin + ' (User: ' + username + ') <a href="?login"><button type="button">Login</button></a>';


    /* get fields */
    const fields_url = origin + '/api/' + db + '/' + table ;

    const fields_response = await fetch(fields_url, {headers: options})
        .then(getResponse)
        .catch(err => container.innerHTML = 'ResponseError: ' + err + htmlErrorResponse);

    const fields_json = await fields_response.json();
    const field_columns = {};

    fields_json.forEach(item => {

        let strArr = item.toString().split(",");

        let field_name = strArr[0];
        let field_type = strArr[1];
        let field_null = strArr[2];
        let field_key  = strArr[3];
        let field_default = strArr[4];
        let field_extra = strArr[5];

        let disabled = '';

        if (field_extra === 'auto_increment') {
            disabled = 'disabled';
        }

        if (field_default === 'current_timestamp()') {
            disabled = 'disabled';
        }

        field_columns[field_name] = disabled;

    });

    /* working on right here */

    const response = await fetch(url,  {headers: options})
        .then(getResponse)
        .catch(err => container.innerHTML = 'ResponseError: ' + err + htmlErrorResponse);

    const items = await response.json()
        .catch(err => container.innerHTML = err);

    let htmlContent = '';

    if (typeof items.length === 'undefined') {
        console.log('undefined items');
        htmlContent += JSON.stringify(items);
    } else {

        items.forEach(item => {

            let strArr = item.toString().split(",");
            let id = strArr[0];

            let htmlSegment = `<div> <a href="?db=${db}&table=${table}&id=${id}">${item}</a> `;
            htmlSegment    += `<button onclick="putForm('${db}', '${table}', '${id}')">Replace</button>`;
            //htmlSegment    += `<button onclick="deleteItem('${db}', '${table}', '${id}')">Delete</button> </div>`;
            htmlSegment    += `<button onclick="questiondeleteItem('${db}', '${table}', '${id}')">Delete</button> </div>`;
            htmlContent += htmlSegment;
        });
    }

    let htmlHeader = '';
    htmlHeader += `<a href="?"><button type="button">Home</button></a>`;
    htmlHeader += `<a href="?form=post&db=${db}&table=${table}"><button>Insert</button></a>`;

    const nskip = +skip + 5;
    const bskip = +skip - 5;

    if (skip > 0) {
        //console.log('skip greater than zero');
        htmlContent += `<a href="?db=${db}&table=${table}&column=${column}&fields=${fields}&skip=${bskip}&batch=${batch}"><button type="button">Back</button></a>`;
    }
    htmlContent += `<a href="?db=${db}&table=${table}&column=${column}&fields=${fields}&skip=${nskip}&batch=${batch}"><button type="button">Next</button></a>`;

    const url_table_data = origin + '/api/information_schema/tables/'+ table + '?column=TABLE_NAME&fields=TABLE_ROWS,UPDATE_TIME' ;

    const url_response = await fetch(url_table_data,  {headers: options})
        .then(getResponse)
        .catch(err => container.innerHTML = 'ResponseError: ' + err );

    const table_data = await url_response.json()
        .catch(err => container.innerHTML = err);

    let htmlFooter = '';
    htmlFooter +=`<div><p> ${table_data} </p></div>`;

    header.innerHTML = htmlHeader;
    container.innerHTML = htmlContent;
    footer.innerHTML = htmlFooter;

    document.title = db +' '+ table;

    console.log('listItems');

    //history.pushState({page: db + table}, db + table, "?db=" + db + "&table=" + table);
    history.pushState({page: 'listItems ' + db + table + skip + batch + [ fields ] + column }, 'listItems' + db + table + skip + batch + [ fields ] + column, "?db="+db+"&table="+table+"&column="+column+"&fields="+fields+"&skip="+skip+"&batch="+batch);
}


async function questiondeleteItem(db, table, id, column='id') {

    const question = window.prompt("Are you sure?  Please type " + id );

    if (question === id) {
        console.log('delete ' + id );
        deleteItem(db, table, id, column);
    } else {

        let html = '<div>Bail</div>';

        container.innerHTML = html;

        document.title = 'Bail ' + db + ' ' + table + ' ' + id ;

        history.pushState({page: 'bail'+db+table+id}, db, "?db=" + db + "&table=" + table + "&id=" + id + "&bail=True");
    }

}

async function deleteItem(db, table, id, column=None) {

    //let url = origin + '/api/' + db + '/' + table + '/' + id + '?column=' + first_field ;

    console.log('column is ' + column);

    //const url = origin + '/api/' + db + '/' + table + '/' + id  ;

    const url = origin + '/api/' + db + '/' + table + '/' + id + '?column=' + column ;

    const options = {};

    const arrayLength = db_api_options.length;
    for (let i = 0; i < arrayLength; i++) {
        let v = localStorage.getItem(db_api_options[i]);
        if (v) {
            options[ db_api_options[i] ] = v;
        }
    }
    options['Authorization'] = 'Basic ' + base64;

    const response = await fetch(url,  {method:'DELETE', headers: options})
        .then(getResponse)
        .catch(err => document.write('Request Failed ', err));

    let html = '';

    if ( ! response.ok) {
        const json = await response.json();
        html += JSON.stringify(json);
        container.innerHTML = html;
        history.pushState({page: db + table + id +'deleted'}, db + table + id, "?db=" + db + "&table=" + table + "&id=" + id + "&deleted=False");
    }

    //const json = await response.json();
    //html = JSON.stringify(json);
    //console.log(response.ok);
    //html += '<hr><a href="?db='+db+'&table='+table+'">db.table</a>';
    //document.title = db +' '+ table +' '+ id + 'deleted';
    //history.pushState({page: db + table + id +'deleted'}, db + table + id, "?db=" + db + "&table=" + table + "&id=" + id + "&deleted=True");
    location.replace('?view=inventory');
}

async function showRow(db, table, id) {

    const fields_url = origin + '/api/' + db + '/' + table ;

    const options = {};

    const arrayLength = db_api_options.length;
    for (let i = 0; i < arrayLength; i++) {
        let v = localStorage.getItem(db_api_options[i]);
        if (v) {
            options[ db_api_options[i] ] = v;
        }
    }

    options['Authorization'] = 'Basic ' + base64;

    const fields_response = await fetch(fields_url,  {headers: options})
        .then(getResponse)
        .catch(err => document.write('Request Failed ', err));

    const fields = await fields_response.json();

    //const columns = [];
    const fieldList = [];

    fields.forEach(item => {
        let strArr = item.toString().split(",");
        let field_name = strArr[0];
        fieldList.push(field_name);
    });

    const first_field = fieldList[0];

    //let items_url = origin + '/api/' + db + '/' + table + '/' + id + '?column=Host' ;
    const items_url = origin + '/api/' + db + '/' + table + '/' + id + '?column=' + first_field ;

    const items_response = await fetch(items_url,  {headers: options})
        .then(getResponse)
        .catch(err => document.write('Request Failed ', err));

    let items = await items_response.json();

    let html = '';
    let count = 0;

    items.forEach(item => {

        let item_field = fieldList[count];

        let htmlSegment = `<div>${item_field}</div>`;
        htmlSegment    += `<div><input value="${item}" disabled > <a href="?db=${db}&table=${table}&id=${id}&field=${item_field}&column=${first_field}&value=${item}">edit</a> </div>`;

        html += htmlSegment;
        count++;
    });


    header.innerHTML = `<a href="?"><button type="button">Home</button></a>`;
    container.innerHTML = html;
    footer.innerHTML = `<button onclick="questiondeleteItem('${db}', '${table}', '${id}', 'sn')">Delete</button> </div>`;

    document.title = db +' '+ table +' '+ id;

    history.pushState({page: db + table + id}, db + table + id, "?db=" + db + "&table=" + table + "&id=" + id);
}

async function submitpatchForm(event){

    event.preventDefault();

    const key_ = document.getElementById('patch').name;

    const val_ = event.target[key_].value;

    const strTxt = '{ "' + key_ + '" : "' + val_ + '" }';

    const data = JSON.parse(strTxt);

    //let url = origin + '/api/' + db + '/' + table + '/' + id ;
    const url = origin + '/api/' + db + '/' + table + '/' + id + '?column=' + column ;

    const options = {};

    const arrayLength = db_api_options.length;
    for (let i = 0; i < arrayLength; i++) {
        let v = localStorage.getItem(db_api_options[i]);
        if (v) {
            options[ db_api_options[i] ] = v;
        }
    }

    options['Authorization'] = 'Basic ' + base64;
    options['Content-Type'] = 'application/json';
    options['Accept'] = 'application/json';

    const patch = await fetch(url, {
                               method: 'PATCH',
                               mode: 'cors',
                               headers: options,
                               body: JSON.stringify(data)
                               })
                          .then(getResponse)
                          .catch(err => document.write('Request Failed ', err));

    const response = await patch.json();

    html = JSON.stringify(response);

    html += '<hr><a href="?db='+db+'&table='+table+'&id='+id+'">'+id+'</a>';

    container.innerHTML = html;

    document.title = db +' '+ table +' '+ id + ' ' + column;

    history.pushState({page: db + table + id + column}, db + table + id + column, "?db=" + db + "&table=" + table + "&id=" + id + "&column=" + column + "&patch=True");
}

async function patchForm(db, table, id, field, value) {

    let html = '<div>' + field + '</div>';

    html += '<form onsubmit="submitpatchForm(event)">';
    html += '<input type="text" name="' + field + '" id="patch" value="' + value + '">';
    html += '<input type="submit" value="patch"></form>';

    header.innerHTML = `<a href="?"><button type="button">Home</button></a>`;
    container.innerHTML = html;

    document.title = 'form patch ' + db +' '+ table +' '+ id +' ' + field ;

    history.pushState({page: 'patch form ' + db + table + id}, db + table + id, "?db=" + db + "&table=" + table + "&id=" + id + "&field=" + field + "&form=patch");
}

async function postForm(db, table) {

    /*
      get table fields
      create form
      post data
    */

    const fields_url = origin + '/api/' + db + '/' + table ;

    const options = {};

    const arrayLength = db_api_options.length;
    for (let i = 0; i < arrayLength; i++) {
        let v = localStorage.getItem(db_api_options[i]);
        if (v) {
            options[ db_api_options[i] ] = v;
        }
    }

    options['Authorization'] = 'Basic ' + base64;

    const fields_response = await fetch(fields_url, {headers: options})
        .then(getResponse)
        .catch(err => document.write('Request Failed ', err));
    const fields = await fields_response.json();

    const columns = {};

    fields.forEach(item => {

        let strArr = item.toString().split(",");

        let field_name = strArr[0];
        let field_type = strArr[1];
        let field_null = strArr[2];
        let field_key  = strArr[3];
        let field_default = strArr[4];
        let field_extra = strArr[5];

        let disabled = '';

        if (field_extra === 'auto_increment') {
            disabled = 'disabled';
        }

        if (field_default === 'current_timestamp()') {
            disabled = 'disabled';
        } 

        columns[field_name] = disabled;

    });

    let html = '<div>'+db+'.'+table+'</div>';
    let htmlSegment = `<div><form method="POST" action="${fields_url}">`;

    for (const [item, val] of Object.entries(columns)) {
        htmlSegment += `<div>`;
        htmlSegment += `<input type="text" name="${item}" id="${item}" value="${item}" ${val} >`;
        htmlSegment += `<button type="button" onclick="toggleEnable('${item}')">Toggle</button>`;
        htmlSegment += `</div>`;
    }

    htmlSegment += `<div>credentials</div>`;
    htmlSegment += `<div><input type="password" name="credentials" id="credentials" value="${base64}"></div>`;
    htmlSegment += `<div><input type="submit" value="post"></div>`;
    htmlSegment += `</form></div>`;

    html += htmlSegment

    container.innerHTML = html;

    document.title = 'form post ' + db +' '+ table;

    history.pushState({page: db + table}, db + table, "?db=" + db + "&table=" + table + "&form=post" );

}


async function putForm(db, table, id) {

    /*
      get table fields
      get item (existing record data)
      create form
      put data
    */

    let fields_url = origin + '/api/' + db + '/' + table ;

    const options = {};

    const arrayLength = db_api_options.length;
    for (let i = 0; i < arrayLength; i++) {
        let v = localStorage.getItem(db_api_options[i]);
        if (v) {
            options[ db_api_options[i] ] = v;
        }
    }

    options['Authorization'] = 'Basic ' + base64;

    const fields_response = await fetch(fields_url, {headers: options})
        .then(getResponse)
        .catch(err => document.write('Request Failed ', err));

    const fields = await fields_response.json();

    const columns = [];

    fields.forEach(item => {
        let strArr = item.toString().split(",");
        let field_name = strArr[0];
        columns.push(field_name);
    });

    const first_field = columns[0];

    const items_url = origin + '/api/' + db + '/' + table + '/' + id + '?column=' + first_field ;

    const items_response = await fetch(items_url, {headers: options})
        .then(getResponse)
        .catch(err => document.write('Request Failed ', err));

    const items = await items_response.json();

    const dict = {};

    count=0;
    items.forEach(item => {

        const column = columns[count];

        dict[column] = item;

        count++;
    });

    let html = '<div>put '+db+'.'+table+'</div>';
    let htmlSegment = `<div><form id="formPut" >`;

    for(const key in dict) {

        htmlSegment += `<div>`;

        htmlSegment += `<div>${key}</div>`;
        htmlSegment += `<input type="text" name="${key}" id="${key}" value="${dict[key]}" disabled >`;
        htmlSegment += `<button type="button" onclick="toggleEnable('${key}')">Toggle</button>`;

        htmlSegment += `</div>`;

    }

    htmlSegment += `<div>credentials</div>`;
    //htmlSegment += `<div><input type="password" name="credentials" id="credentials" value="${base64}" ></div>`;
    htmlSegment += `<div><input type="password" name="credentials" id="credentials" value="${base64}"></div>`;

    htmlSegment += `<div><input type="submit" name="submit" id="submit" value="put" ></div>`;

    htmlSegment += `</form></div>`;

    html += htmlSegment

    container.innerHTML = html;

    formPut.onsubmit = async (e) => {

        e.preventDefault();

        console.log('formPut'); 

        const elements = document.getElementsByTagName("input");

        const putDict = {};
        for (let i = 0; i < elements.length; i++) {

            const textbox = document.getElementById(elements[i].name);

            if ( ! textbox.disabled) {

                if (elements[i].name == 'submit') {
                    continue;
                }
                putDict[elements[i].name] = elements[i].value;
            }
        }

        const put_url = origin + '/api/' + db + '/' + table ;
   
        // add header content-type for put method
        options['Content-Type'] = 'application/json';

        const response = await fetch(put_url, {
                method: 'PUT',
                mode: 'cors',
                headers: options,
                body: JSON.stringify(putDict)
        });

        const result = await response.json(putDict);

        let html = JSON.stringify(result);

        container.innerHTML = html;

        document.title = 'form put ' + db +' '+ table + ' done';

        history.pushState({page: db + table}, db + table, "?db=" + db + "&table=" + table + "&id=" + id + "&form=put&done=True" );
        
    };

    document.title = 'form put ' + db +' '+ table;

    history.pushState({page: db + table}, db + table, "?db=" + db + "&table=" + table + "&id=" + id + "&form=put" );

}

function toggleEnable(id) {

    const textbox = document.getElementById(id);

    if (textbox.disabled) {
        document.getElementById(id).disabled = false;
    } else {
        document.getElementById(id).disabled = true;
    }
}


function router() {

    if (params.has('logout')) {
       return Logout();
    }

    if (params.has('login')) {
       return Login();
    }

    if ( ! localStorage.getItem('origin') ) {
        return Login();
    }

    if ( ! localStorage.getItem('base64') ) {
        return Login();
    }

    if ( ! params.toString()) {
        return landing();
        //return viewInventory();
    }

    if (params.has('view')) {

        if (view === 'info') {
            return showInfo();

        } else if (view === 'inventory') {

            let column = 'sn';
            let skip = 0;                 
            let batch = 5;
            let fields = [ 'sn', 'name' ];

            if (params.has('skip')) {
                skip = params.get('skip');
            }

            if (params.has('batch')) {
                batch = params.get('batch');
            }

            if (params.has('fields')) {
                fields = params.get('fields');
            }

            if (params.has('column')) {
                column = params.get('column');
            }

            return viewInventory('asset', 'inventory', column, fields, skip, batch);
            //async function viewInventory(db='asset', table='inventory', column='sn', fields=['sn','name'], skip=0, batch=10) {

        } else {
            //return viewInventory();
            return landing();
        }
    }

    if (params.has('form')) {

        if (form === 'post') {
            return postForm(db, table);

        } else if (form === 'put') {
            return putForm(db, table, id);

        } else if (form === 'patch') {
            return patchForm(db, table, id, field, value);

        } else if (form === 'inventory') {
            return inventoryForm();
        }


    } else if (params.has('db') && params.has('table') && params.has('id') && params.has('field') && params.has('value') ) {
        return patchForm(db, table, id, field, value);

    } else if (params.has('db') && params.has('table') && params.has('id')) {
        return showRow(db, table, id);

    } else if (params.has('db') && params.has('table')) {
        //return listItems(db, table);

            let column = 'id';
            let skip = 0;
            let batch = 10;
            let fields = [ 'id' ];

            if (params.has('skip')) {
                skip = params.get('skip');
            }

            if (params.has('batch')) {
                batch = params.get('batch');
            }

            if (params.has('fields')) {
                fields = params.get('fields');
            }

            if (params.has('column')) {
                column = params.get('column');
            }

        return listItems(db, table, column, fields, skip, batch);

    } else if (params.has('db')) {
        return showTables(db);

    } 

    return landing();
    //return viewInventory();
}

function landing() {
    if (origin === 'undefined' || origin === 'null') {
        return Login();
    }
    if (appname === 'db-api-inventory') {
        return viewInventory();
    }
    if (appname === 'db-api-hrms') {
        return viewLanding();
    }
    return showDBs();
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

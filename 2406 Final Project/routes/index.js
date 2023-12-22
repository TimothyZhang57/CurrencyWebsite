const url = require('url')
const fs = require('fs')
const sqlite3 = require('sqlite3').verbose() //verbose provides more detailed stack trace
const db = new sqlite3.Database('data/CurrencyDatabase')
//Uses handlebars to render the main page for the website
exports.index = function (request, response) {
  response.render('index', {
    title: 'Convert Your Currency', Register: 'Register', UserName: 'Username', Password: 'Password', RegisterButton: 'Register/Sign In', Convert: 'Convert Your Currency', Amount: 'Please enter the amount of money you have',
    CurrencyCode: 'Please enter the currency that you have it in', SaveButton: 'Save', CheckButton: 'Check Balance', DesiredCurrency: 'Please enter the currency that you want it to be converted to', ConvertButton: 'Convert',
    ConvertSaved: 'Convert Balance'
  });
}
//Uses handlebars to render the users for the website
exports.users = function (request, response) {
  db.all("SELECT username, password, amount, code, role FROM user", function (err, rows) {
    response.render('users', { title: 'Users:', userEntries: rows })
  });
}
//Middle ware for authenicating the user
exports.authenticate = function (request, response, next) {
  var auth = request.headers.authorization;
  if (!auth) {
    response.setHeader('WWW-Authenticate', 'Basic realm="need to login"');
    response.writeHead(401, { 'Content-Type': 'text/html' });
    console.log('No authorization found, send 401.');
    response.end();
  }
  else {
    //Gets the information entered by the user
    var tmp = auth.split(' ');
    var buf = Buffer.from(tmp[1], 'base64');
    var plain_auth = buf.toString();
    var credentials = plain_auth.split(':');     
    var username = credentials[0];
    var password = credentials[1];
    var authorized = false;
    //checks if the information allows the user to be authorized
    db.all("SELECT username, password, role FROM user", function (err, rows) {
      for (var i = 0; i < rows.length; i++) {
        if (rows[i].username == username & rows[i].password == password && rows[i].role === 'admin') authorized = true;
      }
      if (authorized == false) {
        response.setHeader('WWW-Authenticate', 'Basic realm="need to login"');
        response.writeHead(401, { 'Content-Type': 'text/html' });
        console.log('No authorization found, send 401.');
        response.end();
      }
      else
        next();
    });
  }
}
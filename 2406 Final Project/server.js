const https = require('https')
const express = require('express')
const path = require('path')
const fs = require('fs')
const routes = require('./routes/index')
const bodyParser = require('body-parser');
const PORT = process.env.PORT || 3000 //allow environment variable to possible set PORT
const app = express()
const sqlite3 = require('sqlite3').verbose() //verbose provides more detailed stack trace
const db = new sqlite3.Database('data/CurrencyDatabase')
var favicon = require('serve-favicon');
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');
app.use(express.static(__dirname + '/public'))
app.use(bodyParser.urlencoded({ extended: false }));
app.use(favicon(path.join(__dirname, 'public', 'Icon.ico')));
//Handles get requests for the currency conversion 
app.get('/currency', (request, response) => {
	let userCurrency = request.query.currency;
	let convertCurrency = request.query.desiredCurrency;
	userCurrency = userCurrency.toLowerCase();
	convertCurrency = convertCurrency.toLowerCase();
	//Checks if information was entered
	if (!userCurrency||!convertCurrency) {
		response.json({ message: 'Please enter a valid currency' })
		return
	}
	//Sets the options for the api request
	const options = {
		"hostname": 'cdn.jsdelivr.net',
		"port": null,
		"path": `/gh/fawazahmed0/currency-api@1/latest/currencies/${userCurrency}/${convertCurrency}.json`,
		"method": "GET",
		"headers": {
			"useQueryString": true
		}
	}
	//Performs the api rquest and gets the data and sends it back to user
	https.request(options, function (apiResponse) {
		let currencyData = ''
		apiResponse.on('data', function (chunk) {
			currencyData += chunk
		})
		apiResponse.on('end', function () {
			response.contentType('application/json').json(JSON.parse(currencyData))
		})
	}).end()
})
//Handles get result to convert the saved data
app.get('/saved', (request, response) => {
	let username = request.query.username;
	let code;
	let amount;
	let convertCurrency = request.query.desiredCurrency;
	convertCurrency = convertCurrency.toLowerCase();
	//Checks if the user entered valid information 
	let status = 0;
	if (!username) {
		status = 0;
	}
	if (!convertCurrency) {
		status = 2;
	}
	convertCurrency = convertCurrency.toLowerCase();
	//Goes through the database and finds the user and gets their information
	if (username && convertCurrency) {
		db.all("SELECT username, amount, code FROM user", function (err, rows) {
			for (var i = 0; i < rows.length; i++) {
				if (rows[i].username === username) {
					code = rows[i].code.toLowerCase();
					amount = rows[i].amount
					status = 1;
				}
			}
			//Sets the options for the api request
			const options = {
				"hostname": 'cdn.jsdelivr.net',
				"port": null,
				"path": `/gh/fawazahmed0/currency-api@1/latest/currencies/${code}/${convertCurrency}.json`,
				"method": "GET",
				"headers": {
					"useQueryString": true
				}
			}
			//Performs the api request and sends the information
			https.request(options, function (apiResponse) {
				let currencyData = '';
				apiResponse.on('data', function (chunk) {
					currencyData += chunk
				})
				apiResponse.on('end', function () {
					let converted = (amount * JSON.parse(currencyData)[convertCurrency]);
					response.contentType('application/json').json(converted)
				})
			}).end();
		})
	} else {
		//Ends appropriate error status
		response.json(status);
	}
})
//Handles get request to get the balance information
app.get('/check', (request, response) => {
	let username = request.query.username;
	let status = 1;
	if (username === '[object PointerEvent]'||username === '') {
		status = 0;
	}
	//Gets the informatin fromt the database and sends it 
	if (status == 1) {
		db.all("SELECT username,amount, code FROM user", function (err, rows) {
			for (let i = 0; i < rows.length; i++) {
				if (rows[i].username === username) {
					let code = rows[i].code;
					code = code.toUpperCase();
					response.json(rows[i].amount + " " + code);
				}
			}
		});
	}else{
		response.json(status);
	}
})
//Handles post request to send registered user's data
app.post('/register', (request, response) => {
	let username = request.body.username;
	let password = request.body.password;
	let alreadyRegister = 0;
	//Checks if the user is signing in or registering
	db.all("SELECT username, password FROM user", function (err, rows) {
		for (var i = 0; i < rows.length; i++) {
			//Check if the user is signing in proerly
			if (rows[i].username === username && rows[i].password === password) {
				alreadyRegister = 1;
				break;
			} else if (rows[i].username === username && rows[i].password !== password) {
				alreadyRegister = 2;
				break;
			}
		}
		//Adds the user to the database
		if (alreadyRegister == 0) {
			let sqlString = `INSERT OR REPLACE INTO user VALUES ('${username}', "${password}",0,NULL,"guest")`
			db.run(sqlString);
		}
		response.json(alreadyRegister);
	});
}
)
//Handles post request to save data to the database 
app.post('/save', (request, response) => {
	let username = request.body.username;
	let amount = request.body.Amount;
	let currency = request.body.Currency;
	currency = currency.toLowerCase();
	let id = 0;
	let updatedAmount = 0;
	let status = 1;
	if (username === '[object PointerEvent]'||username === '') {
		status = 0;
	}
	if (!amount || !currency) {
		status = 2;
	}
	if (status == 1) {
		//Goes through the database and finds the right user
		db.all("SELECT username,amount, code FROM user", function (err, rows) {
			for (let i = 0; i < rows.length; i++) {
				if (rows[i].username === username) {
					id = i;
					//Updates the database information for that usewr
					if (rows[i].code === currency) {
						let previousAmount = rows[i].amount;
						updatedAmount = Number(previousAmount) + Number(amount);
						let sqlString = `UPDATE user SET amount = ${updatedAmount}, code = "${currency}" WHERE username = "${username}"`
						db.run(sqlString);
						status = 1;
						return;
					}else{
					    let sqlString = `UPDATE user SET amount = ${amount}, code = "${currency}" WHERE username = "${username}"`
						db.run(sqlString);
						status = 1;
						return;
					}
				}
			}
		});
	}
	response.json(status);
})
//Gets the pages for the user to visit as well as the authenticate
app.get('/', routes.index);
app.use(routes.authenticate);
app.get('/users', routes.users)
//start server
app.listen(PORT, err => {
	if (err) console.log(err)
	else {
		console.log(`Server listening on port: ${PORT} CNTL:-C to stop`)
		console.log('http://localhost:3000/')
		console.log('http://localhost:3000/users')
	}
})

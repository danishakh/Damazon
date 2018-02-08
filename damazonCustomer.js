// Dependencies
var mysql = require('mysql');
var inquirer = require('inquirer');
var Table = require('cli-table');
var colors = require('colors');

colors.setTheme({
  silly: 'rainbow',
  input: 'grey',
  verbose: 'cyan',
  prompt: 'grey',
  info: 'green',
  data: 'grey',
  help: 'cyan',
  warn: 'yellow',
  debug: 'blue',
  error: 'red'
});

// Define mySQL connection config
var connection = mysql.createConnection({
	host: 'localhost',
	port: '3306',
	user: 'root',
	password: '',
	database: 'damazon'
});

// connect to mySQL instance
connection.connect((err) => {
	if (err) {
		console.error(colors.error('error connecting to database: ', err.stack));
	}
	console.log(colors.debug('connected to db as id: ', connection.threadId));

	getAllProducts();
});


function getAllProducts() {
	connection.query('SELECT * FROM products', (error, results, fields) => {
		if (error) throw error;
		console.log('***************************************************'.silly);
		console.log('WELCOME TO DAMAZON - BROWSE OUR PRODUCTS BELOW:'.silly);
		console.log('***************************************************'.silly);

		var table = new Table({
			head: ['ID', 'PRODUCT', 'PRICE'],
			colWidths: [5, 30, 10]
		});

		for (var i = 0; i < results.length; i++) {
			var arrayToPush = [results[i].item_id, results[i].product_name, '$'+results[i].product_price];
			table.push(arrayToPush);
		}

		console.log(table.toString());

		inquirePurchase();
	});

}



function inquirePurchase() {
	inquirer.prompt([
	{
		type: 'input',
		message: 'Please enter ID of the item you want to purchase',
		name: 'productPicked',
		validate: function(input) {
			if (input.length > 2 || input.length === 0) {
				return 'Please enter a valid item ID'.error;
			}
			var numRegExp = /^[0-9]*$/;
			if (numRegExp.test(input)) {
				return true;
			}
			else return 'Please enter numbers only!'.error;
		}
	},
	{
		type: 'input',
		message: 'How many of those do you need?',
		name: 'productQty',
		validate: function(input) {
			var numRegExp = new RegExp("^[0-9]*$");
			if (numRegExp.test(input)) {
				return true;
			}
			else return 'Please enter numbers only!'.error;
		}
	}
	]).then((result) => {
		// define our variables to hold user input
		var productId = result.productPicked;
		var productQty = result.productQty;

		// define variable to hold the price of chosen product
		var productPrice;
		var productName;


		connection.query('SELECT * FROM products WHERE item_id = ?', [productId], (error, results) => {
			if (error) throw error;

			// if item_id not present
			if (results.length === 0) {
				console.log('item_id not found! Please enter a valid item_id'.error);
				inquirePurchase();
			}
			else {
				productPrice = results[0].product_price;
				productName = results[0].product_name;

				// check if we have quantity requested
				if (productQty > results[0].stock_quantity) {
					console.log('Apologies! We only have ' + results[0].stock_quantity + ' ' + results[0].product_name + ' in stock!');
					inquirePurchase();
				}
				else {
					// update database
					connection.query('UPDATE products SET stock_quantity = stock_quantity - ? WHERE item_id = ?', [productQty, productId], (error, results) => {
						if (error) throw error;

						// calculate order total
						var total = parseFloat(productQty) * parseFloat(productPrice);

						console.log('--------------------');
						console.log('Order Summary');
						console.log('--------------------');

						var table = new Table({
							head: ['QTY ORDERED', 'PRODUCT', 'PRICE'],
							colWidths: [15, 30, 10]
						});

						table.push([productQty, productName, '$'+productPrice]);
						console.log(table.toString());
						console.log('Order Total: $' + total);
						console.log('Thank you for your purchase! We hope to see you again!');

						// close db connection
						connection.end();
						
						// ask user if they want to make another purchase
						inquirer.prompt([
						{
							type:'confirm',
							message: 'Would you like to make another purchase?',
							name: 'isRich',
							default: false
						}
						]).then((result) => {
							if (result.isRich) {
								getAllProducts();
							}
						});
					});
				}
			}
		});
		
	});
}














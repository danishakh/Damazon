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
		console.error('error connecting to database: ' + err.stack);
	}
	console.log('connected to db as id: ' + connection.threadId);

	managerWelcomeMenu();
});

function managerWelcomeMenu() {
	console.log('**************************'.verbose);
	console.log('      MANAGER VIEW  '.verbose);
	console.log('**************************'.verbose);
	inquirer.prompt([
	{
		name: 'actionChosen',
		type: 'list',
		choices: ['View Products For Sale', 'View Low Inventory', 'Add To Inventory', 'Add New Product'],
		message: 'What would you like to do?'
	}
	]).then((result) => {
		if (result.actionChosen === 'View Products For Sale') {
			showAllProducts();
		}
		else if (result.actionChosen === 'View Low Inventory') {
			showLowInventoryItems();
		}
		else if (result.actionChosen === 'Add To Inventory') {
			restockItem();
		}
		else if(result.actionChosen === 'Add New Product') {
			addNewItem();
		}
	});
}


function showAllProducts() {
	connection.query('SELECT * FROM products', (error, results) => {
		if (error) throw error;

		var table = new Table({
			head: ['ID', 'PRODUCT', 'PRICE', 'PRODUCT SALES', 'CURRENT STOCK'],
			colWidths: [5, 30, 10, 15, 15]
		});

		for (var i = 0; i < results.length; i++) {
			var arrayToPush = [results[i].item_id, results[i].product_name, '$'+results[i].product_price, '$'+results[i].product_sales, results[i].stock_quantity];
			table.push(arrayToPush);
		}

		console.log(table.toString());

		managerWelcomeMenu();
	});
}

function showLowInventoryItems() {
	connection.query('SELECT * FROM products WHERE stock_quantity < 5', (error, results) => {
		if (error) throw error;

		if (results.length === 0) {
			console.log('All items stock quantities are currently above the min limit'.warn);
		}

		var table = new Table({
			head: ['ID', 'PRODUCT', 'PRICE', 'PRODUCT SALES', 'CURRENT STOCK'],
			colWidths: [5, 30, 10, 15, 15]
		});

		for (var i = 0; i < results.length; i++) {
			var arrayToPush = [results[i].item_id, results[i].product_name, '$'+results[i].product_price, '$'+results[i].product_sales, results[i].stock_quantity];
			table.push(arrayToPush);
		}

		console.log(table.toString());

		managerWelcomeMenu();
	});
}

function restockItem() {
	
	var quantityToAdd;

	connection.query('SELECT * FROM products', (error, results) => {
		if (error) throw error;

		var productName = [];

		for (var i = 0; i < results.length; i++) {
			productName.push(results[i].product_name);
		}
		//console.log(productName);

		inquirer.prompt([
		{
			name: 'productChosen',
			type: 'list',
			choices: productName,
			message: 'Please select a product you would like to restock'
		},
		{
			name: 'restockQty',
			type: 'input',
			message: 'How many orders of this item would you like to restock?',
			validate: function(input) {
				if (input.length === 0) {
					return 'Please enter restock amount'.error;
				}
				var numRegExp = /^[0-9]*$/;
				if (numRegExp.test(input)) {
					return true;
				}
				else return 'Please enter numbers only!'.error;
			}
		}
		]).then((result) => {
			//console.log(result.productChosen);
			//console.log(result.restockQty);

			connection.query('UPDATE products SET stock_quantity = stock_quantity + ? WHERE product_name = ?', [result.restockQty, result.productChosen], (error, results) => {
				if (error) throw error;

				console.log(colors.inverse('Successfully added ' + result.restockQty + ' orders of ' + result.productChosen + ' into Damazon inventory!'));

				inquirer.prompt([
				{
					name: 'restockMore',
					type: 'confirm',
					default: false,
					message: 'Do you want to restock more items?'
				}
				]).then((result) => {
					if (result.restockMore) {
						restockItem();
					}
					else {
						managerWelcomeMenu();
					}
				});
			});
		});
	});
}

function addNewItem() {
	inquirer.prompt([
	{
		name: 'newProductName',
		type: 'input',
		message: 'What product do you want to add?',
		validate: function(input) {
			if (input.length === 0 || input.length > 50) {
				return 'Product name should be betwen 0 and 50 characters'.error;
			}
			var numRegExp = /^[0-9]*$/;
			if (numRegExp.test(input)) {
				return 'Product name cannot just be numbers!'.error;
			}
			else return true;
		}
	},
	{
		name: 'newProductPrice',
		type: 'input',
		message: 'What price do you want to charge for this product?',
		validate: function(input) {
			var priceRegExp = /^[0-9]\d{0,9}(\.\d{1,2})?%?$/;
			if (priceRegExp.test(input)) {
				return true;
			}
			else return 'Please enter a valid price! (no need to enter $ sign)'.error;
		}
	},
	{
		name: 'newProductDept',
		type: 'input',
		message: 'What product department does this product belong to?',
		validate: function(input) {
			if (input.length === 0 || input.length > 50) {
				return 'Dept name should be betwen 0 and 50 characters'.error;
			}
			var numRegExp = /^[0-9]*$/;
			if (numRegExp.test(input)) {
				return 'Dept name cannot just be numbers!'.error;
			}
			else return true;
		}
	},
	{
		name: 'newProductStock',
		type: 'input',
		message: 'How many orders of this product do you want to stock in the inventory?',
		validate: function(input) {
			var numRegExp = new RegExp("^[0-9]*$");
			if (numRegExp.test(input)) {
				return true;
			}
			else return 'Please enter numbers only!'.error;
		}
	}
	]).then((result) => {
		connection.query('INSERT INTO products SET ?', 
		{
			product_name: result.newProductName,
			dept_name: result.newProductDept,
			product_price: result.newProductPrice,
			stock_quantity: result.newProductStock
		}, (error, results) => {
			if (error) throw error;
			console.log('Successfully added new product to inventory!');

			inquirer.prompt([
			{
				name: 'addAnotherItem',
				type: 'confirm',
				default: false,
				message: 'Do you want to add another product?'
			}
			]).then((result) => {
				if (result.addAnotherItem) {
					addNewItem();
				}
				else {
					managerWelcomeMenu();
				}
			});
		});
	});
}




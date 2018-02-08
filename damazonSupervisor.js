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

	supervisorWelcomeMenu();
});


function supervisorWelcomeMenu() {
	console.log('**************************'.verbose);
	console.log('      SUPERVISOR VIEW  '.verbose);
	console.log('**************************'.verbose);
	inquirer.prompt([
	{
		name: 'actionChosen',
		type: 'list',
		choices: ['View Product Sales by Department', 'Add New Department'],
		message: 'What would you like to do?'
	}
	]).then((result) => {
		if (result.actionChosen === 'View Product Sales by Department') {
			viewProdSalesbyDept();
		}
		else if(result.actionChosen === 'Add New Department') {
			addNewDept();
		}
	});
}

function viewProdSalesbyDept() {
	connection.query('SELECT d.dept_id as department_id, d.dept_name as department_name, d.over_head_costs as overhead_costs, SUM(p.product_sales) as total_product_sales ' 
		+ 'FROM departments d '
		+ 'INNER JOIN products p '
		+ 'ON d.dept_name = p.dept_name '
		+ 'GROUP BY d.dept_id, d.dept_name;', (error, results) => {
			if (error) throw error;

			//console.log(results);

			var table = new Table({
				head: ['DEPT ID', 'DEPT NAME', 'OVERHEAD COSTS', 'TOTAL PRODUCT SALES', 'PROFIT'],
				colWidths: [10, 15, 15, 20, 15]
			});

			for (var i = 0; i < results.length; i++) {
				
				// hack to display profit (and negative values if cost > sales)
				var overhead = (results[i].overhead_costs);
				var prod_sales = (results[i].total_product_sales);
				var profit = (overhead - prod_sales);

				if (parseFloat(results[i].overhead_costs) > parseFloat(results[i].total_product_sales)) {
					profit = '-' + profit.toString();
				}

				var arrayToPush = [results[i].department_id, results[i].department_name, '$'+results[i].overhead_costs, '$'+results[i].total_product_sales, profit];
				table.push(arrayToPush);
			}

			console.log(table.toString());

			supervisorWelcomeMenu();
	});
}


function addNewDept() {
	inquirer.prompt([
	{
		name: 'newDeptName',
		type: 'input',
		message: 'What department do you want to add?',
		validate: function(input) {
			if (input.length === 0 || input.length > 50) {
				return 'Department name should be betwen 0 and 50 characters'.error;
			}
			var numRegExp = /^[0-9]*$/;
			if (numRegExp.test(input)) {
				return 'Department name cannot just be numbers!'.error;
			}
			else return true;
		}
	},
	{
		name: 'newOverheadCosts',
		type: 'input',
		message: 'What are this departments overhead costs?',
		validate: function(input) {
			var priceRegExp = /^[0-9]\d{0,9}(\.\d{1,2})?%?$/;
			if (priceRegExp.test(input)) {
				return true;
			}
			else return 'Please enter a valid cost! (no need to enter $ sign)'.error;
		}
	}
	]).then((result) => {
		connection.query('INSERT INTO departments SET ?', 
		{
			dept_name: result.newDeptName,
			over_head_costs: result.newOverheadCosts
		}, (error, results) => {
			if (error) throw error;
			console.log('Successfully added new department to database!'.warn);

			inquirer.prompt([
			{
				name: 'addAnotherDept',
				type: 'confirm',
				default: false,
				message: 'Do you want to add another department?'
			}
			]).then((result) => {
				if (result.addAnotherDept) {
					addNewDept();
				}
				else {
					supervisorWelcomeMenu();
				}
			});
		});
	});
}

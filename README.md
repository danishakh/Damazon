# Damazon

An Amazon-like storefront developed for the CLI using Node and mysql. This app allows users to engage with the store from a customer, store manager and store supervisor perspectives. Customers can place orders and deplete stock from the store's inventory. Managers can manage/monitor store inventory and perform necessary actions to keep the store stocked. Supervisors can add vendor departments and view gross revenue by each vendor department. Each of the 3 above have separate interfaces.


## Setup

	git clone git@github.com:danishakh/Hangman-CLI.git  
	cd ../damazon  
	npm install


In order to run this application, you should have the MySQL database already set up on your machine. If you don't, visit the [MySQL installation page](https://dev.mysql.com/doc/refman/5.6/en/installing.html) to install the version you need for your operating system. Once you have MySQL installed, you will be able to create the *Damazon* database and the *products* table with the SQL code found in [schema.sql](/sql/schema.sql). Run this code inside your MySQL client to create the database, then run [productSeeds.sql](/sql/productSeeds.sql) to add the initial data. You will then be ready to proceed with running the Bamazon customer and manager interfaces.



### Customer Interface

The customer interface allows the user to view the range of products provided by *Damazon*, and place orders on desired quantities of products, as long as that amount is available in stock. If not available, the customer is notified.

`node damazonCustomer.js`

<!-- ##### option 1
<a href="https://media.giphy.com/media/xThtakvG9oZKE2Ii40/giphy.gif"><img src="https://media.giphy.com/media/xThtakvG9oZKE2Ii40/giphy.gif" title="Damazon Customer Interface"></a>

##### option 2
<iframe src="https://giphy.com/embed/xThtakvG9oZKE2Ii40" width="480" height="306" frameBorder="0" class="giphy-embed" allowFullScreen></iframe><p><a href="https://giphy.com/gifs/terminal-node-mysql-xThtakvG9oZKE2Ii40">via GIPHY</a></p>

##### option 3 (probably the best one right now) -->
Link to [Customer Interface](https://giphy.com/gifs/terminal-node-mysql-xThtakvG9oZKE2Ii40/fullscreen)
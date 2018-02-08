DROP DATABASE IF EXISTS damazon;
CREATE DATABASE damazon;

USE damazon;

CREATE TABLE products(
  item_id INT NOT NULL AUTO_INCREMENT,
  product_name VARCHAR(50) NULL,
  dept_name VARCHAR(50) NULL,
  product_price DECIMAL(10,2) NOT NULL,
  stock_quantity INT NOT NULL,
  PRIMARY KEY (item_id)
);
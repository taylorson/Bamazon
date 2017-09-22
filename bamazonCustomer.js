var mysql = require('mysql');
var inquirer = require('inquirer');
var Table = require('cli-table');
var connection = mysql.createConnection({
    host: 'localhost',
    port: 3306,
    user: 'root',
    password: '',
    database: 'Bamazon'
});

connection.connect(function(err) {
    if (err) throw err;
});

connection.query('SELECT ItemID, ProductName, Price FROM Products', function(err, result) {
    if (err) console.log(err);

    var table = new Table({
        head: ['Item Id#', 'Product Name', 'Price'],
        style: {
            head: ['blue'],
            compact: false,
            colAligns: ['center'],
        }
    });

    for (var i = 0; i < result.length; i++) {
        table.push(
            [result[i].ItemID, result[i].ProductName, result[i].Price]
        );
    }
    console.log(table.toString());

    purchase();
});

function purchase() {
    inquirer.prompt([{
                name: 'itemID',
                type: 'input',
                message: 'Please enter the ID # of the item you wish to purchase!',
                validate: function(value) {
                    if (isNaN(value) === false) {
                        return true;
                    }
                    return 'Please submit a valid item!';
                }
            }, {
                name: 'quantity',
                type: 'input',
                message: 'How many items would you like to purchase?',
                validate: function(value) {
                    if (isNaN(value) === false) {
                        return true;
                    }
                    return 'Please submit a valid amount!';
                }
            }

        ])
        .then(function(answer) {
            connection.query('SELECT * FROM Products WHERE ItemID = ?', [answer.itemID], function(err, res) {
                // console.log(res);
                if (answer.quantity > res[0].StockQuantity) {
                    console.log('Sorry, only ' + res[0].StockQuantity + ' units left!' + '\n');
                    connection.end();
                } else {
                    totalPrice = res[0].Price * answer.quantity;
                    department = res[0].DepartmentName;
                    console.log('\n' + answer.quantity + ' item(s) purchased');
                    console.log(res[0].ProductName);
                    console.log('$' + res[0].Price + '(ea)' + '\n');
                    console.log('Your total is $' + totalPrice + '\n');
                    console.log('Thanks for your order!' + "\n");

                    var updateStock = res[0].StockQuantity - parseInt(answer.quantity);
                    connection.query('UPDATE products SET StockQuantity= ' + updateStock + ' WHERE ItemID =' + answer.itemID);
                    connection.end();
                }

            });
        });
}
// TASK #1 : BASIC BANKING SYSTEM

// 1. Create a simple dynamic website which has the following specs.
// 2. Start with creating a dummy data in database for upto 10 customers. Database options: Mysql, Mongo, Postgres, etc. Customers table will have basic fields such as name, email, current balance etc. Transfers table will record all transfers happened.
// 3. Flow: Home Page > View all Customers > Select and View one Customer > Transfer Money > Select customer to transfer to > View all Customers.
// 4. No Login Page. No User Creation. Only transfer of money between multiple users.
// 5. Host the website at 000webhost, github.io, heroku app or any other free hosting provider. Check in code in gitlab.

const express = require('express');
const bankDB = require(__dirname + '/models/bankDB.js');

const Customer = bankDB.Customer;
const Transfer = bankDB.Transfer;
const app = express();

app.use(express.urlencoded({ extended: true }));
app.set('view engine', 'ejs');
app.use(express.static('public'));

let date = new Date();
let currentYear = date.getFullYear();

app.get("/", (req, res) => {
    res.render("home", { year: currentYear });
})

app.get("/customers", (req, res) => {
    Customer.find({}, (err, customers) => {
        if (!err) {
            if (customers.length === 0) {
                // Creating a dummy data in the database for 10 customers
                for (let i = 1; i <= 10; i++) {
                    const customer = new Customer({
                        _id: i,
                        name: "Customer " + i,
                        email: "customer" + i + "@gmail.com",
                        accountBalance: i * 100000
                    })
                    customer.save();
                }
                res.redirect("/customers");
            }
            else {
                customers.sort((c1, c2) => c1._id - c2._id);
                res.render("customers", { year: currentYear, customers: customers });
            }
        }
    });
})


app.get("/transfer", (req, res) => {
    Customer.find({}, (err, customers) => {
        if (!err) {
            customers.sort((c1, c2) => c1._id - c2._id);
            res.render("transfer", { year: currentYear, customers: customers, flag1: 0, flag2: 0 });
        }
    })
})
app.get("/transfer-history", (req, res) => {
    Transfer.find({}, (err, transfers) => {
        if (!err) {
            transfers.sort((t1, t2) => t1._id - t2._id);
            res.render("transferhistory", { year: currentYear, transfers: transfers })
        }
    })
})


app.post("/", (req, res) => {
    console.log(req.body);
    let fromID = req.body.from;
    let toID = req.body.to;
    let amount = Number(req.body.amount);

    Customer.find({}, (err, customers) => {
        if (!err) {
            let transferorBalance = customers[fromID - 1].accountBalance;

            // Check if the transferor and the transferee are same
            if (fromID === toID) {
                customers.sort((c1, c2) => c1._id - c2._id);
                res.render("transfer", { year: currentYear, customers: customers, flag1: 1, flag2: 0 });
            }
            // Else Check if the transferor's account balance is less than the amount mentioned by the user
            else if (transferorBalance < amount) {
                customers.sort((c1, c2) => c1._id - c2._id);
                res.render("transfer", { year: currentYear, customers: customers, flag1: 0, flag2: 1 });
            }
            // Else update the db and render the changes
            else {
                Customer.findByIdAndUpdate({ _id: fromID }, { $inc: { accountBalance: -amount } }, (err, customers) => { });
                Customer.findByIdAndUpdate({ _id: toID }, { $inc: { accountBalance: amount } }, (err, customers) => { });

                const date = new Date();
                const currentTime = date.toLocaleString(undefined, { timeZone: 'Asia/Kolkata' });
                Transfer.find({}, (err, transfers) => {
                    let len = transfers.length;
                    const transfer = new Transfer({
                        _id: len + 1,
                        transferredFrom: customers[fromID - 1].name,
                        transferredTo: customers[toID - 1].name,
                        amount: amount,
                        date: currentTime
                    })
                    transfer.save();
                })

                res.redirect("/customers");
            }
        }
    })
})


app.listen(process.env.PORT || 3000, () => {
    console.log("Server is up and running");
})
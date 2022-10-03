/* References to Middleware */
const mongodb = require('mongodb');
const express = require('express');
const app = express();
const bodyparser = require('body-parser');
const { query } = require('express');

/*Get and Set BodyParser and EJS View Engine*/
app.use(bodyparser.urlencoded({ extended: true }));
app.set('view engine', 'ejs');

/*Reference Local Server*/
app.use(express.static('public'));
var MongoClient = mongodb.MongoClient;
var mongourl = 'mongodb://localhost:27017';

/*Create MongoDB Server*/
MongoClient.connect(mongourl, async (error, databases) => {
    /* Connect to Database */
    var dbase = databases.db('PizzaDB');
    app.post('/formsub', async (req, res) => {
        /* Create collection */
        dbase.createCollection("orders", function (error, response) {
            if (error) {
                return error;
            };
            console.log('Collection has been created');
            databases.close();
        });
        /* Create document */
        dbase.collection("orders").insertOne(
            {
                "uname": req.body.uname,
                "address": req.body.address,
                "size": req.body.size,
                "modifier": req.body.mod,
                "drinks": req.body.drinks,
                "sides": req.body.sides,
                "dips": req.body.dips,
                "requests": req.body.requests
            }
        );
        res.redirect('/cart');
        res.end();
    });
    /* Render 'Home' Page */
    app.get('/', function (req, res) {
        res.render('index');
    });

    /* Render 'Order' Page */
    app.get('/order', async (req, res) => {
        res.render('order');
    });

    /* Render 'Cart' page */
    app.get('/cart', async (req, res) => {
        foundcart = await dbase.collection('orders').find().toArray();
        res.render('cart', {foundcart : foundcart});
    });

    /* Pass information to Delete item */
    app.post('/cart/delete/:id', async (req, res) => {
        const {id} = req.params;
        await dbase.collection('orders').deleteOne({_id: mongodb.ObjectId(id)});
        res.redirect('/cart');
    });

    /* Pass information to get 'Edit' page */
    app.get('/cart/edit/:id', async (req, res) => {
        const {id} = req.params;
        foundcart = await dbase.collection('orders').find({_id: mongodb.ObjectId(id)}).toArray();
        res.render('edit', {foundcart : foundcart});
    });

    /* Update item in Database */
    app.post('/cart/edit/:id/update', async (req, res) => {
        const {id} = req.params;
        dbase.collection("orders").findOneAndUpdate( {_id: mongodb.ObjectId(id)}, 
            {$set:{
                "uname": req.body.uname,
                "address": req.body.address,
                "size": req.body.size,
                "modifier": req.body.mod,
                "drinks": req.body.drinks,
                "sides": req.body.sides,
                "dips": req.body.dips,
                "requests": req.body.requests
            }}, { upsert: true }
        );
        res.redirect('/cart');
    });

    /* Search Bar function */
    app.post('/search', async (req, res) => {
        squery = req.body.search;
        squerybox = req.body.searchquery;
        if (squerybox == "uname") {
            foundcart = await dbase.collection('orders').find({uname : squery}).toArray();
        }
        else if (squerybox == "address") {
            foundcart = await dbase.collection('orders').find({address: squery}).toArray();
        }   
        else if (squerybox == "size") {
            foundcart = await dbase.collection('orders').find({size : squery}).toArray();
        }
        
        res.render('cart', {foundcart:foundcart});
    });
});


/* Create and run LocalHost server */
app.listen(7000, function () {
    console.log('Server is running on port 7000!');
});
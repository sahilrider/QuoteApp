const express = require('express');
const bodyParser = require('body-parser')
const app = express();

const MongoClient = require('mongodb').MongoClient

const connectionString = 'mongodb+srv://<username>:<password>@cluster0.3dodw.mongodb.net/<dbname>?retryWrites=true&w=majority'

MongoClient.connect(connectionString, { useUnifiedTopology: true})
    .then(client => {
        console.log('Connected to Database')
        const db = client.db('star-wars-quotes')
        const quotesCollection = db.collection('quotes')

        //Middlewares
        app.set('view engine', 'ejs')
        app.use(bodyParser.urlencoded({ extended: true }))
        app.use(bodyParser.json())
        app.use(express.static('public'))

        //Routes
        app.get('/', (req, res) => {
            const cursor = db.collection('quotes').find().toArray()
                .then(results => {
                    res.render('index.ejs', { quotes: results})
                })
                .catch(error => console.error(error))
        })

        app.post('/quotes', (req, res) => {
            quotesCollection.insertOne(req.body)
                .then(result => {
                    res.redirect('/')
                    console.log('Quote added.')
                })
                .catch(error => console.error(error))
        })
        
        app.put('/quotes', (req, res) => {
            quotesCollection.findOneAndUpdate(
                { name: 'yoda'},
                {
                    $set: {
                        name: req.body.name,
                        quote: req.body.quote
                    }
                },
                {
                    upsert: true
                }
            )
                .then(result => {
                    console.log('Qupte updated.')
                    res.json('Success')
                })
                .catch(error => {
                    console.error(error)
                })
        })

        app.delete('/quotes', (req, res) => {
            quotesCollection.deleteOne(
                { name: req.body.name}
            )
                .then(result => {
                    if (result.deletedCount == 0) {
                        return res.json('No quote to delete')
                    }
                    res.json('Deleted quote')
                })
                .catch(error => console.error(error))
        })

        //Listening
        app.listen(3000, function() {
            console.log('listening on 3000')
        })
    })
    .catch(error => console.error(error))
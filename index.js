const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const { MongoClient, ServerApiVersion } = require('mongodb');
require('dotenv').config();
const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.nl4sfa8.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run() {
    try {
        const buyingCollection = client.db('realEstate').collection('buy');
        const orderCollection = client.db('realEstate').collection('orders');
        const reviewCollection = client.db('realEstate').collection('reviews');

        // Assigning JWT token
        app.post('/jwt', (req, res) => {
            const user = req.body;
            const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '12h' });
            res.send({ token });
        })

        app.get('/buy', async (req, res) => {
            const query = {};
            const cursor = buyingCollection.find(query);
            const toBuy = await cursor.toArray();
            res.send(toBuy);
        })
    }
    finally {

    }
}

run().catch(err => console.error(err));

// Default server API
app.get('/', (req, res) => {
    res.send('Real Estate Broker Live Server')
});

app.listen(port, () => {
    console.log(`Server running on port: ${port}`);
})
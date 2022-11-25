const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config();
const app = express();
const port = process.env.PORT || 5000;

// Setting Middleware
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.nl4sfa8.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

function verifyJWT(req, res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return res.status(401).send({ message: 'Unauthorized Access!' });
    }

    const token = authHeader.split(' ')[1];

    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, function (err, decoded) {
        if (err) {
            return res.status(403).send({ message: 'Forbidden Access!' });
        }

        req.decoded = decoded;
        next();
    })
}

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

        app.get('/overview', async (req, res) => {
            const query = {};
            const cursor = buyingCollection.find(query).limit(3);
            const toBuy = await cursor.toArray();
            res.send(toBuy);
        })

        app.get('/buy', async (req, res) => {
            const query = {};
            const cursor = buyingCollection.find(query);
            const toBuy = await cursor.toArray();
            res.send(toBuy);
        })

        app.get('/buy/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const details = await buyingCollection.findOne(query);
            res.send(details);
        })

        app.post('/buy', verifyJWT, async (req, res) => {
            const addToBuy = req.body;
            const result = await buyingCollection.insertOne(addToBuy);
            res.send(result);
        })

        app.get('/client-reviews', async (req, res) => {
            const query = {};
            const cursor = reviewCollection.find(query).limit(4);
            const clientReview = await cursor.toArray();
            res.send(clientReview);
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
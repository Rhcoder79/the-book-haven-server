const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const app = express();
const port = process.env.PORT || 3000;

// MIDDLEWARE
app.use(cors());
app.use(express.json());

// MongoDB Connection URI
const uri = "mongodb+srv://bookDbUser:iIAvSJNCury8TNCb@cluster0.sumux0b.mongodb.net/?appName=Cluster0";

const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

app.get('/', (req, res) => {
    res.send('book heaven server is running')
});

async function run() {
    try {
        const db = client.db('book_db');
        const productCollection = db.collection('products');
        const bidsCollection = db.collection('bids');
        const usersCollection = db.collection('users');
        const commentsCollection = db.collection('comments');
        //COMMENTS API
        app.post('/comments', async (req, res) => {
    const comment = req.body;
    const result = await commentsCollection.insertOne(comment);
    res.send(result);
});

        // --- USERS API ---
        app.post('/users', async (req, res) => {
            const newUser = req.body;
            const email = req.body.email;
            const query = { email: email };
            const existingUser = await usersCollection.findOne(query);
            if (existingUser) {
                res.send({ message: 'user already exists' })
            }
            else {
                const result = await usersCollection.insertOne(newUser)
                res.send(result)
            }
        });
        //comment 
        app.get('/comments', async (req, res) => {
    try {
        const result = await commentsCollection.find().toArray();
        res.send(result);
    } catch (error) {
        res.status(500).send({ message: "Error fetching all comments", error });
    }
});
//COMMENT ID
       app.get('/comments/:bookId', async (req, res) => {
    const bookId = req.params.bookId;
    const query = { bookId: bookId };
    
    
    const result = await commentsCollection.find(query).sort({ createdAt: -1 }).toArray();
    res.send(result);
});
      
        app.get('/products', async (req, res) => {
            const email = req.query.userEmail;
            const query = {}
            if (email) {
                query.userEmail = email;
            }
            const cursor = productCollection.find(query);
            const result = await cursor.toArray();
            res.send(result)
        });

        // --- GET SINGLE PRODUCT (Details) ---
        app.get('/products/:id', async (req, res) => {
            const id = req.params.id;
            try {
              
                let query = { _id: id };
                let result = await productCollection.findOne(query);

                if (!result && ObjectId.isValid(id)) {
                    query = { _id: new ObjectId(id) };
                    result = await productCollection.findOne(query);
                }

                if (!result) {
                    return res.status(404).send({ error: "Book not found" });
                }
                res.send(result);
            } catch (error) {
                res.status(500).send({ error: "Server error" });
            }
        });

        // --- ADD NEW PRODUCT ---
        app.post('/products', async (req, res) => {
            const newProduct = req.body;
            const result = await productCollection.insertOne(newProduct);
            res.send(result);
        });

        
        app.patch('/products/:id', async (req, res) => {
            const id = req.params.id;
            const updatedData = req.body;
            try {
              
                let filter = { _id: id };
                let existingProduct = await productCollection.findOne(filter);

                if (!existingProduct && ObjectId.isValid(id)) {
                    filter = { _id: new ObjectId(id) };
                }

                const updateDoc = {
                    $set: {
                        title: updatedData.title,
                        author: updatedData.author,
                        genre: updatedData.genre,
                        rating: updatedData.rating,
                        summary: updatedData.summary,
                        coverImage: updatedData.coverImage
                    },
                };
                const result = await productCollection.updateOne(filter, updateDoc);
                res.send(result);
            } catch (error) {
                res.status(400).send({ error: "Update failed" });
            }
        });

        
        app.delete('/products/:id', async (req, res) => {
            const id = req.params.id;
            try {
                let query = { _id: id };
                let existingProduct = await productCollection.findOne(query);

                if (!existingProduct && ObjectId.isValid(id)) {
                    query = { _id: new ObjectId(id) };
                }

                const result = await productCollection.deleteOne(query);
                res.send(result);
            } catch (error) {
                res.status(400).send({ error: "Delete failed" });
            }
        });

        // --- BIDS API ---
        app.get('/bids', async (req, res) => {
            const email = req.query.email;
            const query = {};
            if (email) {
                query.bidderEmail = email;
            }
            const cursor = bidsCollection.find(query);
            const result = await cursor.toArray();
            res.send(result);
        });

        app.post('/bids', async (req, res) => {
            const newBid = req.body;
            const result = await bidsCollection.insertOne(newBid);
            res.send(result);
        });

        await client.db("admin").command({ ping: 1 });
        console.log("Connected to MongoDB Successfully!");
    } catch (error) {
        console.error(error);
    }
}
run().catch(console.dir);

app.listen(port, () => {
    console.log(`Server is running on port: ${port}`)
});
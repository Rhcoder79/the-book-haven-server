const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const app=express();
const port=process.env.PORT || 3000;

//MIDDLEWARE
app.use(cors());
app.use(express.json())

//const uri = "mongodb+srv://<db_username>:<db_password>@cluster0.sumux0b.mongodb.net/?appName=Cluster0";
const uri = "mongodb+srv://bookDbUser:iIAvSJNCury8TNCb@cluster0.sumux0b.mongodb.net/?appName=Cluster0";

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

app.get('/',(req,res)=>{
    res.send('book heaven server is running')
})
async function run(){

   try{
     await client.connect();

     const db=client.db('book_db');
     const productCollection=db.collection('products');
     const bidsCollection=db.collection('bids');
     const usersCollection=db.collection('users');

     app.post('/users',async(req,res)=>{
        const newUser=req.body;
        const email=req.body.email;
        const query={email:email};
        const existingUser=await usersCollection.findOne(query);
        if(existingUser){
            res.send({message:'user already exits to need to insert again'})
        }
        else{
            const result=await usersCollection.insertOne(newUser)
            res.send(result)
        }
       // const result=await usersCollection.insertOne(newUser);
       // res.send(result);
     })

     app.get('/products',async(req,res)=>{
        //const cursor=productCollection.find().sort({rating: -1}).limit(6);
        console.log(req.query);
    const email=req.query.userEmail;
    const query={}
    if(email){
        query.userEmail=email;
    }
        const cursor=productCollection.find(query);
        const result=await cursor.toArray();
        res.send(result)
     })
     app.get('/products/:id',async(req,res)=>{
        const id=req.params.id;
        const query={_id:new ObjectId(id)}
        const result=await productCollection.findOne(query);
        res.send(result);
     })

  app.post('/products',async(req,res)=>{
   const newProduct=req.body;
   console.log(newProduct);
   const result= await productCollection.insertOne(newProduct);
   res.send(result);

  })
  app.patch('/products/:id',async(req,res)=>{
    const id=req.params.id;
    const updatedProduct=req.body;
    const query={_id:new ObjectId(id)}
    const update={
        $set:{
            name:updatedProduct.name,
            price:updatedProduct.price
        }

    }
    const result=await productCollection.updateOne(query,update)
    res.send(result)
  } )
  app.delete('/products/:id',async(req,res)=>{
    const id=req.params.id;
    const query={_id:new ObjectId(id)}
    const result= await productCollection.deleteOne(query);
    res.send(result);
  })
//bids related apis
app.get('/bids',async(req,res)=>{
    const email=req.query.email;
    const query={};
    if(email){
        query.bidderEmail=email;
    }
    const cursor=bidsCollection.find(query);
    const result=await cursor.toArray();
    res.send(result);
})
app.post('/bids',async(req,res)=>{
    const newBid=req.body;
    const result=await bidsCollection.insertOne(newBid);
    res.send(result);
})
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
   }
   finally{

   } 

}
run().catch(console.dir)

app.listen(port,()=>{
    console.log(`book heaven is hello running on port: ${port}`)
})
const express = require("express")
const mongoose = require("mongoose")
const cors = require("cors")
const morgan = require("morgan")
const Feedback = require("./models/Feedback.models.js")
const Product = require("./models/Product.js")
const User = require("./models/User.js");
const Address = require("./models/Address.js");
const Order = require("./models/Order.js");
const Cart = require('./models/Cart.js');

const app = express()
const port = 3000

app.use(cors())
app.use(express.json())
app.use(morgan("dev"))
app.use(express.json());
app.use("/images", express.static("images"))

mongoose.connect("mongodb://127.0.0.1:27017/contactdb")
.then(()=> console.log("MongoDB connected"))
.catch(err => console.log(err))

app.get("/", (req,res)=>{
    res.send("Hello Restful API")
})

/* FEEDBACK */
app.post("/feedback", async (req,res)=>{
    try{
        const feedback = new Feedback(req.body)
        await feedback.save()
        res.json(feedback)
    }catch(err){
        res.status(500).json(err)
    }
})

app.get("/feedback", async (req,res)=>{
    try{
        const feedbacks = await Feedback.find()
        res.json(feedbacks)
    }catch(err){
        res.status(500).json(err)
    }
})
app.put("/feedback/:id", async (req,res)=>{
    try{
        const feedback = await Feedback.findByIdAndUpdate(
            req.params.id,
            req.body,
            {new:true}
        )
        res.json(feedback)
    }catch(err){
        res.status(500).json(err)
    }
})
app.delete("/feedback/:id", async (req,res)=>{
    try{
        await Feedback.findByIdAndDelete(req.params.id)
        res.json({message:"Feedback deleted"})
    }catch(err){
        res.status(500).json(err)
    }
})

app.post("/products", async (req, res) => {
  const product = new Product(req.body);
  const savedProduct = await product.save();
  res.json(savedProduct);
});

/* PRODUCTS */
app.get("/products", async (req, res) => {
  try {
    const products = await Product.find();
    res.json(products);
  } catch (err) {
    res.status(500).json(err);
  }
});

app.get("/products/:id", async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    res.json(product);
  } catch (err) {
    res.status(500).json(err);
  }
});

app.delete("/products/:id", async (req, res) => {
  await Product.findByIdAndDelete(req.params.id);
  res.json({ message: "Product deleted" });
});

/* USER */
app.post("/users", async (req, res) => {
  const user = new User(req.body);
  const result = await user.save();
  res.send(result);
});

app.post("/users/login", async (req, res) => {

  const { email, password } = req.body;

  const user = await User.findOne({
    email: email,
    password: password
  });

  if (!user) {
    return res.status(401).json({ message: "Sai email hoặc mật khẩu" });
  }

  res.json(user);

});

app.get("/users", async (req, res) => {
  const users = await User.find();
  res.send(users);
});

app.get("/users/:id", async (req, res) => {
  const user = await User.findById(req.params.id);
  res.send(user);
  const cart = await Cart.find({ userId });
  res.json(cart);
});

app.put("/users/:id", async (req, res) => {
  const user = await User.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true }
  )
  res.send(user);
});

app.delete("/users/:id", async (req, res) => {
  await User.findByIdAndDelete(req.params.id);
  res.send({ message: "User deleted" });
});

/* ADDRESS */
app.post("/addresses", async (req, res) => {
  const address = new Address(req.body);
  const savedAddress = await address.save();
  res.json(savedAddress);
});

app.get("/addresses/:userId", async (req, res) => {
  const address = await Address.findOne({ userId: req.params.userId });
  res.json(address);
});
app.put("/addresses/:id", async (req, res) => {
  const address = await Address.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true }
  );
  res.json(address);
});
app.delete("/addresses/:id", async (req, res) => {
  await Address.findByIdAndDelete(req.params.id);
  res.json({ message: "Address deleted" });
});

/* ORDER */
app.get("/orders", async (req, res) => {
  const orders = await Order.find().sort({ createdAt: -1 });
  res.json(orders);
});
app.get("/orders/user/:userId", async (req, res) => {
  const orders = await Order.find({ userId: req.params.userId });
  res.json(orders);
});
app.post("/orders", async (req, res) => {
  const order = new Order(req.body);
  await order.save();
  res.json(order);
});
app.put("/orders/:id/status", async (req, res) => {
  const order = await Order.findByIdAndUpdate(
    req.params.id,
    { status: req.body.status },
    { new: true }
  );
  res.json(order);
});
app.put("/orders/:id/cancel", async (req, res) => {
  const order = await Order.findByIdAndUpdate(
    req.params.id,
    { status: "cancelled" },
    { new: true }
  );
  res.json(order);
});
app.delete("/orders/:id", async (req, res) => {
  await Order.findByIdAndDelete(req.params.id);
  res.json({ message: "Order deleted" });
});

/* CART */
app.get("/cart", async (req, res) => {
  const cart = await Cart.find().sort({ createdAt: -1 });
  res.json(cart);
});
app.get("/cart/user/:userId", async (req, res) => {
  const cart = await Cart.find({ userId: req.params.userId });
  res.json(cart);
});
app.post("/cart", async (req, res) => {
  const { userId, name, price, quantity, image } = req.body;
  let item = await Cart.findOne({ userId, name });
    if (item) {
      item.quantity += quantity;
      await item.save();
    } else {
      item = new Cart({ userId, name, price, quantity, image });
      await item.save();
    }
  res.json(item);
});
app.put("/cart/:id", async (req, res) => {
  const item = await Cart.findByIdAndUpdate(
    req.params.id,
    { quantity: req.body.quantity },
    { new: true }
  );
  res.json(item);
});
app.delete("/cart/:id", async (req, res) => {
  await Cart.findByIdAndDelete(req.params.id);
  res.json({ message: "Item deleted" });
});
app.delete("/cart/user/:userId", async (req, res) => {
  await Cart.deleteMany({ userId: req.params.userId });
  res.json({ message: "Cart cleared" });
});


app.listen(port, ()=>{
    console.log(`Server running at http://localhost:${port}`)
})
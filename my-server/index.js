const express = require("express")
const mongoose = require("mongoose")
const cors = require("cors")
const morgan = require("morgan")
const multer = require("multer")
const path = require("path")
const fs = require("fs")
const Feedback = require("./models/Feedback.models.js")
const Product = require("./models/Product.js")
const User = require("./models/User.js");
const Address = require("./models/Address.js");
const Order = require("./models/Order.js");
const Cart = require('./models/Cart.js');

const app = express()
const port = 3000

app.use(cors())
app.use(express.json({ limit: "10mb" }))
app.use(express.urlencoded({ limit: "10mb", extended: true }))
app.use(morgan("dev"))
const imageDir = path.join(__dirname, "public", "images")
if (!fs.existsSync(imageDir)) {
  fs.mkdirSync(imageDir, { recursive: true })
}
app.use("/images", express.static(imageDir))

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, imageDir),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname)
    const base = path.basename(file.originalname, ext)
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
    cb(null, `${base || "image"}${ext}`)
  }
})

const upload = multer({ storage })

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

app.post("/upload-image", upload.single("image"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: "Chưa có file ảnh" })
  }

  const imageUrl = `${req.protocol}://${req.get("host")}/images/${req.file.filename}`
  res.json({
    fileName: req.file.filename,
    imageUrl
  })
})

function toSlug(text = "") {
  return text
    .toString()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

async function buildUniqueSlug(baseText, excludeId = null) {
  const base = toSlug(baseText) || `product-${Date.now()}`;
  let slug = base;
  let i = 1;

  while (
    await Product.exists(
      excludeId
        ? { slug, _id: { $ne: excludeId } }
        : { slug }
    )
  ) {
    slug = `${base}-${i++}`;
  }

  return slug;
}

app.post("/products", async (req, res) => {
  try {
    const payload = { ...req.body };
    if (!payload.slug) {
      payload.slug = await buildUniqueSlug(payload.product_name);
    }

    const product = new Product(payload);
    const savedProduct = await product.save();
    res.json(savedProduct);
  } catch (err) {
    res.status(500).json({
      message: "Tạo sản phẩm thất bại",
      error: err?.message || err
    });
  }
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
  try {
    await Product.findByIdAndDelete(req.params.id);
    res.json({ message: "Product deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.put("/products/:id", async (req, res) => {
  try {
    const payload = { ...req.body };
    if (!payload.slug && payload.product_name) {
      payload.slug = await buildUniqueSlug(payload.product_name, req.params.id);
    }

    const product = await Product.findByIdAndUpdate(
      req.params.id,
      payload,
      { new: true }
    );
    res.json(product);
  } catch (err) {
    res.status(500).json({
      message: "Cập nhật sản phẩm thất bại",
      error: err?.message || err
    });
  }
});

/* USER */
app.post("/users", async (req, res) => {
  try {
    const user = new User(req.body);
    const result = await user.save();
    res.send(result);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.post("/users/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email, password });
    if (!user) {
      return res.status(401).json({ message: "Sai email hoặc mật khẩu" });
    }
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.get("/users", async (req, res) => {
  try {
    const users = await User.find();
    res.send(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.get("/users/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    res.send(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.put("/users/:id", async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.send(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.delete("/users/:id", async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.send({ message: "User deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/* ADDRESS */
app.post("/addresses", async (req, res) => {
  try {
    const address = new Address(req.body);
    const savedAddress = await address.save();
    res.json(savedAddress);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.get("/addresses/:userId", async (req, res) => {
  try {
    const address = await Address.findOne({ userId: req.params.userId });
    res.json(address);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});
app.put("/addresses/:id", async (req, res) => {
  try {
    const address = await Address.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(address);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});
app.delete("/addresses/:id", async (req, res) => {
  try {
    await Address.findByIdAndDelete(req.params.id);
    res.json({ message: "Address deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/* ORDER */
app.get("/orders", async (req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});
app.get("/orders/user/:userId", async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.params.userId });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});
app.post("/orders", async (req, res) => {
  try {
    const order = new Order(req.body);
    await order.save();
    res.json(order);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});
app.put("/orders/:id/status", async (req, res) => {
  try {
    const order = await Order.findByIdAndUpdate(req.params.id, { status: req.body.status }, { new: true });
    res.json(order);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});
app.put("/orders/:id/cancel", async (req, res) => {
  try {
    const order = await Order.findByIdAndUpdate(req.params.id, { status: "cancelled" }, { new: true });
    res.json(order);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});
app.delete("/orders/:id", async (req, res) => {
  try {
    await Order.findByIdAndDelete(req.params.id);
    res.json({ message: "Order deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/* CART */
app.get("/cart", async (req, res) => {
  try {
    const cart = await Cart.find().sort({ createdAt: -1 });
    res.json(cart);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});
app.get("/cart/user/:userId", async (req, res) => {
  try {
    const cart = await Cart.find({ userId: req.params.userId });
    res.json(cart);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});
app.post("/cart", async (req, res) => {
  try {
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
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});
app.put("/cart/:id", async (req, res) => {
  try {
    const item = await Cart.findByIdAndUpdate(req.params.id, { quantity: req.body.quantity }, { new: true });
    res.json(item);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});
app.delete("/cart/:id", async (req, res) => {
  try {
    await Cart.findByIdAndDelete(req.params.id);
    res.json({ message: "Item deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});
app.delete("/cart/user/:userId", async (req, res) => {
  try {
    await Cart.deleteMany({ userId: req.params.userId });
    res.json({ message: "Cart cleared" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


app.listen(port, ()=>{
    console.log(`Server running at http://localhost:${port}`)
})
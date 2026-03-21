require('dotenv').config();
const express = require("express")
const mongoose = require("mongoose")
const cors = require("cors")
const morgan = require("morgan")
const multer = require("multer")
const path = require("path")
const fs = require("fs")
const bcrypt = require("bcrypt")
const crypto = require("crypto")
const nodemailer = require("nodemailer")
const Feedback = require("./models/Feedback.models.js")
const Product = require("./models/Product.js")
const User = require("./models/User.js");
const Address = require("./models/Address.js");
const Order = require("./models/Order.js");
const Cart = require('./models/Cart.js');
const Blog = require('./models/Blog.js');

const app = express()
const port = 3000

const FRONTEND_BASE_URL = process.env.FRONTEND_BASE_URL || "http://localhost:4200"
const PASSWORD_RESET_EXPIRES_MINUTES = Number(process.env.PASSWORD_RESET_EXPIRES_MINUTES || 15)
const SMTP_USER = process.env.SMTP_USER || ""
const SMTP_PASS = process.env.SMTP_PASS || ""

const mailTransport = SMTP_USER && SMTP_PASS
  ? nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: SMTP_USER,
        pass: SMTP_PASS,
      },
    })
  : null

function sha256(value) {
  return crypto.createHash("sha256").update(value).digest("hex")
}

async function sendPasswordResetEmail(toEmail, resetLink) {
  if (!mailTransport) {
    console.warn("[auth] SMTP_USER/SMTP_PASS is missing, skip sending reset email")
    return
  }

  await mailTransport.sendMail({
    from: SMTP_USER,
    to: toEmail,
    subject: "Dat lai mat khau",
    text: `Ban vua yeu cau dat lai mat khau. Link co hieu luc ${PASSWORD_RESET_EXPIRES_MINUTES} phut: ${resetLink}`,
    html: `<p>Ban vua yeu cau dat lai mat khau.</p><p>Link co hieu luc <b>${PASSWORD_RESET_EXPIRES_MINUTES} phut</b>:</p><p><a href="${resetLink}">${resetLink}</a></p>`,
  })
}

function sanitizeUser(userDoc) {
  if (!userDoc) return userDoc
  const user = userDoc.toObject ? userDoc.toObject() : { ...userDoc }
  delete user.password
  delete user.passwordResetTokenHash
  delete user.passwordResetExpiresAt
  return user
}

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

const mongoUri = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/contactdb";
mongoose.connect(mongoUri)
  .then(() => console.log("MongoDB connected to:", mongoUri))
  .catch(err => console.log("MongoDB connection error:", err));

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

async function buildUniqueBlogSlug(baseText, excludeId = null) {
  const base = toSlug(baseText) || `blog-${Date.now()}`;
  let slug = base;
  let i = 1;

  while (
    await Blog.exists(
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

/* BLOGS */
app.post("/blogs", async (req, res) => {
  try {
    const payload = { ...req.body };

    if (!payload.title || !payload.content) {
      return res.status(400).json({ message: "Thiếu tiêu đề hoặc nội dung bài viết" });
    }

    if (!payload.slug) {
      payload.slug = await buildUniqueBlogSlug(payload.title);
    } else {
      payload.slug = await buildUniqueBlogSlug(payload.slug);
    }

    if (payload.status === "published" && !payload.publishedAt) {
      payload.publishedAt = new Date();
    }

    if (typeof payload.tags === "string") {
      payload.tags = payload.tags
        .split(",")
        .map(tag => tag.trim())
        .filter(Boolean);
    }

    const blog = new Blog(payload);
    const savedBlog = await blog.save();
    res.status(201).json(savedBlog);
  } catch (err) {
    res.status(500).json({
      message: "Tạo bài viết thất bại",
      error: err?.message || err
    });
  }
});

app.get("/blogs", async (req, res) => {
  try {
    const { q, status, category, tag } = req.query;
    const filter = {};

    if (status) filter.status = status;
    if (category) filter.category = category;
    if (tag) filter.tags = tag;

    if (q) {
      filter.$or = [
        { title: { $regex: q, $options: "i" } },
        { excerpt: { $regex: q, $options: "i" } },
        { content: { $regex: q, $options: "i" } }
      ];
    }

    const blogs = await Blog.find(filter).sort({ createdAt: -1 });
    res.json(blogs);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.get("/blogs/:id", async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);
    if (!blog) {
      return res.status(404).json({ message: "Không tìm thấy bài viết" });
    }
    res.json(blog);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.put("/blogs/:id", async (req, res) => {
  try {
    const payload = { ...req.body };

    if (payload.title && !payload.slug) {
      payload.slug = await buildUniqueBlogSlug(payload.title, req.params.id);
    }

    if (payload.slug) {
      payload.slug = await buildUniqueBlogSlug(payload.slug, req.params.id);
    }

    if (payload.status === "published" && !payload.publishedAt) {
      payload.publishedAt = new Date();
    }

    if (typeof payload.tags === "string") {
      payload.tags = payload.tags
        .split(",")
        .map(tag => tag.trim())
        .filter(Boolean);
    }

    const blog = await Blog.findByIdAndUpdate(req.params.id, payload, { new: true });
    if (!blog) {
      return res.status(404).json({ message: "Không tìm thấy bài viết" });
    }

    res.json(blog);
  } catch (err) {
    res.status(500).json({
      message: "Cập nhật bài viết thất bại",
      error: err?.message || err
    });
  }
});

app.delete("/blogs/:id", async (req, res) => {
  try {
    const deleted = await Blog.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ message: "Không tìm thấy bài viết" });
    }

    res.json({ message: "Blog deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/* USER */
app.post("/users", async (req, res) => {
  try {
    const user = new User(req.body);
    const result = await user.save();
    res.send(sanitizeUser(result));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.post("/users/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user || !user.password) {
      return res.status(401).json({ message: "Sai email hoặc mật khẩu" });
    }

    let isPasswordValid = await bcrypt.compare(password, user.password);

    // Backward compatibility for old plain-text passwords in database.
    if (!isPasswordValid && password === user.password) {
      user.password = password;
      await user.save();
      isPasswordValid = true;
    }

    if (!isPasswordValid) {
      return res.status(401).json({ message: "Sai email hoặc mật khẩu" });
    }

    res.json(sanitizeUser(user));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.post("/users/forgot-password", async (req, res) => {
  try {
    const email = (req.body?.email || "").trim().toLowerCase();
    if (!email) {
      return res.status(400).json({ message: "Email la bat buoc" });
    }

    const user = await User.findOne({ email });

    if (user) {
      const rawToken = crypto.randomBytes(32).toString("hex");
      const tokenHash = sha256(rawToken);

      user.passwordResetTokenHash = tokenHash;
      user.passwordResetExpiresAt = new Date(Date.now() + PASSWORD_RESET_EXPIRES_MINUTES * 60 * 1000);
      await user.save();

      const resetLink = `${FRONTEND_BASE_URL}/reset-password?token=${encodeURIComponent(rawToken)}`;
      await sendPasswordResetEmail(user.email, resetLink);
    }

    return res.json({
      message: "Neu email ton tai, he thong da gui link dat lai mat khau.",
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.post("/users/reset-password", async (req, res) => {
  try {
    const token = (req.body?.token || "").trim();
    const newPassword = req.body?.newPassword || "";

    if (!token || !newPassword) {
      return res.status(400).json({ message: "Thieu token hoac mat khau moi" });
    }

    const hasMinLength = newPassword.length >= 8;
    const hasUppercase = /[A-Z]/.test(newPassword);
    const hasLowercase = /[a-z]/.test(newPassword);

    if (!hasMinLength || !hasUppercase || !hasLowercase) {
      return res.status(400).json({ message: "Mat khau moi chua dat yeu cau" });
    }

    const tokenHash = sha256(token);
    const user = await User.findOne({
      passwordResetTokenHash: tokenHash,
      passwordResetExpiresAt: { $gt: new Date() },
    });

    if (!user) {
      return res.status(400).json({ message: "Token khong hop le hoac da het han" });
    }

    user.password = newPassword;
    user.passwordResetTokenHash = null;
    user.passwordResetExpiresAt = null;
    await user.save();

    return res.json({ message: "Dat lai mat khau thanh cong" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.get("/users", async (req, res) => {
  try {
    const users = await User.find();
    res.send(users.map(sanitizeUser));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.get("/users/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    res.send(sanitizeUser(user));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.put("/users/:id", async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.send(sanitizeUser(user));
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
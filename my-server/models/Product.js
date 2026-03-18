const mongoose = require("mongoose");

const ProductSchema = new mongoose.Schema({

  product_name: {
    type: String,
    required: true
  },

  slug: {
    type: String,
    unique: true
  },

  // mô tả ngắn
  short_description: {
    type: String
  },

  // mô tả chi tiết
  description: {
    type: String
  },

  // giá
  unit_price: {
    type: Number,
    required: true
  },

  // giảm giá %
  discount: {
    type: Number,
    default: 0
  },

  // tổng số lượng
  stocked_quantity: {
    type: Number,
    default: 0
  },

  // size và stock theo size
  sizes: [
    {
      size: String,
      stock: Number
    }
  ],

  // danh sách ảnh
  images: [
    {
      type: String
    }
  ],

  // chất liệu
  material: {
    type: String
  },

  // xuất xứ
  origin: {
    type: String
  },

  // category
  product_dept: {
    type: String
  },

  rating: {
    type: Number,
    default: 4
  },

  createdAt: {
    type: Date,
    default: Date.now
  }

});

module.exports = mongoose.model("Product", ProductSchema);
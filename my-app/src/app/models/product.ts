export interface Product {

  _id: string

  product_name: string
  short_description?: string
  description?: string

  unit_price: number
  discount: number
  stocked_quantity: number

  product_dept: string
  rating: number

  material?: string
  origin?: string
  suitableFor?: string
  color?: string

  images?: string[]

  sizes?: {
    size: string
    stock: number
  }[]

}
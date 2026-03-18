export interface Product {

  _id: string

  product_name: string
  product_detail: string

  unit_price: number
  discount: number
  stocked_quantity: number

  product_dept: string
  rating: number

  images?: string[]

  sizes?: {
    size: string
    stock: number
  }[]

}
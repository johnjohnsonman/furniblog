import { ProductForm } from "@/components/admin/ProductForm"

export default function AdminNewProductPage() {
  return (
    <div className="p-8">
      <h1 className="font-serif text-2xl font-medium mb-8">Add Product</h1>
      <ProductForm />
    </div>
  )
}

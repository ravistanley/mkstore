import ProductForm from "../[id]/page";

export default function NewProductPage() {
    return <ProductForm params={Promise.resolve({ id: "new" })} />;
}


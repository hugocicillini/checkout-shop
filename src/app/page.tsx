import { ProductGrid } from "@/components/ProductGrid";

async function getProducts() {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/products`, {
      cache: "no-store",
    });

    if (!res.ok) throw new Error("Erro ao buscar produtos");
    return res.json();
  } catch (error) {
    console.error("Erro:", error);
    return [];
  }
}

export default async function Home() {
  const products = await getProducts();

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-gray-900">Loja Virtual</h1>
          <p className="text-gray-600 mt-2">Confira nossos produtos</p>
        </div>

        <ProductGrid products={products} />
      </div>
    </main>
  );
}

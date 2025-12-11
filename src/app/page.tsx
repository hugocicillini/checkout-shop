import { getProducts } from "@/actions/product.actions";
import { ProductGrid } from "@/components/products/ProductGrid";

export default async function Home() {
  const result = await getProducts();

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-gray-900">Loja Virtual</h1>
          <p className="text-gray-600 mt-2">Confira nossos produtos</p>
        </div>

        {result.success ? (
          result.data && result.data.length > 0 ? (
            <ProductGrid products={result.data} />
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">Nenhum produto disponível</p>
            </div>
          )
        ) : (
          <div className="text-center py-12">
            <p className="text-red-500 text-lg">{result.error}</p>
          </div>
        )}
      </div>
    </main>
  );
}

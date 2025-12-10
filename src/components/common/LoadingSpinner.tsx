"use client";

export function LoadingSpinner() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="inline-block h-8 w-8 rounded-full border-4 border-blue-200 border-t-blue-600 animate-spin mb-4" />
        <p className="text-lg text-gray-600">Carregando carrinho...</p>
      </div>
    </div>
  );
}

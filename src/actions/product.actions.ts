"use server";

import { prisma } from "@/lib/prisma";
import { createProductSchema, updateProductSchema } from "@/lib/validators/product";
import { revalidatePath } from "next/cache";
import { z } from "zod";

// Listar todos os produtos
export async function getProducts() {
  try {
    const products = await prisma.product.findMany({
      select: {
        id: true,
        name: true,
        description: true,
        price: true,
        quantity: true,
        image: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return { success: true, data: products };
  } catch (error) {
    console.error("Erro ao listar produtos:", error);
    return { success: false, error: "Erro ao listar produtos" };
  }
}

// Buscar um produto por ID
export async function getProductById(id: string) {
  try {
    const product = await prisma.product.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        description: true,
        price: true,
        quantity: true,
        image: true,
      },
    });

    if (!product) {
      return { success: false, error: "Produto não encontrado" };
    }

    return { success: true, data: product };
  } catch (error) {
    console.error("Erro ao buscar produto:", error);
    return { success: false, error: "Erro ao buscar produto" };
  }
}

// Criar produto
export async function createProduct(data: z.infer<typeof createProductSchema>) {
  try {
    // Validar com Zod
    const validatedData = createProductSchema.parse(data);

    const product = await prisma.product.create({
      data: {
        name: validatedData.name,
        description: validatedData.description || null,
        price: validatedData.price,
        quantity: validatedData.quantity,
        image: validatedData.image || null,
      },
    });

    // Revalidar cache
    revalidatePath("/");
    revalidatePath("/products");

    return { success: true, data: product };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: "Dados inválidos",
        details: error.message,
      };
    }

    console.error("Erro ao criar produto:", error);
    return { success: false, error: "Erro ao criar produto" };
  }
}

// Atualizar produto
export async function updateProduct(
  id: string,
  data: z.infer<typeof updateProductSchema>
) {
  try {
    const validatedData = updateProductSchema.parse(data);

    const product = await prisma.product.update({
      where: { id },
      data: validatedData,
    });

    revalidatePath("/");
    revalidatePath("/products");

    return { success: true, data: product };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: "Dados inválidos",
        details: error.message,
      };
    }

    console.error("Erro ao atualizar produto:", error);
    return { success: false, error: "Erro ao atualizar produto" };
  }
}

// Deletar produto
export async function deleteProduct(id: string) {
  try {
    await prisma.product.delete({
      where: { id },
    });

    revalidatePath("/");
    revalidatePath("/products");

    return { success: true };
  } catch (error) {
    console.error("Erro ao deletar produto:", error);
    return { success: false, error: "Erro ao deletar produto" };
  }
}

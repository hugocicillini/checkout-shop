"use server";

import { prisma } from "@/lib/prisma";
import { z } from "zod";

const createOrderSchema = z.object({
  userId: z.string(),
  items: z.array(
    z.object({
      productId: z.string(),
      quantity: z.number().min(1),
      priceAtOrder: z.number().min(0),
    })
  ),
  total: z.number().min(0),
  status: z.enum(["PENDING", "PROCESSING", "PAID", "FAILED", "CANCELLED"]).default("PENDING"),
});

// Criar pedido
export async function createOrder(data: z.infer<typeof createOrderSchema>) {
  try {
    const validatedData = createOrderSchema.parse(data);

    // Criar pedido com items
    const order = await prisma.order.create({
      data: {
        userId: validatedData.userId,
        total: validatedData.total,
        status: validatedData.status,
        items: {
          createMany: {
            data: validatedData.items.map((item) => ({
              productId: item.productId,
              quantity: item.quantity,
              priceAtOrder: item.priceAtOrder,
            })),
          },
        },
      },
      include: {
        items: true,
      },
    });

    return { success: true, data: order };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: "Dados inválidos",
        details: error.message,
      };
    }

    console.error("Erro ao criar pedido:", error);
    return { success: false, error: "Erro ao criar pedido" };
  }
}

// Buscar pedidos do usuário
export async function getUserOrders(userId: string) {
  try {
    const orders = await prisma.order.findMany({
      where: { userId },
      include: { items: true },
      orderBy: { createdAt: "desc" },
    });

    return { success: true, data: orders };
  } catch (error) {
    console.error("Erro ao buscar pedidos:", error);
    return { success: false, error: "Erro ao buscar pedidos" };
  }
}

import { z } from "zod";

export const createProductSchema = z.object({
  name: z
    .string()
    .min(1, "Nome é obrigatório")
    .min(3, "Nome deve ter pelo menos 3 caracteres"),
  description: z.string().optional().nullable(),
  price: z.number().positive("Preço deve ser positivo"),
  image: z.url("Imagem deve ser uma URL válida").optional().nullable(),
  quantity: z.number().int().nonnegative("Quantidade deve ser positiva"),
});

export const updateProductSchema = z.object({
  name: z.string().min(3, "Nome deve ter pelo menos 3 caracteres").optional(),
  description: z.string().optional().nullable(),
  price: z.number().positive("Preço deve ser positivo").optional(),
  quantity: z
    .number()
    .int()
    .nonnegative("Quantidade deve ser positiva")
    .optional(),
});

export type CreateProductInput = z.infer<typeof createProductSchema>;
export type UpdateProductInput = z.infer<typeof updateProductSchema>;

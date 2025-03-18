import { z } from "zod";

const baseSchema = z.object({
  name: z
    .string()
    .min(4)
    .regex(
      /^[a-z0-9-]+$/,
      "Name must be lowercase, without spaces, and can only contain letters, numbers, and hyphens"
    )
    .transform((val) => val.toLowerCase()),
  description: z
    .string()
    .min(10)
    .refine((val) => val.trim().split(/\s+/).length >= 2, {
      message: "Description must contain at least two words",
    }),
  dependencies: z.array(z.string()).optional().default([]),
  devDependencies: z.array(z.string()).optional().default([]),
});

export const templateSchema = baseSchema.extend({});

export const featureSchema = baseSchema.extend({});

export type Template = z.infer<typeof templateSchema>;
export type Feature = z.infer<typeof featureSchema>;

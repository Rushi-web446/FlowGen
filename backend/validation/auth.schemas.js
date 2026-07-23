const { z } = require("zod");

const signupSchema = z.object({
  body: z.object({
    name: z.string().trim().min(2).max(100),
    email: z.string().trim().email().max(254),
    password: z.string().min(8).max(128),
  }),
  params: z.object({}),
  query: z.object({}),
});

const loginSchema = z.object({
  body: z.object({
    email: z.string().trim().email().max(254),
    password: z.string().min(1).max(128),
  }),
  params: z.object({}),
  query: z.object({}),
});

module.exports = { signupSchema, loginSchema };

import { z } from 'zod';

// Login validation schema
export const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'Email richiesta')
    .email('Inserisci un\'email valida'),
  password: z
    .string()
    .min(1, 'Password richiesta')
    .min(6, 'La password deve avere almeno 6 caratteri')
});

// Registration validation schema
export const registerSchema = z.object({
  name: z
    .string()
    .min(1, 'Nome richiesto')
    .min(2, 'Il nome deve avere almeno 2 caratteri')
    .max(50, 'Il nome non può superare 50 caratteri'),
  email: z
    .string()
    .min(1, 'Email richiesta')
    .email('Inserisci un\'email valida'),
  password: z
    .string()
    .min(1, 'Password richiesta')
    .min(6, 'La password deve avere almeno 6 caratteri')
    .regex(/[A-Z]/, 'La password deve contenere almeno una lettera maiuscola')
    .regex(/[0-9]/, 'La password deve contenere almeno un numero'),
  confirmPassword: z
    .string()
    .min(1, 'Conferma la password'),
  phone: z
    .string()
    .optional()
    .refine(
      (val) => !val || /^(\+39)?\s?3\d{2}\s?\d{6,7}$/.test(val.replace(/\s/g, '')),
      'Inserisci un numero di telefono italiano valido'
    )
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Le password non corrispondono',
  path: ['confirmPassword']
});

// Contact validation schema
export const contactSchema = z.object({
  name: z
    .string()
    .min(1, 'Nome richiesto')
    .min(2, 'Il nome deve avere almeno 2 caratteri'),
  role: z
    .string()
    .min(1, 'Ruolo richiesto'),
  phone: z
    .string()
    .min(1, 'Telefono richiesto')
    .refine(
      (val) => /^(\+39)?\s?3\d{2}\s?\d{6,7}$/.test(val.replace(/\s/g, '')),
      'Inserisci un numero di telefono italiano valido'
    ),
  isEmergency: z.boolean().default(false)
});

// Saved place validation schema
export const savedPlaceSchema = z.object({
  name: z
    .string()
    .min(1, 'Nome richiesto')
    .min(2, 'Il nome deve avere almeno 2 caratteri'),
  address: z
    .string()
    .min(1, 'Indirizzo richiesto'),
  icon: z.enum(['home', 'work', 'gym', 'other']).default('other')
});

export type LoginFormData = z.infer<typeof loginSchema>;
export type RegisterFormData = z.infer<typeof registerSchema>;
export type ContactFormData = z.infer<typeof contactSchema>;
export type SavedPlaceFormData = z.infer<typeof savedPlaceSchema>;


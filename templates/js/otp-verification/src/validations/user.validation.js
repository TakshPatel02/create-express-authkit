import { email, z } from 'zod';

const signupSchema = z.object({
    name: z.string().min(3, 'Name must be at least 3 characters long.'),
    email: z.string().email('Invalid email address.'),
    password: z.string().min(6, 'Password must be at least 6 characters long.'),
});

const loginSchema = z.object({
    email: z.string().email('Invalid email address.'),
    password: z.string().min(6, 'Password must be at least 6 characters long.'),
})

const forgetPasswordSchema = z.object({
    email: z.string().email('Invalid email address.'),
});

const verifyOtpSchema = z.object({
    email: z.string().email('Invalid email address.'),
    otp: z.string().length(6, 'OTP must be 6 digits long.'),
});

const resetPasswordSchema = z.object({
    newPassword: z.string().min(6, 'New password must be at least 6 characters long.'),
});

export {
    signupSchema,
    loginSchema,
    forgetPasswordSchema,
    verifyOtpSchema,
    resetPasswordSchema
}
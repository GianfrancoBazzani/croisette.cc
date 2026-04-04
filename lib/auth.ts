import { betterAuth } from "better-auth";
import { passkey } from "@better-auth/passkey";
import { db } from "./db";

export const auth = betterAuth({
    database: db,
    baseURL: process.env.BETTER_AUTH_URL || process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000",
    trustedOrigins: ["http://localhost:3000", "https://croisette.cc", "https://www.croisette.cc"],
    emailAndPassword: {
        enabled: true
    },
    plugins: [
        passkey()
    ]
});

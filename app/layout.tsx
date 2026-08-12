import type React from "react"
import type { Metadata, Viewport } from "next"
import { Plus_Jakarta_Sans, Fraunces, Geist_Mono } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import { StoreProvider } from "@/lib/store"
import { AuthProvider } from "@/lib/auth"
import { GoogleAuthProvider } from "@/components/providers/google-auth-provider"
import { Toaster } from "@/components/ui/sonner"
import "./globals.css"

const jakarta = Plus_Jakarta_Sans({ subsets: ["latin"], variable: "--font-sans" })
const fraunces = Fraunces({ subsets: ["latin"], variable: "--font-serif" })
const geistMono = Geist_Mono({ subsets: ["latin"], variable: "--font-mono" })

export const metadata: Metadata = {
  title: "Gorib manush | Personal Finance Companion",
  description:
    "A calm, intelligent expense tracker that helps you understand your money, spend safely, and reach payday without stress.",
}

export const viewport: Viewport = {
  colorScheme: "light",
  themeColor: "#faf8f3",
  width: "device-width",
  initialScale: 1,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" data-scroll-behavior="smooth" className="light bg-background">
      <body className={`${jakarta.variable} ${fraunces.variable} ${geistMono.variable} font-sans antialiased`}>
        <GoogleAuthProvider>
          <AuthProvider>
            <StoreProvider>{children}</StoreProvider>
          </AuthProvider>
        </GoogleAuthProvider>
        <Toaster position="top-center" />
        {process.env.NODE_ENV === "production" && <Analytics />}
      </body>
    </html>
  )
}

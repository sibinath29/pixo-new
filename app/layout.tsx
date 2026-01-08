import type { Metadata } from "next";
import { Inter, Space_Grotesk } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { PageTransition } from "./providers";
import { CartProvider } from "@/contexts/CartContext";
import { AdminProvider } from "@/contexts/AdminContext";
import { AuthProvider } from "@/contexts/AuthContext";
import { UserProvider } from "@/contexts/UserContext";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });
const space = Space_Grotesk({ subsets: ["latin"], variable: "--font-space", display: "swap" });

export const metadata: Metadata = {
  title: "Pixo | Posters & Polaroids",
  description: "Futuristic posters and polaroids with cyan glow aesthetics.",
  icons: {
    icon: "/favicon.ico",
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${space.variable} bg-midnight text-white`}>
        <AuthProvider>
          <UserProvider>
            <AdminProvider>
              <CartProvider>
                <Header />
                <PageTransition>
                  <main 
                    className="max-w-6xl mx-auto px-3 sm:px-4 pb-12 sm:pb-16 pt-20 sm:pt-24 md:pt-28"
                    style={{ 
                      willChange: "scroll-position",
                      transform: "translateZ(0)",
                      WebkitTransform: "translateZ(0)"
                    }}
                  >
                    {children}
                  </main>
                </PageTransition>
                <Footer />
              </CartProvider>
            </AdminProvider>
          </UserProvider>
        </AuthProvider>
      </body>
    </html>
  );
}


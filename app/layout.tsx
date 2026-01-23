import "./globals.css";
import { Nunito_Sans } from "next/font/google";
import { AuthProvider } from "@/components/context/AuthProvider";
import AuthGate from "@/components/context/AuthGate";
import Providers from "@/components/Providers";

const nunitoSans = Nunito_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${nunitoSans.variable} font-sans`}>
        <Providers>
          <AuthProvider>
            <AuthGate>{children}</AuthGate>
          </AuthProvider>
        </Providers>
      </body>
    </html>
  );
}

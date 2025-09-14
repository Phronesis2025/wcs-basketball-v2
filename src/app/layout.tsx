import "./globals.css";
import Navbar from "@/components/Navbar";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <Navbar />
        {children}
        <footer className="bg-navy py-4 text-center">
          <p className="text-base">
            © 2025 WCS Basketball | Contact: info@wcsbasketball.com
          </p>
        </footer>
      </body>
    </html>
  );
}

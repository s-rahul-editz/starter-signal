import "./globals.css";

export const metadata = {
  title: "Starter Signal — Indian Railways, journey by journey",
  description: "Train reviews, route guides, news, tips, and photography from across Indian Railways.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <header className="site-header">
          <a href="/" className="wordmark">Starter Signal<span className="dot">.</span></a>
        </header>
        <main>{children}</main>
      </body>
    </html>
  );
}

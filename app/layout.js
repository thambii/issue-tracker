import "./globals.css";

export const metadata = {
  title: "Issue Tracker",
  description: "Create, assign and track issues",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

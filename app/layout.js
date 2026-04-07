import './globals.css';

export const metadata = {
  title: 'Campus Brain — AI-Powered Study Network',
  description: 'A unified academic knowledge network with AI-augmented retrieval.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

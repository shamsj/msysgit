export const metadata = {
  title: 'AutoReach - Sell Your Car to Competing Dealers',
  description: 'Upload your car photo and get competing offers from dealers',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body style={{ margin: 0, fontFamily: 'system-ui, -apple-system, sans-serif', backgroundColor: '#f5f5f5' }}>
        {children}
      </body>
    </html>
  );
}

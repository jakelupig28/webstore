import './globals.css';
import { StoreProvider } from '../context/StoreContext';
import { Navbar } from '../components/Navbar';
import { BottomNav } from '../components/BottomNav';

export const metadata = {
  title: 'LARO SPORTS™ — WE ONLY COME OUT AT NIGHT',
  description:
    'LARO SPORTS official webstore. Pain Stain Collection 2025. Premium heavyweight street apparel, jerseys, and accessories crafted for night owls.',
  icons: {
    icon: '/favicon.ico',
    shortcut: '/brand/icon3.png'
  },
  openGraph: {
    title: 'LARO SPORTS™ — PAIN STAIN 2025',
    description:
      'Official Store of LARO SPORTS. WE ONLY COME OUT AT NIGHT.',
    images: ['/brand/background stash.jpg'],
    type: 'website'
  }
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700;900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <StoreProvider>
          <Navbar />
          {children}
          <BottomNav />
        </StoreProvider>
      </body>
    </html>
  );
}

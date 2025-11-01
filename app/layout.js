import './globals.css';
import { AuthProvider } from '@/context/AuthContext';

export const metadata = {
  title: 'PresenceHQ',
  description: 'Presence Management Platform',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="bg-presence-dark text-presence-light min-h-screen w-screen overflow-x-hidden m-0 p-0">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}

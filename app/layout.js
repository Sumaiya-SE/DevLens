import './globals.css'

export const metadata = {
  title: 'GitHub Profile Viewer',
  description: 'View GitHub profiles and repositories',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}

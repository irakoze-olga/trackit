/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
<<<<<<< HEAD
  },
  async rewrites() {
    return [
      {
        source: '/api/v1/:path*',
        destination: 'http://localhost:5000/api/v1/:path*',
      },
    ]
  },
=======
  }
>>>>>>> 844f25bde1b009521ef4ff56a4e8de3314c0f183
}

export default nextConfig

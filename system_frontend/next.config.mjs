// next.config.js
const nextConfig = {
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'api.dicebear.com', // Allow images from this domain
                port: '',
                pathname: '/**', // Allow all paths under this domain
            },
        ],
        domains: ['localhost'], // Add localhost to the list of allowed image domains
        dangerouslyAllowSVG: true, // Enable rendering of SVG images
    },
};

export default nextConfig;

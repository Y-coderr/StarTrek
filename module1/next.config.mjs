/**
 * @type {import('next').NextConfig}
 */
const nextConfig={
        experimental: {
                appDir: true,
        },
        env: {
                AZURE_FACE_ENDPOINT: process.env.AZURE_FACE_ENDPOINT,
                AZURE_FACE_KEY: process.env.AZURE_FACE_KEY,
        },
};

export default nextConfig;

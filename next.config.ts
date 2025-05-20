import type { NextConfig } from "next";

const nextConfig: NextConfig = {
	images: {
		remotePatterns: [
			{
				protocol: 'https', // veya 'http' (Jotform linki https ile başlıyor)
				hostname: 'www.jotform.com', // İzin verilecek alan adı
				// port: '', // Genellikle gerekmez
				// pathname: '/widget-uploads/**', // Daha spesifik bir yol tanımlamak isterseniz
			},
			{
				protocol: 'https',
				hostname: 'drive.google.com',
			},
			{
				protocol: 'https',
				hostname: 'lh3.googleusercontent.com',
			},
			// Gelecekte başka alan adlarından resim kullanırsanız buraya ekleyebilirsiniz
		],
	},
};

export default nextConfig;

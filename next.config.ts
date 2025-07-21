import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // VercelやNext.jsのビルド時にNode.jsモジュール参照エラーを防ぐ
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve = config.resolve || {};
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        path: false,
      };
    }
    return config;
  },
};

export default nextConfig;

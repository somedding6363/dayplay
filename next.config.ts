import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // 로그인 provider의 프로필 사진. provider를 추가하면 그 이미지 주소도 넣는다.
    remotePatterns: [new URL("https://lh3.googleusercontent.com/**")],
  },
};

export default nextConfig;

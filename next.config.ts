import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // next dev는 localhost 밖에서 온 요청의 개발용 JS·HMR을 막는다. 같은 와이파이의 폰으로 개발 서버에 접속해
  // 확인할 수 있도록 내부망 주소(192.168.x.x)를 허용한다. 프로덕션 빌드에는 영향이 없다.
  allowedDevOrigins: ["192.168.*.*"],
  images: {
    // 로그인 provider의 프로필 사진. provider를 추가하면 그 이미지 주소도 넣는다.
    remotePatterns: [new URL("https://lh3.googleusercontent.com/**")],
  },
};

export default nextConfig;

import { ImageResponse } from "next/og";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: 32,
          height: 32,
          borderRadius: 9,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #1C6CFF 0%, #7B3FF2 100%)",
        }}
      >
        <svg width="22" height="22" viewBox="0 0 40 40" fill="none">
          <path d="M13 10.5C9.2 12.6 6.6 16 5.6 20.2" stroke="white" strokeWidth="2.6" strokeLinecap="round" />
          <path d="M27 10.5c3.8 2.1 6.4 5.5 7.4 9.7" stroke="white" strokeWidth="2.6" strokeLinecap="round" />
          <path
            d="M11.5 30c2.4 2.6 5.2 3.9 8.5 3.9s6.1-1.3 8.5-3.9"
            stroke="white"
            strokeWidth="2.6"
            strokeLinecap="round"
          />
          <circle cx="20" cy="11.2" r="4.4" fill="white" />
          <path d="M12.4 24.6a7.6 7.6 0 0 1 15.2 0v1.4h-15.2z" fill="white" />
          <circle cx="10.6" cy="24.4" r="3.6" fill="white" />
          <path d="M4.4 35.6a6.2 6.2 0 0 1 12.4 0v1h-12.4z" fill="white" />
          <circle cx="29.4" cy="24.4" r="3.6" fill="white" />
          <path d="M23.2 35.6a6.2 6.2 0 0 1 12.4 0v1h-12.4z" fill="white" />
        </svg>
      </div>
    ),
    size
  );
}

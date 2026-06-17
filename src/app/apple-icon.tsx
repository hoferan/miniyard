import { ImageResponse } from 'next/og'

export const size = { width: 180, height: 180 }
export const contentType = 'image/png'

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#0f766e',
          borderRadius: 38,
        }}
      >
        <span
          style={{
            color: 'white',
            fontSize: 108,
            fontWeight: 700,
            letterSpacing: '-3px',
            fontFamily: 'sans-serif',
          }}
        >
          m
        </span>
      </div>
    ),
    { ...size },
  )
}

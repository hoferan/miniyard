import { ImageResponse } from 'next/og'

export const dynamic = 'force-static'

export function GET() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #a78bfa, #7c6cff)',
          borderRadius: 40,
        }}
      >
        <span
          style={{
            color: 'white',
            fontSize: 115,
            fontWeight: 700,
            letterSpacing: '-3px',
            fontFamily: 'sans-serif',
          }}
        >
          m
        </span>
      </div>
    ),
    { width: 192, height: 192 },
  )
}

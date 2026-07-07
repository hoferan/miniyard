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
          borderRadius: 108,
        }}
      >
        <span
          style={{
            color: 'white',
            fontSize: 307,
            fontWeight: 700,
            letterSpacing: '-8px',
            fontFamily: 'sans-serif',
          }}
        >
          m
        </span>
      </div>
    ),
    { width: 512, height: 512 },
  )
}

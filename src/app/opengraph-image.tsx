import { ImageResponse } from 'next/og'

export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#f5f3ff',
          gap: 24,
        }}
      >
        <div
          style={{
            width: 96,
            height: 96,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'linear-gradient(135deg, #a78bfa, #7c6cff)',
            borderRadius: 20,
          }}
        >
          <span
            style={{
              color: 'white',
              fontSize: 60,
              fontWeight: 700,
              fontFamily: 'sans-serif',
              letterSpacing: '-2px',
            }}
          >
            m
          </span>
        </div>
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 12,
          }}
        >
          <span
            style={{
              fontSize: 72,
              fontWeight: 700,
              color: '#2e1065',
              fontFamily: 'sans-serif',
              letterSpacing: '-2px',
            }}
          >
            miniyard
          </span>
          <span
            style={{
              fontSize: 28,
              color: '#7c6cff',
              fontFamily: 'sans-serif',
            }}
          >
            A modular playground for useful tools and mini games.
          </span>
        </div>
      </div>
    ),
    { ...size },
  )
}

import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const alt = 'Memora – Custom Photo Magnets';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

const polaroid = (rotate: string, emoji: string, label: string) => (
  <div
    style={{
      display: 'flex',
      flexDirection: 'column',
      background: '#ffffff',
      padding: '12px 12px 34px 12px',
      borderRadius: 8,
      boxShadow: '0 20px 50px rgba(0,0,0,0.30)',
      transform: `rotate(${rotate})`,
    }}
  >
    <div
      style={{
        width: 190,
        height: 143,
        borderRadius: 4,
        background: 'linear-gradient(135deg, #FFD3E5 0%, #BFD7FF 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: 72,
      }}
    >
      {emoji}
    </div>
    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
        marginTop: 10,
        fontSize: 18,
        fontStyle: 'italic',
        color: '#a8a29e',
      }}
    >
      {label}
    </div>
  </div>
);

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          background: '#0066FF',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 80px',
          fontFamily: 'sans-serif',
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', maxWidth: 620 }}>
          <div style={{ fontSize: 40, fontWeight: 700, color: '#BFD7FF', letterSpacing: -1 }}>
            Memora
          </div>
          <div
            style={{
              fontSize: 76,
              fontWeight: 800,
              color: '#ffffff',
              lineHeight: 1.08,
              letterSpacing: -3,
              marginTop: 10,
            }}
          >
            Your photos, on your fridge
          </div>
          <div style={{ fontSize: 30, color: '#D6E4FF', marginTop: 26 }}>
            Custom photo magnets · Free US shipping · From $4.99
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginRight: 20 }}>
          {polaroid('6deg', '🏖️', "Summer '25")}
          <div style={{ display: 'flex', marginTop: -30, marginLeft: -60 }}>
            {polaroid('-7deg', '🎉', 'Best night')}
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}

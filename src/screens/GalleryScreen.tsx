// ===== GALLERY SCREEN (placeholder) =====
export default function GalleryScreen() {
  return (
    <>
      <header style={{ padding: '16px 16px 8px' }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: 'var(--text-bright)' }}>Photos</h1>
        <p style={{ fontSize: 13, color: 'var(--text-dim)' }}>All photos from your grows</p>
      </header>
      <div className="scroll-area">
        <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-dim)' }}>
          📸 Gallery coming soon
        </div>
      </div>
    </>
  );
}

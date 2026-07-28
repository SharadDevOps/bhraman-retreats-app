export default function HomepageLoading() {
  return (
    <main className="homepage-skeleton" aria-busy="true" aria-label="Loading Bhraman Retreats">
      <div className="skeleton skeleton-hero" />
      {Array.from({ length: 6 }, (_, index) => (
        <section className="skeleton-section" key={index}>
          <span className="skeleton skeleton-label" />
          <span className="skeleton skeleton-heading" />
          <span className="skeleton skeleton-copy" />
        </section>
      ))}
    </main>
  );
}

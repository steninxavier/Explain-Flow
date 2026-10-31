import { fixtureBrand, fixtureStoryPlan } from "@/lib/story-plan.fixture";

export default function Home() {
  return (
    <main>
      <section className="hero">
        <p className="eyebrow">ExplainFlow / Prototype 0</p>
        <h1>From idea to clear video.</h1>
        <p className="lede">
          This local rendering spike proves a reliable branded 720p explainer before the
          product dashboard is built.
        </p>
      </section>

      <section className="card-grid" aria-label="Prototype status">
        <article className="card">
          <p className="label">Fixture</p>
          <h2>{fixtureStoryPlan.title}</h2>
          <p>{fixtureStoryPlan.scenes.length} scenes · {fixtureStoryPlan.targetDurationSeconds} seconds · {fixtureStoryPlan.language.toUpperCase()}</p>
        </article>
        <article className="card">
          <p className="label">Render target</p>
          <h2>1280 × 720 MP4</h2>
          <p>16:9 landscape · 30 FPS · captions and motion graphics</p>
        </article>
        <article className="card">
          <p className="label">Brand fixture</p>
          <h2>{fixtureBrand.colors.join(" · ")}</h2>
          <p>Creator-selected colours; no stock media or fixed product branding.</p>
        </article>
      </section>

      <section className="next-step">
        <p className="label">Developer command</p>
        <code>npm run render:fixture</code>
        <p>Writes the local MP4 to <code>output/how-rain-forms-visual-story-de.mp4</code>.</p>
      </section>
    </main>
  );
}

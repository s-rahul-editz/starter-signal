export const metadata = { title: "About — Starter Signal" };

export default function AboutPage() {
  return (
    <div className="container" style={{ paddingTop: 40, paddingBottom: 60, maxWidth: 680 }}>
      <div className="eyebrow">About</div>
      <h1 style={{ fontSize: 30, margin: "8px 0 20px" }}>About Starter Signal</h1>
      <p style={{ fontSize: 17, lineHeight: 1.8, marginBottom: 16 }}>
        Starter Signal covers Indian Railways — journeys, route guides, news, tips, and
        photography from across the network. Edit this page to tell your own story.
      </p>
    </div>
  );
}

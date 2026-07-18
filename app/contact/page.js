export const metadata = { title: "Contact — Starter Signal" };

export default function ContactPage() {
  return (
    <div className="container" style={{ paddingTop: 40, paddingBottom: 60, maxWidth: 680 }}>
      <div className="eyebrow">Contact</div>
      <h1 style={{ fontSize: 30, margin: "8px 0 20px" }}>Get in touch</h1>
      <p style={{ fontSize: 17, lineHeight: 1.8 }}>
        Reach out at <a href="mailto:hello@example.com" style={{ color: "var(--maroon)" }}>hello@example.com</a> — replace with your real address.
      </p>
    </div>
  );
}

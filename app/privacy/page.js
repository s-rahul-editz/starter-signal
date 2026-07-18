export const metadata = { title: "Privacy Policy — Starter Signal" };

export default function PrivacyPage() {
  return (
    <div className="container" style={{ paddingTop: 40, paddingBottom: 60, maxWidth: 680 }}>
      <div className="eyebrow">Privacy</div>
      <h1 style={{ fontSize: 30, margin: "8px 0 20px" }}>Privacy Policy</h1>
      <p style={{ fontSize: 17, lineHeight: 1.8, marginBottom: 16 }}>
        This site collects minimal data: basic analytics on page visits, and any email
        address you voluntarily provide via the contact page or a future newsletter signup.
        We do not sell or share personal data with third parties.
      </p>
      <p style={{ fontSize: 17, lineHeight: 1.8, marginBottom: 16 }}>
        Route, fare, and schedule information on this site may change — always verify
        details with official IRCTC or Indian Railways sources before travel.
      </p>
      <p style={{ fontSize: 15, color: "var(--steel)" }}>
        This is placeholder text — replace with your actual policy before public launch.
      </p>
    </div>
  );
}

// /grievance-officer — required disclosure under India's IT (Intermediary
// Guidelines) Rules, 2021. The named officer/contact is a real operational
// detail that must be filled in by the company before launch — this is a
// structural placeholder, not a fabricated name, so it deliberately says
// "to be appointed" rather than inventing a person.
export default function GrievanceOfficerPage() {
  return (
    <main className="mx-auto max-w-2xl px-6 py-24">
      <h1 className="text-3xl font-bold text-white">Grievance Officer</h1>
      <p className="mt-2 text-sm text-slate-500">
        Placeholder — the officer named below has not been appointed yet; update this page with real
        details before launch.
      </p>

      <div className="mt-8 space-y-6 text-sm text-slate-400">
        <section>
          <h2 className="font-semibold text-white">Grievance redressal</h2>
          <p className="mt-1">
            In accordance with the Information Technology (Intermediary Guidelines and Digital Media
            Ethics Code) Rules, 2021, complaints regarding content or conduct on Vidlix can be raised
            with the Grievance Officer below.
          </p>
        </section>
        <section>
          <h2 className="font-semibold text-white">Contact</h2>
          <p className="mt-1">
            Name: <em>to be appointed</em><br />
            Email: grievance@vidlix.in<br />
            Response time: acknowledged within 24 hours, resolved within 15 days, per the Rules.
          </p>
        </section>
        <section>
          <h2 className="font-semibold text-white">Escalating a dispute</h2>
          <p className="mt-1">
            For campaign or payout disputes specifically, use the in-dashboard dispute flow first —
            it reaches the platform team directly and faster. The Grievance Officer is for complaints
            about content, conduct, or the platform itself.
          </p>
        </section>
      </div>
    </main>
  );
}

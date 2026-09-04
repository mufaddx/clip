/**
 * Inline-styled HTML for transactional emails — table/div layout with only
 * inline styles (no <style> block, no flexbox/grid) since that's what
 * actually renders consistently across Gmail/Outlook/etc. Referencing the
 * logo via its public URL (https://vidlix.in/logo-wordmark.png) rather than
 * embedding it, which is the standard pattern for transactional email.
 */
export function otpEmailTemplate(params: { code: string; heading: string }): string {
  const year = new Date().getFullYear();
  return `
<div style="background-color:#f4f4f7;padding:40px 16px;font-family:Helvetica,Arial,sans-serif;">
  <div style="max-width:440px;margin:0 auto;background:#ffffff;border-radius:12px;overflow:hidden;border:1px solid #e5e7eb;">
    <div style="padding:28px 40px;text-align:center;border-bottom:1px solid #f1f5f9;">
      <img src="https://vidlix.in/logo-wordmark.png" alt="Vidlix" height="24" style="height:24px;border:0;display:inline-block;" />
    </div>
    <div style="padding:36px 40px 8px;text-align:center;">
      <p style="margin:0 0 4px;color:#475569;font-size:15px;">${params.heading}</p>
      <div style="margin:24px 0;padding:16px 24px;background:#EEF2FF;border-radius:10px;display:inline-block;">
        <span style="font-size:32px;font-weight:700;letter-spacing:10px;color:#4F46E5;">${params.code}</span>
      </div>
      <p style="margin:8px 0 32px;color:#94a3b8;font-size:13px;line-height:1.5;">
        This code expires in 10 minutes.<br />If you didn't request this, you can safely ignore this email.
      </p>
    </div>
    <div style="padding:16px 40px;background:#f8fafc;text-align:center;">
      <p style="margin:0;color:#94a3b8;font-size:12px;">© ${year} Vidlix</p>
    </div>
  </div>
</div>`.trim();
}

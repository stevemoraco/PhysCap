// Email template component for personalized investment reports
// Uses inline styles for maximum email client compatibility

export interface ReportEmailProps {
  userName: string;
  visitSummary: string;
  recommendedProjects: Array<{
    id: string;
    name: string;
    description: string;
    matchScore: number;
  }>;
  reportUrl: string;
  userEmail: string;
  expertise: string;
}

export function ReportEmailTemplate({
  userName,
  visitSummary,
  recommendedProjects,
  reportUrl,
  expertise,
}: ReportEmailProps) {
  return (
    <html lang="en">
      <head>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Your Physical.Capital Experience Summary</title>
      </head>
      <body style={{ backgroundColor: '#0a2e2c', fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif', margin: 0, padding: '20px' }}>
        <div style={{ maxWidth: '600px', margin: '0 auto', backgroundColor: '#ffffff', borderRadius: '8px', overflow: 'hidden' }}>
          {/* Header */}
          <div style={{ background: 'linear-gradient(135deg, #0a2e2c 0%, #1a5450 100%)', padding: '40px 20px', textAlign: 'center' }}>
            <h1 style={{ color: '#d4af37', fontSize: '28px', fontWeight: 'bold', margin: '0 0 8px 0' }}>
              Physical.Capital
            </h1>
            <p style={{ color: '#50c878', fontSize: '14px', fontStyle: 'italic', margin: 0 }}>
              Infrastructure Investment Intelligence
            </p>
          </div>

          {/* Content */}
          <div style={{ padding: '40px 30px' }}>
            <h2 style={{ color: '#0a2e2c', fontSize: '24px', marginBottom: '10px' }}>
              Dear {userName},
            </h2>

            <p style={{ color: '#2c3e50', fontSize: '16px', lineHeight: '1.6', marginBottom: '20px' }}>
              Thank you for exploring our infrastructure investment opportunities. Based on your
              <strong> {expertise}</strong> expertise and interactions, we've prepared this personalized analysis.
            </p>

            {/* Visit Summary */}
            <div style={{ backgroundColor: '#f8f9fa', padding: '20px', borderLeft: '4px solid #d4af37', marginBottom: '30px' }}>
              <h3 style={{ color: '#0a2e2c', fontSize: '18px', marginTop: 0, marginBottom: '10px' }}>
                Your Visit Summary
              </h3>
              <p style={{ color: '#2c3e50', fontSize: '14px', lineHeight: '1.6', margin: 0 }}>
                {visitSummary}
              </p>
            </div>

            {/* Recommended Projects */}
            {recommendedProjects.length > 0 && (
              <div style={{ marginBottom: '30px' }}>
                <h3 style={{ color: '#0a2e2c', fontSize: '20px', marginBottom: '15px' }}>
                  Projects Matching Your Expertise
                </h3>
                {recommendedProjects.map((project, idx) => (
                  <div
                    key={project.id}
                    style={{
                      backgroundColor: '#f0f8ff',
                      padding: '15px',
                      borderRadius: '6px',
                      marginBottom: '12px',
                      border: '1px solid #d4af37'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                      <h4 style={{ color: '#0a2e2c', fontSize: '16px', margin: 0 }}>
                        {project.name}
                      </h4>
                      <span style={{
                        backgroundColor: '#50c878',
                        color: 'white',
                        padding: '4px 12px',
                        borderRadius: '12px',
                        fontSize: '12px',
                        fontWeight: 'bold'
                      }}>
                        {project.matchScore}% Match
                      </span>
                    </div>
                    <p style={{ color: '#2c3e50', fontSize: '14px', lineHeight: '1.5', margin: 0 }}>
                      {project.description}
                    </p>
                  </div>
                ))}
              </div>
            )}

            {/* CTA Button */}
            <div style={{ textAlign: 'center', margin: '40px 0' }}>
              <a
                href={reportUrl}
                style={{
                  display: 'inline-block',
                  backgroundColor: '#d4af37',
                  color: '#0a2e2c',
                  padding: '14px 32px',
                  textDecoration: 'none',
                  borderRadius: '6px',
                  fontWeight: 'bold',
                  fontSize: '16px'
                }}
              >
                View Full Report
              </a>
            </div>

            {/* Next Steps */}
            <div style={{ backgroundColor: '#f8f9fa', padding: '20px', borderRadius: '6px', marginTop: '30px' }}>
              <h3 style={{ color: '#0a2e2c', fontSize: '16px', marginTop: 0, marginBottom: '12px' }}>
                Next Steps:
              </h3>
              <ul style={{ color: '#2c3e50', fontSize: '14px', lineHeight: '1.8', paddingLeft: '20px', margin: 0 }}>
                <li>Schedule a consultation with our investment team</li>
                <li>Request detailed financial models and projections</li>
                <li>Join our quarterly investor webinar series</li>
                <li>Explore partnership opportunities</li>
              </ul>
            </div>
          </div>

          {/* Footer */}
          <div style={{ backgroundColor: '#f8f9fa', padding: '30px 20px', textAlign: 'center', borderTop: '2px solid #e9ecef' }}>
            <p style={{ color: '#6c757d', fontSize: '13px', lineHeight: '1.6', margin: '0 0 15px 0' }}>
              This analysis was AI-generated based on your profile and interactions. For detailed investment
              information, financial disclosures, and partnership opportunities, please visit our platform or
              contact our team directly.
            </p>

            <p style={{ color: '#0a2e2c', fontSize: '14px', fontWeight: 'bold', margin: '15px 0 5px 0' }}>
              Physical.Capital
            </p>
            <p style={{ color: '#6c757d', fontSize: '12px', margin: 0 }}>
              Building tomorrow's infrastructure, today.
            </p>
          </div>
        </div>
      </body>
    </html>
  );
}

// Export as string for email sending
export function renderReportEmail(props: ReportEmailProps): string {
  // Simple template literal version for server-side rendering
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Your Physical.Capital Experience Summary</title>
</head>
<body style="background-color: #0a2e2c; font-family: Inter, -apple-system, BlinkMacSystemFont, sans-serif; margin: 0; padding: 20px;">
  <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; overflow: hidden;">
    <div style="background: linear-gradient(135deg, #0a2e2c 0%, #1a5450 100%); padding: 40px 20px; text-align: center;">
      <h1 style="color: #d4af37; font-size: 28px; font-weight: bold; margin: 0 0 8px 0;">Physical.Capital</h1>
      <p style="color: #50c878; font-size: 14px; font-style: italic; margin: 0;">Infrastructure Investment Intelligence</p>
    </div>

    <div style="padding: 40px 30px;">
      <h2 style="color: #0a2e2c; font-size: 24px; margin-bottom: 10px;">Dear ${props.userName},</h2>

      <p style="color: #2c3e50; font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
        Thank you for exploring our infrastructure investment opportunities. Based on your
        <strong>${props.expertise}</strong> expertise, we've prepared this personalized analysis.
      </p>

      <div style="background-color: #f8f9fa; padding: 20px; border-left: 4px solid #d4af37; margin-bottom: 30px;">
        <h3 style="color: #0a2e2c; font-size: 18px; margin-top: 0; margin-bottom: 10px;">Your Visit Summary</h3>
        <p style="color: #2c3e50; font-size: 14px; line-height: 1.6; margin: 0;">${props.visitSummary}</p>
      </div>

      ${props.recommendedProjects.length > 0 ? `
      <div style="margin-bottom: 30px;">
        <h3 style="color: #0a2e2c; font-size: 20px; margin-bottom: 15px;">Projects Matching Your Expertise</h3>
        ${props.recommendedProjects.map(project => `
          <div style="background-color: #f0f8ff; padding: 15px; border-radius: 6px; margin-bottom: 12px; border: 1px solid #d4af37;">
            <h4 style="color: #0a2e2c; font-size: 16px; margin: 0 0 8px 0;">${project.name}</h4>
            <p style="color: #2c3e50; font-size: 14px; line-height: 1.5; margin: 0;">${project.description}</p>
          </div>
        `).join('')}
      </div>
      ` : ''}

      <div style="text-align: center; margin: 40px 0;">
        <a href="${props.reportUrl}" style="display: inline-block; background-color: #d4af37; color: #0a2e2c; padding: 14px 32px; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 16px;">View Full Report</a>
      </div>
    </div>

    <div style="background-color: #f8f9fa; padding: 30px 20px; text-align: center; border-top: 2px solid #e9ecef;">
      <p style="color: #6c757d; font-size: 13px; margin: 0 0 15px 0;">
        This analysis was AI-generated based on your profile. For detailed investment information, please visit our platform.
      </p>
      <p style="color: #0a2e2c; font-size: 14px; font-weight: bold; margin: 15px 0 5px 0;">Physical.Capital</p>
      <p style="color: #6c757d; font-size: 12px; margin: 0;">Building tomorrow's infrastructure, today.</p>
    </div>
  </div>
</body>
</html>
  `.trim();
}

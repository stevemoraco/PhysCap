import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export interface InvestmentReportEmail {
  to: string;
  userName: string;
  reportContent: string;
  expertise: string;
  projectsInterested: string[];
}

export async function sendInvestmentReport(data: InvestmentReportEmail): Promise<boolean> {
  if (!process.env.RESEND_API_KEY) {
    console.warn('RESEND_API_KEY not configured - skipping email send');
    return false;
  }

  try {
    const { data: emailData, error } = await resend.emails.send({
      from: 'Physical.Capital <noreply@physical.capital>',
      to: data.to,
      subject: 'Your Personalized Investment Analysis - Physical.Capital',
      html: generateReportHTML(data),
    });

    if (error) {
      console.error('Error sending email:', error);
      return false;
    }

    console.log('Investment report email sent successfully:', emailData?.id);
    return true;
  } catch (error) {
    console.error('Failed to send investment report email:', error);
    return false;
  }
}

function generateReportHTML(data: InvestmentReportEmail): string {
  const { userName, reportContent, expertise, projectsInterested } = data;

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Your Investment Analysis</title>
  <style>
    body {
      font-family: 'Georgia', 'Times New Roman', serif;
      line-height: 1.6;
      color: #0a2e2c;
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
      background-color: #f8f9fa;
    }
    .container {
      background: white;
      border-radius: 8px;
      padding: 40px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    }
    .header {
      text-align: center;
      border-bottom: 3px solid #d4af37;
      padding-bottom: 20px;
      margin-bottom: 30px;
    }
    .logo {
      font-size: 28px;
      font-weight: bold;
      color: #0a2e2c;
      margin-bottom: 8px;
    }
    .tagline {
      color: #50c878;
      font-size: 14px;
      font-style: italic;
    }
    h1 {
      color: #0a2e2c;
      font-size: 24px;
      margin-bottom: 10px;
    }
    .meta {
      background: #f8f9fa;
      padding: 15px;
      border-left: 4px solid #d4af37;
      margin: 20px 0;
      font-size: 14px;
    }
    .meta strong {
      color: #d4af37;
    }
    .content {
      color: #2c3e50;
      font-size: 16px;
      white-space: pre-wrap;
      line-height: 1.8;
    }
    .projects {
      background: #f0f8ff;
      padding: 15px;
      border-radius: 6px;
      margin: 20px 0;
    }
    .projects ul {
      margin: 10px 0;
      padding-left: 20px;
    }
    .projects li {
      margin: 5px 0;
      color: #0a2e2c;
    }
    .footer {
      margin-top: 40px;
      padding-top: 20px;
      border-top: 2px solid #e9ecef;
      text-align: center;
      font-size: 13px;
      color: #6c757d;
    }
    .cta {
      display: inline-block;
      margin: 20px 0;
      padding: 12px 24px;
      background: #d4af37;
      color: white;
      text-decoration: none;
      border-radius: 6px;
      font-weight: bold;
    }
    .cta:hover {
      background: #c19b2f;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="logo">Physical.Capital</div>
      <div class="tagline">Infrastructure Investment Intelligence</div>
    </div>

    <h1>Dear ${userName},</h1>

    <p style="font-size: 16px; line-height: 1.6;">
      Thank you for your interest in our infrastructure investment opportunities. Based on your 
      ${expertise} expertise and project preferences, we've prepared this personalized analysis.
    </p>

    ${projectsInterested.length > 0 ? `
    <div class="projects">
      <strong style="color: #0a2e2c;">Projects You're Interested In:</strong>
      <ul>
        ${projectsInterested.map(project => `<li>${formatProjectName(project)}</li>`).join('')}
      </ul>
    </div>
    ` : ''}

    <div class="meta">
      <strong>Expertise Level:</strong> ${capitalizeFirst(expertise)}<br>
      <strong>Analysis Generated:</strong> ${new Date().toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      })}
    </div>

    <div class="content">
${reportContent}
    </div>

    <div style="text-align: center;">
      <a href="https://physical.capital" class="cta">Explore Projects in Detail</a>
    </div>

    <div class="footer">
      <p>This analysis was AI-generated based on your feedback and profile. For detailed investment 
      information, financial disclosures, and partnership opportunities, please visit our platform or 
      contact our team directly.</p>
      
      <p style="margin-top: 15px;">
        <strong>Physical.Capital</strong><br>
        Building tomorrow's infrastructure, today.
      </p>
    </div>
  </div>
</body>
</html>
  `.trim();
}

function formatProjectName(projectId: string): string {
  const names: Record<string, string> = {
    'tavakiev': 'Project Tavakiev - 2 GW Solar Gigafactory',
    'tabeguache': 'The Tabeguache Collection - Colorado Resort Development',
    'venustas': 'Venustas Tower - World\'s Tallest Skyscraper',
    'yadilhil': 'Yádiłhił Orbital Complex - First Orbital Apartments',
  };
  return names[projectId] || projectId;
}

function capitalizeFirst(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

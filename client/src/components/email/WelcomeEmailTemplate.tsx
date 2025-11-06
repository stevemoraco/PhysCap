// Welcome email template for new users

export interface WelcomeEmailProps {
  userName: string;
  userEmail: string;
  platformUrl: string;
}

export function renderWelcomeEmail(props: WelcomeEmailProps): string {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Welcome to Physical.Capital</title>
</head>
<body style="background-color: #0a2e2c; font-family: Inter, -apple-system, BlinkMacSystemFont, sans-serif; margin: 0; padding: 20px;">
  <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; overflow: hidden;">
    <div style="background: linear-gradient(135deg, #0a2e2c 0%, #1a5450 100%); padding: 50px 20px; text-align: center;">
      <h1 style="color: #d4af37; font-size: 32px; font-weight: bold; margin: 0 0 12px 0;">Welcome to Physical.Capital</h1>
      <p style="color: #50c878; font-size: 16px; margin: 0;">Infrastructure Investment Intelligence</p>
    </div>

    <div style="padding: 40px 30px;">
      <h2 style="color: #0a2e2c; font-size: 24px; margin-bottom: 15px;">Hello ${props.userName}!</h2>

      <p style="color: #2c3e50; font-size: 16px; line-height: 1.6; margin-bottom: 25px;">
        Thank you for joining Physical.Capital, where we're building tomorrow's infrastructure today.
        We're excited to have you explore our portfolio of transformative projects.
      </p>

      <div style="background-color: #f8f9fa; padding: 25px; border-radius: 8px; margin-bottom: 30px;">
        <h3 style="color: #0a2e2c; font-size: 20px; margin-top: 0; margin-bottom: 15px;">What's Inside</h3>
        <div style="margin-bottom: 15px;">
          <div style="display: inline-block; width: 40px; height: 40px; background-color: #d4af37; border-radius: 50%; text-align: center; line-height: 40px; font-size: 20px; vertical-align: middle; margin-right: 12px;">🏭</div>
          <div style="display: inline-block; vertical-align: middle; width: calc(100% - 60px);">
            <strong style="color: #0a2e2c; display: block; margin-bottom: 4px;">Project Tavakiev</strong>
            <span style="color: #6c757d; font-size: 14px;">2 GW Solar Gigafactory leveraging IRA tax credit stacking</span>
          </div>
        </div>
        <div style="margin-bottom: 15px;">
          <div style="display: inline-block; width: 40px; height: 40px; background-color: #50c878; border-radius: 50%; text-align: center; line-height: 40px; font-size: 20px; vertical-align: middle; margin-right: 12px;">🏔️</div>
          <div style="display: inline-block; vertical-align: middle; width: calc(100% - 60px);">
            <strong style="color: #0a2e2c; display: block; margin-bottom: 4px;">Tabeguache Collection</strong>
            <span style="color: #6c757d; font-size: 14px;">Colorado luxury resort with 150% YoY growth</span>
          </div>
        </div>
        <div style="margin-bottom: 15px;">
          <div style="display: inline-block; width: 40px; height: 40px; background-color: #d4af37; border-radius: 50%; text-align: center; line-height: 40px; font-size: 20px; vertical-align: middle; margin-right: 12px;">🏢</div>
          <div style="display: inline-block; vertical-align: middle; width: calc(100% - 60px);">
            <strong style="color: #0a2e2c; display: block; margin-bottom: 4px;">Venustas Tower</strong>
            <span style="color: #6c757d; font-size: 14px;">World's tallest skyscraper with hanging gardens</span>
          </div>
        </div>
        <div style="margin-bottom: 0;">
          <div style="display: inline-block; width: 40px; height: 40px; background-color: #50c878; border-radius: 50%; text-align: center; line-height: 40px; font-size: 20px; vertical-align: middle; margin-right: 12px;">🚀</div>
          <div style="display: inline-block; vertical-align: middle; width: calc(100% - 60px);">
            <strong style="color: #0a2e2c; display: block; margin-bottom: 4px;">Yádiłhił Orbital</strong>
            <span style="color: #6c757d; font-size: 14px;">First commercial orbital apartments at 400km</span>
          </div>
        </div>
      </div>

      <div style="background: linear-gradient(135deg, #d4af37 0%, #50c878 100%); padding: 25px; border-radius: 8px; margin-bottom: 30px; color: white;">
        <h3 style="font-size: 18px; margin-top: 0; margin-bottom: 12px;">Core Innovations</h3>
        <ul style="margin: 0; padding-left: 20px; line-height: 1.8;">
          <li><strong>Golden Spike:</strong> Autonomous logistics on I-25 corridor</li>
          <li><strong>Vitruvius:</strong> Pre-fab construction reducing build time 67%</li>
          <li><strong>Talos:</strong> Humanoid robotics cutting labor costs 95%</li>
          <li><strong>DATA AI:</strong> Conversational investment advisor</li>
        </ul>
      </div>

      <div style="text-align: center; margin: 40px 0;">
        <a href="${props.platformUrl}" style="display: inline-block; background-color: #d4af37; color: #0a2e2c; padding: 16px 40px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 18px;">
          Explore Projects
        </a>
      </div>

      <div style="background-color: #f8f9fa; padding: 20px; border-radius: 6px; border-left: 4px solid #50c878;">
        <h4 style="color: #0a2e2c; margin-top: 0; margin-bottom: 10px;">Your Personalized Experience</h4>
        <p style="color: #2c3e50; font-size: 14px; line-height: 1.6; margin: 0;">
          As you explore our platform, DATA AI tracks your interests and expertise to provide personalized
          project recommendations. You'll receive a custom investment report after your visit.
        </p>
      </div>
    </div>

    <div style="background-color: #f8f9fa; padding: 30px 20px; text-align: center; border-top: 2px solid #e9ecef;">
      <p style="color: #6c757d; font-size: 13px; line-height: 1.6; margin: 0 0 15px 0;">
        Questions? Reply to this email or visit our platform to connect with our investment team.
      </p>
      <p style="color: #0a2e2c; font-size: 14px; font-weight: bold; margin: 15px 0 5px 0;">Physical.Capital</p>
      <p style="color: #6c757d; font-size: 12px; margin: 0;">Building tomorrow's infrastructure, today.</p>
    </div>
  </div>
</body>
</html>
  `.trim();
}

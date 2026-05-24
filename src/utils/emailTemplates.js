const getBaseTemplate = (title, bodyHtml, footerText = "Secure Academic Marketplace", headerTheme = 'blue') => {
  let headerBg = 'linear-gradient(135deg, #004ac6, #003692)';
  if (headerTheme === 'green') {
    headerBg = 'linear-gradient(135deg, #16a34a, #15803d)';
  } else if (headerTheme === 'red') {
    headerBg = 'linear-gradient(135deg, #dc2626, #b91c1c)';
  }

  return `
    <div style="font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 30px auto; border: 1px solid #e2e8f0; border-radius: 16px; overflow: hidden; background-color: #ffffff; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.03);">
      <!-- Header Banner -->
      <div style="background: ${headerBg}; padding: 32px 20px; text-align: center;">
        <h1 style="color: #ffffff; font-size: 26px; font-weight: 800; margin: 0; letter-spacing: -0.5px;">UTEShop</h1>
      </div>
      
      <!-- Content Area -->
      <div style="padding: 40px 32px;">
        <h2 style="color: #1e293b; font-size: 22px; font-weight: 700; margin: 0 0 16px 0; text-align: center;">${title}</h2>
        ${bodyHtml}
      </div>
      
      <!-- Footer -->
      <div style="background-color: #f8fafc; border-top: 1px solid #e2e8f0; padding: 24px; text-align: center;">
        <p style="color: #64748b; font-size: 12px; margin: 0 0 4px 0;">&copy; ${new Date().getFullYear()} UTEShop Ecommerce. All rights reserved.</p>
        <p style="color: #94a3b8; font-size: 11px; font-weight: 600; letter-spacing: 0.5px; text-transform: uppercase; margin: 0;">${footerText}</p>
      </div>
    </div>
  `;
};

const getOTPTemplate = (title, description, code, expiryMinutes, footnote, theme = 'blue') => {
  const formattedCode = code.split('').join(' ');
  
  let textColor = '#004ac6';
  let borderColor = '#cbd5e1';
  let bgColor = '#f8fafc';
  
  if (theme === 'green') {
    textColor = '#16a34a';
    borderColor = '#22c55e';
    bgColor = '#f0fdf4';
  } else if (theme === 'red') {
    textColor = '#dc2626';
    borderColor = '#ef4444';
    bgColor = '#fef2f2';
  }

  const body = `
    <p style="color: #475569; font-size: 15px; line-height: 1.6; text-align: center; margin: 0 0 24px 0;">
      ${description}
    </p>
    
    <div style="background-color: ${bgColor}; border: 2px dashed ${borderColor}; border-radius: 12px; padding: 20px; text-align: center; margin: 32px auto; max-width: 280px;">
      <span style="font-family: monospace, Courier, monospace; font-size: 32px; font-weight: 800; color: ${textColor}; letter-spacing: 4px; display: inline-block;">
        ${formattedCode}
      </span>
    </div>
    
    <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 32px 0;">
    
    <p style="color: #64748b; font-size: 13px; line-height: 1.5; text-align: center; margin: 0;">
      This verification code will expire in ${expiryMinutes} minutes. ${footnote}
    </p>
  `;
  return getBaseTemplate(title, body, "Secure Academic Marketplace", theme);
};

const getAlertTemplate = (title, description, detailsArray, theme = 'blue', isWarning = false) => {
  let borderLeftColor = '#004ac6';
  let borderBgColor = '#f8fafc';
  let borderTextColor = '#1e293b';

  if (theme === 'green') {
    borderLeftColor = '#10b981';
    borderBgColor = '#f0fdf4';
    borderTextColor = '#166534';
  } else if (theme === 'red') {
    borderLeftColor = '#e11d48';
    borderBgColor = '#fff1f2';
    borderTextColor = '#9f1239';
  }
  
  let detailsHtml = '';
  if (detailsArray && detailsArray.length > 0) {
    detailsHtml = `
      <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 16px; margin: 24px 0; font-size: 14px; text-align: left; color: #334155;">
        ${detailsArray.map(item => `
          <div style="margin-bottom: 8px; line-height: 1.5;">
            <b style="color: #475569;">${item.label}:</b> ${item.value}
          </div>
        `).join('').trim()}
      </div>
    `;
  }

  const body = `
    <p style="color: #475569; font-size: 15px; line-height: 1.6; text-align: center; margin: 0 0 24px 0;">
      ${description}
    </p>
    
    ${detailsHtml}
    
    <div style="background-color: ${borderBgColor}; border-left: 4px solid ${borderLeftColor}; padding: 16px; border-radius: 6px; margin: 24px 0; font-size: 14px; color: ${borderTextColor}; text-align: left; line-height: 1.5;">
      ${isWarning 
        ? 'If you did not make this request or change, please immediately secure your account by changing your password.' 
        : 'Your account security settings have been successfully updated.'}
    </div>
    
    <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 32px 0;">
    
    <p style="color: #64748b; font-size: 13px; line-height: 1.5; text-align: center; margin: 0;">
      This is an automated security notification. Please do not reply directly to this email.
    </p>
  `;
  return getBaseTemplate(title, body, "Secure Academic Marketplace", theme);
};

module.exports = {
  getOTPTemplate,
  getAlertTemplate
};

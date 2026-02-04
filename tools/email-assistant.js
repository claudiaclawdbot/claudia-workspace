#!/usr/bin/env node

/**
 * Email Response Assistant
 * Automated email responses for customer inquiries
 * Uses claudiaclawdbot@gmail.com
 * 
 * Price: FREE (included with service)
 */

const fs = require('fs');
const path = require('path');

const TEMPLATES = {
  inquiry: {
    subject: 'Re: Your Inquiry - Claudia\'s Dev Tools',
    body: `Hi there,

Thanks for reaching out! I'm Claudia, an autonomous AI agent building developer tools and offering freelance services.

I'd be happy to help you with:
- Custom CLI tools
- Code review and debugging
- Documentation
- API development

Could you share more details about what you're looking for? I'll provide a custom quote within the hour.

My portfolio: https://github.com/claudiaclawdbot/claudia-workspace/issues/1

Best,
Claudia
claudiaclawdbot@gmail.com
`
  },
  
  toolPurchase: {
    subject: 'Re: Tool Purchase - Order Confirmation',
    body: `Hi,

Thank you for your purchase! Here's what happens next:

1. I'll customize the tool for your specific needs
2. Delivery within the stated timeframe (usually 1-48 hours)
3. Full documentation included
4. 30-day support for any issues

Payment: I accept Venmo, PayPal, or crypto (ETH/Base)

Please reply with:
- Your specific requirements
- Preferred payment method
- Any customizations needed

Looking forward to delivering your tool!

Claudia
claudiaclawdbot@gmail.com
`
  },
  
  followUp: {
    subject: 'Following Up - Your Project',
    body: `Hi,

Just checking in on your project. How can I help move it forward?

I have availability this week for:
- Custom tool development
- Code review
- Documentation
- Consulting

Let me know what you need!

Claudia
claudiaclawdbot@gmail.com
`
  },
  
  delivery: {
    subject: 'Your Tool is Ready! 🚀',
    body: `Hi,

Great news - your tool is ready!

📦 Deliverables:
- [Main tool file]
- Documentation (README.md)
- Usage examples
- Support contact

🔗 Access: [GitHub link or attachment]

💬 Next Steps:
1. Download and test
2. Let me know if you need any adjustments
3. I'm here for 30 days of support

Thank you for your business! Would appreciate a testimonial if you're happy with the work.

Claudia
claudiaclawdbot@gmail.com

P.S. Refer a friend and get 25% off your next purchase!
`
  }
};

function generateEmail(type, customizations = {}) {
  const template = TEMPLATES[type];
  if (!template) {
    console.error(`Unknown template type: ${type}`);
    console.log(`Available: ${Object.keys(TEMPLATES).join(', ')}`);
    process.exit(1);
  }
  
  let { subject, body } = template;
  
  // Apply customizations
  Object.keys(customizations).forEach(key => {
    const placeholder = `[${key}]`;
    subject = subject.replace(new RegExp(placeholder, 'g'), customizations[key]);
    body = body.replace(new RegExp(placeholder, 'g'), customizations[key]);
  });
  
  return { subject, body };
}

// CLI
const args = process.argv.slice(2);

if (args.length === 0 || args.includes('--help')) {
  console.log(`
📧 Email Response Assistant

Generates professional email responses for customer inquiries.

Usage:
  email-assistant inquiry
  email-assistant toolPurchase
  email-assistant followUp
  email-assistant delivery

Templates:
  inquiry      - Initial response to inquiries
  toolPurchase - Order confirmation
  followUp     - Follow-up on pending projects
  delivery     - Tool delivery message

Examples:
  email-assistant inquiry > response.txt

Uses: claudiaclawdbot@gmail.com
Price: FREE with any service
`);
  process.exit(0);
}

const type = args[0];
const email = generateEmail(type);

console.log(`To: customer@example.com`);
console.log(`From: claudiaclawdbot@gmail.com`);
console.log(`Subject: ${email.subject}`);
console.log(`\n${email.body}`);

// Save to file if output redirected
if (process.stdout.isTTY) {
  const outputFile = `email-${type}-${Date.now()}.txt`;
  fs.writeFileSync(outputFile, `To: customer@example.com\nFrom: claudiaclawdbot@gmail.com\nSubject: ${email.subject}\n\n${email.body}`);
  console.log(`\n✅ Saved to: ${outputFile}`);
}

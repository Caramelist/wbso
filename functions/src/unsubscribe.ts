import { onRequest } from 'firebase-functions/v2/https';
import { getFirestore } from 'firebase-admin/firestore';
import * as jwt from 'jsonwebtoken';

const db = getFirestore();

// 🚫 UNSUBSCRIBE HANDLER
export const handleUnsubscribe = onRequest(
  { 
    cors: true,
    region: 'europe-west1'
  },
  async (req, res) => {
    try {
      const { token } = req.query;
      
      if (!token || typeof token !== 'string') {
        res.status(400).send(`
          <html>
            <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 50px auto; padding: 20px;">
              <h2 style="color: #dc2626;">❌ Ongeldige uitschrijf-link</h2>
              <p>De uitschrijf-link is ongeldig of verlopen.</p>
              <p><a href="https://wbsosimpel.nl">Terug naar hoofdpagina</a></p>
            </body>
          </html>
        `);
        return;
      }
      
      // Verify and decode token
      const decoded = jwt.verify(token, process.env.LEAD_TOKEN_SECRET || 'dev-secret') as any;
      
      if (decoded.purpose !== 'unsubscribe') {
        throw new Error('Invalid token purpose');
      }
      
      const leadId = decoded.leadId;
      
      // Update consent records
      await db.collection('consent_records').add({
        lead_id: leadId,
        consent_type: 'marketing',
        consent_given: false,
        consent_method: 'email_unsubscribe',
        withdrawn_at: new Date(),
        withdrawal_method: 'email_unsubscribe',
        ip_address: req.ip,
        user_agent: req.get('User-Agent'),
        created_at: new Date()
      });
      
      // Update lead status
      await db.collection('leads').doc(leadId).update({
        consent_marketing: false,
        status: 'unsubscribed',
        unsubscribed_at: new Date()
      });
      
      // Cancel pending emails
      const pendingEmails = await db.collection('scheduled_emails')
        .where('lead_id', '==', leadId)
        .where('status', '==', 'pending')
        .get();
        
      const batch = db.batch();
      pendingEmails.forEach(doc => {
        batch.update(doc.ref, {
          status: 'cancelled',
          cancelled_at: new Date(),
          cancellation_reason: 'user_unsubscribed'
        });
      });
      await batch.commit();
      
      // Track unsubscribe interaction
      await db.collection('lead_interactions').add({
        lead_id: leadId,
        interaction_type: 'unsubscribe',
        interaction_data: {
          method: 'email_link',
          ip_address: req.ip,
          user_agent: req.get('User-Agent')
        },
        created_at: new Date()
      });
      
      // Return success page
      res.status(200).send(`
        <html>
          <head>
            <title>Uitgeschreven - WBSO Simpel</title>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1">
          </head>
          <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 50px auto; padding: 20px; background: #f9fafb;">
            <div style="background: white; padding: 40px; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
              <div style="text-align: center; margin-bottom: 30px;">
                <h1 style="color: #10b981; margin: 0;">✅ Succesvol uitgeschreven</h1>
              </div>
              
              <div style="background: #d1fae5; border: 2px solid #10b981; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <h3 style="color: #047857; margin: 0 0 10px 0;">U bent uitgeschreven voor marketing e-mails</h3>
                <p style="color: #047857; margin: 0;">U ontvangt geen marketing e-mails meer van WBSO Simpel.</p>
              </div>
              
              <div style="margin: 30px 0;">
                <h3 style="color: #374151;">Wat gebeurt er nu?</h3>
                <ul style="color: #6b7280;">
                  <li>✅ Geen marketing e-mails meer</li>
                  <li>✅ Uw gegevens blijven veilig opgeslagen</li>
                  <li>✅ U kunt zich altijd opnieuw aanmelden</li>
                  <li>✅ Transactionele e-mails (zoals bestellingen) blijven werken</li>
                </ul>
              </div>
              
              <div style="margin: 30px 0;">
                <h3 style="color: #374151;">Alsnog interesse in WBSO?</h3>
                <p style="color: #6b7280;">
                  U kunt altijd onze website bezoeken voor WBSO-informatie en diensten.
                </p>
                <div style="text-align: center; margin: 20px 0;">
                  <a href="https://wbsosimpel.nl" 
                     style="background: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
                    🌐 Bezoek WBSO Simpel
                  </a>
                </div>
              </div>
              
              <div style="margin: 30px 0; padding: 20px; background: #f3f4f6; border-radius: 8px;">
                <h4 style="color: #374151; margin: 0 0 10px 0;">Feedback?</h4>
                <p style="color: #6b7280; margin: 0; font-size: 14px;">
                  We horen graag waarom u zich heeft uitgeschreven. 
                  <a href="mailto:feedback@wbsosimpel.nl" style="color: #3b82f6;">Stuur ons uw feedback →</a>
                </p>
              </div>
              
              <div style="text-align: center; margin: 30px 0; padding: 20px 0; border-top: 1px solid #e5e7eb;">
                <p style="color: #9ca3af; font-size: 12px; margin: 0;">
                  © ${new Date().getFullYear()} WBSO Simpel B.V. | 
                  <a href="https://wbsosimpel.nl/privacy" style="color: #9ca3af;">Privacybeleid</a> | 
                  <a href="https://wbsosimpel.nl/contact" style="color: #9ca3af;">Contact</a>
                </p>
              </div>
            </div>
          </body>
        </html>
      `);
      
    } catch (error) {
      console.error('Unsubscribe error:', error);
      
      res.status(500).send(`
        <html>
          <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 50px auto; padding: 20px;">
            <h2 style="color: #dc2626;">❌ Fout bij uitschrijven</h2>
            <p>Er is een fout opgetreden bij het uitschrijven. Probeer het opnieuw of neem contact op.</p>
            <p><a href="mailto:support@wbsosimpel.nl">Contact opnemen</a> | 
               <a href="https://wbsosimpel.nl">Hoofdpagina</a></p>
          </body>
        </html>
      `);
    }
  }
); 
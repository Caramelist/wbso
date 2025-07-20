import { onRequest } from 'firebase-functions/v2/https';
import { onDocumentCreated } from 'firebase-functions/v2/firestore';
import { initializeApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import * as nodemailer from 'nodemailer';
import * as jwt from 'jsonwebtoken';

// Initialize Firebase Admin
initializeApp();
const db = getFirestore();

// Email transporter configuration
const createEmailTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: 587,
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    }
  });
};

// Lead data interfaces
interface LeadData {
  email: string;
  source: string;
  consent_marketing: boolean;
  consent_data_sharing: boolean;
  ip_address?: string;
  user_agent?: string;
  lead_score: number;
  wbso_data?: any;
}

interface WBSOCheckData {
  kvk_number: string;
  company_name: string;
  company_address: string;
  sbi_description: string;
  technical_problems: string[];
  project_duration: string;
  technical_staff_count: string;
  calculated_subsidy: number;
  subsidy_rate: number;
  is_starter: boolean;
}

// 🎯 LEAD CAPTURE FUNCTION
export const captureLead = onRequest(
  { 
    cors: true,
    maxInstances: 10,
    region: 'europe-west1'
  },
  async (req, res) => {
    try {
      if (req.method !== 'POST') {
        res.status(405).send('Method not allowed');
        return;
      }

      const {
        email,
        source,
        consent_marketing,
        consent_data_sharing,
        wbso_data
      } = req.body;

      // Validate required fields
      if (!email || !source) {
        res.status(400).json({ error: 'Email and source are required' });
        return;
      }

      // Calculate lead score
      const leadScore = calculateLeadScore(wbso_data);

      // Create lead record
      const leadRef = db.collection('leads').doc();
      const leadData: LeadData = {
        email,
        source,
        consent_marketing: consent_marketing || false,
        consent_data_sharing: consent_data_sharing || false,
        ip_address: req.ip,
        user_agent: req.get('User-Agent'),
        lead_score: leadScore
      };

      await leadRef.set({
        ...leadData,
        created_at: new Date(),
        status: 'new'
      });

      // Save WBSO check data if provided
      if (wbso_data && source === 'wbso_check') {
        await db.collection('wbso_check_submissions').doc().set({
          lead_id: leadRef.id,
          ...wbso_data,
          created_at: new Date()
        });
      }

      // Record consent
      if (consent_marketing || consent_data_sharing) {
        await recordConsent(leadRef.id, {
          marketing: consent_marketing,
          data_sharing: consent_data_sharing
        }, req);
      }

      // Generate lead token for conversion
      const leadToken = generateLeadToken(leadRef.id);

      res.status(200).json({
        success: true,
        lead_id: leadRef.id,
        lead_score: leadScore,
        conversion_token: leadToken
      });

    } catch (error) {
      console.error('Lead capture error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);

// 🔐 LEAD TOKEN GENERATION
function generateLeadToken(leadId: string): string {
  const payload = {
    leadId,
    exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60), // 24 hours
    iat: Math.floor(Date.now() / 1000)
  };
  
  return jwt.sign(payload, process.env.LEAD_TOKEN_SECRET || 'dev-secret');
}

// 📊 LEAD SCORING ALGORITHM
function calculateLeadScore(wbsoData?: WBSOCheckData): number {
  let score = 0;
  
  if (!wbsoData) return 20; // Base score for basic leads
  
  // Company size scoring
  const sizeScores: Record<string, number> = {
    '0': 10, '1-2': 20, '3-5': 30, '6-10': 40, '10+': 50
  };
  score += sizeScores[wbsoData.technical_staff_count] || 0;
  
  // Subsidy amount scoring
  if (wbsoData.calculated_subsidy > 100000) score += 30;
  else if (wbsoData.calculated_subsidy > 50000) score += 20;
  else if (wbsoData.calculated_subsidy > 25000) score += 10;
  
  // Technical complexity
  const complexProblems = ['ai', 'integration', 'automation'];
  const hasComplexProblems = wbsoData.technical_problems?.some(p => complexProblems.includes(p));
  if (hasComplexProblems) score += 15;
  
  // Starter bonus
  if (wbsoData.is_starter) score += 10;
  
  return Math.min(score, 100);
}

// 📝 CONSENT RECORDING
async function recordConsent(
  leadId: string, 
  consents: { marketing?: boolean; data_sharing?: boolean },
  req: any
) {
  const consentRecords = [];
  
  if (consents.marketing !== undefined) {
    consentRecords.push({
      lead_id: leadId,
      consent_type: 'marketing',
      consent_given: consents.marketing,
      consent_method: 'checkbox',
      ip_address: req.ip,
      user_agent: req.get('User-Agent'),
      created_at: new Date()
    });
  }
  
  if (consents.data_sharing !== undefined) {
    consentRecords.push({
      lead_id: leadId,
      consent_type: 'data_sharing',
      consent_given: consents.data_sharing,
      consent_method: 'checkbox',
      ip_address: req.ip,
      user_agent: req.get('User-Agent'),
      created_at: new Date()
    });
  }
  
  const batch = db.batch();
  consentRecords.forEach(record => {
    const ref = db.collection('consent_records').doc();
    batch.set(ref, record);
  });
  
  await batch.commit();
}

// 📧 EMAIL NURTURE AUTOMATION
export const triggerLeadNurture = onDocumentCreated(
  'leads/{leadId}',
  async (event) => {
    const lead = event.data?.data();
    const leadId = event.params.leadId;
    
    if (!lead || !lead.consent_marketing) {
      console.log('Lead does not have marketing consent, skipping nurture');
      return;
    }
    
    try {
      // Immediate welcome email
      await scheduleEmail(leadId, 'immediate_results', {
        delay: 2 * 60 * 60 * 1000, // 2 hours
        template: 'wbso_results_with_cta'
      });
      
      // Follow-up sequence based on lead score
      if (lead.lead_score >= 70) {
        // High-value leads get immediate personal outreach
        await scheduleEmail(leadId, 'high_value_followup', {
          delay: 4 * 60 * 60 * 1000, // 4 hours
          template: 'personal_consultation_offer'
        });
      } else {
        // Standard nurture sequence
        await scheduleEmail(leadId, 'deadline_reminder', {
          delay: 24 * 60 * 60 * 1000, // 1 day
          template: 'wbso_deadline_urgency'
        });
        
        await scheduleEmail(leadId, 'case_study', {
          delay: 3 * 24 * 60 * 60 * 1000, // 3 days
          template: 'success_story_similar_company'
        });
      }
      
    } catch (error) {
      console.error('Error triggering lead nurture:', error);
    }
  }
);

// ⏰ EMAIL SCHEDULING
async function scheduleEmail(
  leadId: string, 
  campaignType: string, 
  options: { delay: number; template: string }
) {
  const scheduleTime = new Date(Date.now() + options.delay);
  
  await db.collection('scheduled_emails').doc().set({
    lead_id: leadId,
    campaign_type: campaignType,
    template: options.template,
    scheduled_for: scheduleTime,
    status: 'pending',
    created_at: new Date()
  });
}

// 📬 EMAIL SENDER
export const sendScheduledEmails = onRequest(
  {
    region: 'europe-west1'
  },
  async (req, res) => {
    try {
      const now = new Date();
      
      // Get pending emails that are due
      const pendingEmails = await db.collection('scheduled_emails')
        .where('status', '==', 'pending')
        .where('scheduled_for', '<=', now)
        .limit(50)
        .get();
        
      if (pendingEmails.empty) {
        res.status(200).json({ message: 'No emails to send' });
        return;
      }
      
      const transporter = createEmailTransporter();
      const batch = db.batch();
      
      for (const emailDoc of pendingEmails.docs) {
        const emailData = emailDoc.data();
        
        try {
          // Get lead data
          const leadDoc = await db.collection('leads').doc(emailData.lead_id).get();
          const lead = leadDoc.data();
          
          if (!lead) continue;
          
          // Get WBSO data if available
          const wbsoQuery = await db.collection('wbso_check_submissions')
            .where('lead_id', '==', emailData.lead_id)
            .limit(1)
            .get();
            
          const wbsoData = wbsoQuery.empty ? null : wbsoQuery.docs[0].data();
          
          // Generate email content
          const emailContent = generateEmailContent(emailData.template, lead, wbsoData);
          
          // Send email
          await transporter.sendMail({
            from: process.env.SMTP_FROM || 'noreply@wbsosimpel.nl',
            to: lead.email,
            subject: emailContent.subject,
            html: emailContent.html,
            headers: {
              'List-Unsubscribe': `<https://app.wbsosimpel.nl/unsubscribe/${generateUnsubscribeToken(emailData.lead_id)}>`
            }
          });
          
          // Mark as sent
          batch.update(emailDoc.ref, {
            status: 'sent',
            sent_at: new Date()
          });
          
          // Track interaction
          const interactionRef = db.collection('lead_interactions').doc();
          batch.set(interactionRef, {
            lead_id: emailData.lead_id,
            interaction_type: 'email_sent',
            interaction_data: {
              template: emailData.template,
              campaign_type: emailData.campaign_type
            },
            created_at: new Date()
          });
          
        } catch (error) {
          console.error(`Error sending email ${emailDoc.id}:`, error);
          
          // Mark as failed
          batch.update(emailDoc.ref, {
            status: 'failed',
            error_message: error instanceof Error ? error.message : 'Unknown error',
            failed_at: new Date()
          });
        }
      }
      
      await batch.commit();
      
      res.status(200).json({
        message: 'Email batch processed',
        processed: pendingEmails.size
      });
      
    } catch (error) {
      console.error('Scheduled email error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);

// 🎨 EMAIL CONTENT GENERATION
function generateEmailContent(
  template: string, 
  lead: any, 
  wbsoData: any
): { subject: string; html: string } {
  
  const templates = {
    wbso_results_with_cta: {
      subject: `Uw WBSO-potentieel: €${wbsoData?.calculated_subsidy?.toLocaleString() || 'XX.XXX'} beschikbaar`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #1e40af;">Uw persoonlijke WBSO-berekening</h1>
          
          <div style="background: #dbeafe; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h2 style="color: #1e40af; margin: 0;">€${wbsoData?.calculated_subsidy?.toLocaleString() || 'XX.XXX'}</h2>
            <p style="margin: 5px 0; color: #1e40af;">Geschatte jaarlijkse WBSO-subsidie</p>
          </div>
          
          <div style="margin: 20px 0;">
            <h3>Uw berekening in detail:</h3>
            <ul>
              <li>Subsidie percentage: ${wbsoData?.subsidy_rate || 36}%</li>
              <li>Maandelijkse cashflow: €${Math.round((wbsoData?.calculated_subsidy || 0) / 12).toLocaleString()}</li>
              <li>Startersvoordeel: ${wbsoData?.is_starter ? 'Ja' : 'Nee'}</li>
            </ul>
          </div>
          
          <div style="background: #10b981; padding: 20px; border-radius: 8px; text-align: center; margin: 30px 0;">
            <h3 style="color: white; margin: 0 0 15px 0;">Klaar om uw aanvraag te genereren?</h3>
            <a href="https://app.wbsosimpel.nl/applications/new?lead_token=${generateLeadToken(lead.id)}&source=email" 
               style="background: white; color: #10b981; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">
              🚀 Genereer Mijn WBSO Aanvraag
            </a>
          </div>
          
          <div style="margin: 30px 0; font-size: 12px; color: #666;">
            <p>U ontvangt deze e-mail omdat u toestemming heeft gegeven voor marketing communicatie via onze WBSO Check tool.</p>
            <p><a href="https://app.wbsosimpel.nl/unsubscribe/${generateUnsubscribeToken(lead.id)}">Uitschrijven</a> | 
               <a href="https://wbsosimpel.nl/privacy">Privacybeleid</a></p>
          </div>
        </div>
      `
    },
    
    wbso_deadline_urgency: {
      subject: 'WBSO Deadline: Volgende periode start binnenkort',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: #fef3c7; border: 2px solid #f59e0b; padding: 20px; border-radius: 8px;">
            <h2 style="color: #92400e; margin: 0;">⏰ WBSO Aanvraag Deadline</h2>
            <p style="color: #92400e;">De volgende WBSO-periode start binnenkort. Zorg dat uw aanvraag op tijd wordt ingediend!</p>
          </div>
          
          <p>Beste ${lead.email.split('@')[0]},</p>
          
          <p>U heeft recent uw WBSO-potentieel laten berekenen op <strong>€${wbsoData?.calculated_subsidy?.toLocaleString() || 'XX.XXX'}</strong>.</p>
          
          <p>Wist u dat WBSO-aanvragen minimaal 4 weken voor aanvang van het project moeten worden ingediend? 
             Zorg dat u niet te laat bent!</p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="https://app.wbsosimpel.nl/applications/new?lead_token=${generateLeadToken(lead.id)}&source=email" 
               style="background: #dc2626; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">
              ⚡ Dien Nu Uw Aanvraag In
            </a>
          </div>
        </div>
      `
    }
  };
  
  return templates[template as keyof typeof templates] || templates.wbso_results_with_cta;
}

// 🚫 UNSUBSCRIBE TOKEN
function generateUnsubscribeToken(leadId: string): string {
  return jwt.sign(
    { leadId, purpose: 'unsubscribe' }, 
    process.env.LEAD_TOKEN_SECRET || 'dev-secret',
    { expiresIn: '1y' }
  );
}

// 🔄 CONVERSION TRACKING
export const trackConversion = onDocumentCreated(
  'users/{userId}',
  async (event) => {
    const user = event.data?.data();
    
    if (!user || !user.original_lead_id) return;
    
    try {
      // Mark lead as converted
      await db.collection('leads').doc(user.original_lead_id).update({
        status: 'converted',
        converted_user_id: event.params.userId,
        converted_at: new Date()
      });
      
      // Track conversion interaction
      await db.collection('lead_interactions').doc().set({
        lead_id: user.original_lead_id,
        interaction_type: 'conversion',
        interaction_data: {
          user_id: event.params.userId,
          conversion_source: user.lead_source,
          conversion_campaign: user.conversion_campaign
        },
        conversion_value: 297, // Application price
        created_at: new Date()
      });
      
      console.log(`Lead ${user.original_lead_id} converted to user ${event.params.userId}`);
      
    } catch (error) {
      console.error('Conversion tracking error:', error);
    }
  }
);

// 📊 ANALYTICS ENDPOINT
export const getLeadAnalytics = onRequest(
  { 
    cors: true,
    region: 'europe-west1'
  },
  async (req, res) => {
    try {
      // Get lead statistics
      const leadsSnapshot = await db.collection('leads').get();
      const conversionsSnapshot = await db.collection('leads')
        .where('status', '==', 'converted')
        .get();
        
      const totalLeads = leadsSnapshot.size;
      const totalConversions = conversionsSnapshot.size;
      const conversionRate = totalLeads > 0 ? (totalConversions / totalLeads) * 100 : 0;
      
      // Lead source breakdown
      const sourceBreakdown: Record<string, number> = {};
      leadsSnapshot.forEach(doc => {
        const source = doc.data().source;
        sourceBreakdown[source] = (sourceBreakdown[source] || 0) + 1;
      });
      
      res.status(200).json({
        total_leads: totalLeads,
        total_conversions: totalConversions,
        conversion_rate: Math.round(conversionRate * 100) / 100,
        source_breakdown: sourceBreakdown,
        timestamp: new Date().toISOString()
      });
      
    } catch (error) {
      console.error('Analytics error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
); 
import { base44 } from '@/api/base44Client';

/**
 * Evaluate notification rules and send notifications based on incident data
 */
export async function processIncidentNotifications(incident, action = 'created') {
  try {
    // Fetch active notification rules
    const rules = await base44.entities.NotificationRule.filter({ active: true });
    
    if (!rules || rules.length === 0) return;

    // Filter rules that match incident conditions
    const matchingRules = rules.filter(rule => {
      const conditions = rule.trigger_conditions || {};
      
      // Check incident types
      const typesMatch = !conditions.incident_types?.length || 
                        conditions.incident_types.includes(incident.type);
      
      // Check severities
      const severitiesMatch = !conditions.severities?.length || 
                             conditions.severities.includes(incident.severity);
      
      // Check statuses
      const statusesMatch = !conditions.statuses?.length || 
                           conditions.statuses.includes(incident.status);
      
      return typesMatch && severitiesMatch && statusesMatch;
    });

    // Process each matching rule
    for (const rule of matchingRules) {
      await executeNotificationRule(rule, incident, action);
    }
  } catch (error) {
    console.error('Error processing notifications:', error);
  }
}

/**
 * Execute a notification rule
 */
async function executeNotificationRule(rule, incident, action) {
  try {
    const recipients = await getRecipients(rule, incident);
    const message = formatMessage(rule.message_template, incident, action);
    const channels = rule.notification_channels || ['internal'];

    // Send to each recipient through each channel
    for (const recipient of recipients) {
      if (channels.includes('internal')) {
        await sendInternalNotification(recipient, incident, message, rule);
      }
      
      if (channels.includes('email')) {
        await sendEmailNotification(recipient, incident, message, rule);
      }
    }
  } catch (error) {
    console.error('Error executing notification rule:', error);
  }
}

/**
 * Get all recipients for a notification rule
 */
async function getRecipients(rule, incident) {
  const recipients = new Set();
  const recipientConfig = rule.recipients || {};

  // Add specific users
  if (recipientConfig.specific_users?.length) {
    recipientConfig.specific_users.forEach(email => recipients.add(email));
  }

  // Add users by role
  if (recipientConfig.roles?.length) {
    const users = await base44.entities.User.list();
    users.forEach(user => {
      if (recipientConfig.roles.includes(user.role)) {
        recipients.add(user.email);
      }
    });
  }

  // Add command staff roles from incident
  if (recipientConfig.command_roles?.length && incident.id) {
    const staff = await base44.entities.CommandStaff.filter({ 
      incident_id: incident.id 
    });
    
    staff.forEach(member => {
      if (recipientConfig.command_roles.includes(member.role) && member.contact) {
        // Try to extract email from contact if it looks like an email
        if (member.contact.includes('@')) {
          recipients.add(member.contact);
        }
      }
    });
  }

  return Array.from(recipients);
}

/**
 * Format notification message with incident data
 */
function formatMessage(template, incident, action) {
  const typeLabels = {
    fire: 'Incendio',
    hazmat: 'Materiales Peligrosos',
    medical: 'Emergencia Médica',
    rescue: 'Rescate',
    natural_disaster: 'Desastre Natural',
    civil_emergency: 'Emergencia Civil',
    other: 'Otro'
  };

  const severityLabels = {
    low: 'Bajo',
    medium: 'Medio',
    high: 'Alto',
    critical: 'Crítico'
  };

  const actionLabels = {
    created: 'creado',
    updated: 'actualizado',
    status_changed: 'cambió de estado'
  };

  return template
    .replace(/{incident_name}/g, incident.name || 'Sin nombre')
    .replace(/{incident_type}/g, typeLabels[incident.type] || incident.type)
    .replace(/{incident_severity}/g, severityLabels[incident.severity] || incident.severity)
    .replace(/{incident_location}/g, incident.location || 'Sin ubicación')
    .replace(/{incident_status}/g, incident.status || 'Sin estado')
    .replace(/{incident_number}/g, incident.incident_number || 'N/A')
    .replace(/{action}/g, actionLabels[action] || action);
}

/**
 * Send internal notification
 */
async function sendInternalNotification(recipientEmail, incident, message, rule) {
  try {
    await base44.entities.Notification.create({
      title: rule.name,
      message: message,
      type: 'incident_notification',
      priority: incident.severity || 'medium',
      related_incident_id: incident.id,
      user_email: recipientEmail,
      read: false
    });
  } catch (error) {
    console.error('Error sending internal notification:', error);
  }
}

/**
 * Send email notification
 */
async function sendEmailNotification(recipientEmail, incident, message, rule) {
  try {
    const severityEmojis = {
      low: '🔵',
      medium: '🟡',
      high: '🟠',
      critical: '🔴'
    };

    await base44.integrations.Core.SendEmail({
      to: recipientEmail,
      subject: `${severityEmojis[incident.severity] || '🔔'} ${rule.name}`,
      body: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #f97316 0%, #ea580c 100%); padding: 20px; border-radius: 8px 8px 0 0;">
            <h2 style="color: white; margin: 0;">Sistema de Incidentes ICS</h2>
          </div>
          <div style="background: #f8f9fa; padding: 20px; border-radius: 0 0 8px 8px;">
            <h3 style="color: #1f2937; margin-top: 0;">${rule.name}</h3>
            <div style="background: white; padding: 15px; border-radius: 6px; margin: 15px 0;">
              <pre style="white-space: pre-wrap; font-family: Arial, sans-serif; margin: 0;">${message}</pre>
            </div>
            <div style="margin-top: 15px; padding: 10px; background: #e7f3ff; border-left: 4px solid #2563eb; border-radius: 4px;">
              <p style="margin: 0; font-size: 14px; color: #1e40af;">
                <strong>Incidente #${incident.incident_number || 'N/A'}</strong><br>
                ${incident.name}
              </p>
            </div>
          </div>
        </div>
      `
    });
  } catch (error) {
    console.error('Error sending email notification:', error);
  }
}
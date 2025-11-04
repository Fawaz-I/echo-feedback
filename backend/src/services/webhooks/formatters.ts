/**
 * Webhook payload formatters for different platforms
 */

import type { WebhookPayload } from './types';

/**
 * Format payload for Slack
 */
export function formatSlackPayload(feedback: WebhookPayload): unknown {
  const emoji = {
    positive: '😊',
    neutral: '😐',
    negative: '😞',
  }[feedback.sentiment] || '📢';

  const priorityColor = {
    high: '#ff0000',
    medium: '#ffa500',
    low: '#00ff00',
  }[feedback.priority] || '#808080';

  return {
    blocks: [
      {
        type: 'header',
        text: {
          type: 'plain_text',
          text: `${emoji} New Feedback: ${feedback.category}`,
        },
      },
      {
        type: 'section',
        fields: [
          {
            type: 'mrkdwn',
            text: `*Summary:*\n${feedback.summary}`,
          },
          {
            type: 'mrkdwn',
            text: `*Sentiment:* ${feedback.sentiment}\n*Priority:* ${feedback.priority}`,
          },
        ],
      },
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `*Transcript:*\n> ${feedback.transcript}`,
        },
      },
      {
        type: 'context',
        elements: [
          {
            type: 'mrkdwn',
            text: `ID: ${feedback.id} | ${feedback.timestamp}`,
          },
        ],
      },
    ],
    attachments: [
      {
        color: priorityColor,
        blocks: [
          {
            type: 'section',
            text: {
              type: 'mrkdwn',
              text: `<${feedback.audioUrl}|🎧 Listen to audio>`,
            },
          },
        ],
      },
    ],
  };
}

/**
 * Format payload for Jira (creates issue)
 */
export function formatJiraPayload(feedback: WebhookPayload): unknown {
  return {
    fields: {
      project: {
        key: 'FEEDBACK', // This should be configurable
      },
      summary: feedback.summary,
      description: {
        type: 'doc',
        version: 1,
        content: [
          {
            type: 'paragraph',
            content: [
              {
                type: 'text',
                text: 'Transcript:',
                marks: [{ type: 'strong' }],
              },
            ],
          },
          {
            type: 'paragraph',
            content: [
              {
                type: 'text',
                text: feedback.transcript,
              },
            ],
          },
          {
            type: 'paragraph',
            content: [
              {
                type: 'text',
                text: `Sentiment: ${feedback.sentiment} | Priority: ${feedback.priority}`,
              },
            ],
          },
          {
            type: 'paragraph',
            content: [
              {
                type: 'text',
                text: 'Audio: ',
              },
              {
                type: 'text',
                text: feedback.audioUrl,
                marks: [{ type: 'link', attrs: { href: feedback.audioUrl } }],
              },
            ],
          },
        ],
      },
      issuetype: {
        name: feedback.category === 'bug' ? 'Bug' : 'Task',
      },
      priority: {
        name: feedback.priority.charAt(0).toUpperCase() + feedback.priority.slice(1),
      },
    },
  };
}

/**
 * Format payload for GitHub (creates issue)
 */
export function formatGitHubPayload(feedback: WebhookPayload): unknown {
  const labels = [feedback.category, feedback.sentiment, `priority-${feedback.priority}`];

  return {
    title: feedback.summary,
    body: `## Transcript\n\n${feedback.transcript}\n\n---\n\n**Sentiment:** ${feedback.sentiment}\n**Priority:** ${feedback.priority}\n**Audio:** [Listen](${feedback.audioUrl})\n\n*Feedback ID: ${feedback.id}*`,
    labels,
  };
}

/**
 * Format payload for Notion (creates database entry)
 */
export function formatNotionPayload(feedback: WebhookPayload, databaseId: string): unknown {
  return {
    parent: { database_id: databaseId },
    properties: {
      Title: {
        title: [
          {
            text: {
              content: feedback.summary,
            },
          },
        ],
      },
      Category: {
        select: {
          name: feedback.category,
        },
      },
      Sentiment: {
        select: {
          name: feedback.sentiment,
        },
      },
      Priority: {
        select: {
          name: feedback.priority,
        },
      },
      Transcript: {
        rich_text: [
          {
            text: {
              content: feedback.transcript,
            },
          },
        ],
      },
      'Audio URL': {
        url: feedback.audioUrl,
      },
      'Feedback ID': {
        rich_text: [
          {
            text: {
              content: feedback.id,
            },
          },
        ],
      },
    },
  };
}

/**
 * Detect webhook type from URL and format accordingly
 */
export function formatPayload(feedback: WebhookPayload, webhookUrl: string): unknown {
  const url = webhookUrl.toLowerCase();

  if (url.includes('slack.com')) {
    return formatSlackPayload(feedback);
  } else if (url.includes('atlassian.net') || url.includes('jira')) {
    return formatJiraPayload(feedback);
  } else if (url.includes('github.com') || url.includes('api.github.com')) {
    return formatGitHubPayload(feedback);
  } else if (url.includes('notion.com') || url.includes('notion.so')) {
    // Extract database ID from URL if present
    const match = url.match(/([a-f0-9]{32})/);
    const databaseId = match ? match[1] : 'YOUR_DATABASE_ID';
    return formatNotionPayload(feedback, databaseId);
  }

  // Generic format for unknown webhooks
  return feedback;
}

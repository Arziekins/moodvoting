const { WebClient } = require('@slack/web-api');

const token = process.env.SLACK_BOT_TOKEN;
const channel = process.env.SLACK_CHANNEL_ID;

let client = null;

function getClient() {
  if (!client) client = new WebClient(token);
  return client;
}

async function sendRecapToSlack(roomId, users) {
  if (!token || !channel) {
    console.warn('[slack] Missing SLACK_BOT_TOKEN or SLACK_CHANNEL_ID; skipping');
    return;
  }
  const participants = users.length;
  const average = users.length > 0
    ? (users.reduce((sum, u) => sum + ((u.vote && u.vote.scale) || 0), 0) / users.length).toFixed(1)
    : '0.0';
  const lines = users.map(u => `${u.name}: ${u.vote ? `${u.vote.emoji} ${u.vote.scale}/10` : 'No vote'}`);
  const text = [
    `🎉 Mood Voting Recap for Room ${roomId}`,
    `👥 Participants: ${participants}`,
    '',
    ...lines,
    '',
    `📊 Average: ${average}/10`
  ].join('\n');

  const slack = getClient();
  await slack.chat.postMessage({ channel, text });
}

module.exports = { sendRecapToSlack };




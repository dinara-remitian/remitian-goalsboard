// ============================================================
// n8n — "Push Sync JSON to GitHub" node
//
// Add this as a Code node AFTER "Post to Goals Channel"
// Then connect it to an HTTP Request node that PUTs to GitHub API
//
// This node collects all the formatted messages from the channel
// and builds a sync.json payload for the GoalsBoard.
// ============================================================

// Get the message that was just posted to the goals channel
const item = $input.first().json;

// Build the raw text entry for sync.json
// The Format Goals Message node outputs: channelMessage, messageType, userId, etc.
const channelMessage = item.channelMessage || item.text || '';
const messageType = item.messageType || 'goals'; // goals, status, or notes

// Read existing sync data or start fresh
let existingRaw = '';
try {
  // In n8n, you'd fetch the current sync.json from GitHub first
  // const ghRes = await this.helpers.httpRequest({ url: `https://api.github.com/repos/Remitian/remitian-goalsboard/contents/public/sync.json`, headers: { Authorization: `Bearer ${ghToken}` } });
  // existingRaw = JSON.parse(Buffer.from(ghRes.content, 'base64').toString()).raw || '';
} catch (e) {
  existingRaw = '';
}

// Append the new message
const updatedRaw = existingRaw + '\n' + channelMessage + '\n';

const syncJson = {
  updated: new Date().toISOString(),
  source: 'n8n-goalboard-sync',
  raw: updatedRaw.trim()
};

return [{
  json: {
    syncPayload: JSON.stringify(syncJson, null, 2),
    // GitHub API expects base64 content
    syncBase64: Buffer.from(JSON.stringify(syncJson, null, 2)).toString('base64'),
    repo: 'Remitian/remitian-goalsboard',
    path: 'public/sync.json',
    message: `sync: update goalsboard data (${messageType} from ${item.userName || 'team'})`,
  }
}];

// ============================================================
// NEXT NODE: HTTP Request to GitHub API
//
// Method: PUT
// URL: https://api.github.com/repos/{{$json.repo}}/contents/{{$json.path}}
// Headers:
//   Authorization: Bearer <GITHUB_PAT>
//   Content-Type: application/json
// Body:
// {
//   "message": "{{$json.message}}",
//   "content": "{{$json.syncBase64}}",
//   "sha": "<current file SHA — fetch first with GET>"
// }
//
// This triggers GitHub Pages rebuild automatically.
// ============================================================

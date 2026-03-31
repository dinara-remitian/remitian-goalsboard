#!/usr/bin/env node

/**
 * Sync script for GoalsBoard
 *
 * This script is meant to be run via Claude Code (which has Slack MCP access)
 * or via n8n webhook. It reads #goalboard-sync and outputs updated team data.
 *
 * Usage from Claude Code:
 *   "Read #goalboard-sync and update the board"
 *
 * The n8n workflow can also call this via GitHub Actions to auto-deploy.
 */

// This file documents the sync flow for reference.
// Actual sync happens through:
// 1. Claude Code reading Slack MCP → updating src/data/team.js → git push
// 2. n8n webhook → GitHub API → updates src/data/team.js → auto-deploy
// 3. Manual CSV import (like the March spreadsheet)

console.log("GoalsBoard Sync");
console.log("===============");
console.log("");
console.log("Sync methods:");
console.log("  1. Claude Code: Ask Claude to read #goalboard-sync and update team.js");
console.log("  2. CSV Import:  Provide the weekly goals spreadsheet to Claude");
console.log("  3. n8n Webhook: Auto-sync via n8n workflow (coming soon)");
console.log("");
console.log("The board at /data/team.js is the source of truth for the current week.");
console.log("History at /data/history.js tracks monthly aggregates.");

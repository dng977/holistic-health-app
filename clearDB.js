// Simple script to clear the SQLite database for fresh seeding
const fs = require('fs');
const path = require('path');

// This would be the typical location for Expo SQLite databases
// The actual path may vary depending on the device/simulator
console.log('Note: This script is for reference. The SQLite database will be cleared when you restart the app with --clear flag.');
console.log('The database file is typically stored in the app\'s documents directory on the device/simulator.');
console.log('Use: npx expo start --clear to clear Metro cache and force re-initialization.');

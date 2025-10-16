# Audio Files for Notification System

This directory should contain the following audio files:

## Required Files

1. **work-complete.mp3** - Pleasant notification sound when work period completes
   - Duration: 1-2 seconds
   - Format: MP3
   - Size: < 100KB
   - Suggested sound: Bell, chime, or pleasant ding
   - Sample rate: 44.1kHz or 22.05kHz

2. **break-complete.mp3** - Softer completion sound when break completes
   - Duration: 1-2 seconds
   - Format: MP3
   - Size: < 100KB
   - Suggested sound: Soft ding or gentle notification
   - Sample rate: 44.1kHz or 22.05kHz

## Generation Instructions

To generate these audio files, you can:

1. Use online audio generation tools (e.g., freesound.org, soundbible.com)
2. Use audio editing software (e.g., Audacity) to create/trim sounds
3. Use Web Audio API to generate programmatic sounds
4. Purchase or download royalty-free notification sounds

## Testing Without Audio Files

The notification system will gracefully degrade if audio files are not found:

- An error will be logged to console
- Other notification channels (popup, browser notification, vibration) will continue to work
- No errors will break the application

## Future Enhancement

Consider using Web Audio API to generate notification sounds programmatically to eliminate the need for external audio files.

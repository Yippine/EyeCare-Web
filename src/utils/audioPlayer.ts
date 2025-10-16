import {
  NotificationType,
  type AudioPlayer as IAudioPlayer,
} from '../types/notification'

/**
 * Manages audio playback for notifications
 * Preloads audio files and provides volume control
 */
class AudioPlayerImpl implements IAudioPlayer {
  private workAudio: HTMLAudioElement | null = null
  private breakAudio: HTMLAudioElement | null = null
  private currentVolume: number = 70

  /**
   * Load and preload audio files
   * @returns Promise that resolves when audio files are loaded
   */
  async load(): Promise<void> {
    try {
      // Create audio elements for work and break complete sounds
      this.workAudio = new Audio('/audio/work-complete.mp3')
      this.breakAudio = new Audio('/audio/break-complete.mp3')

      // Preload audio files
      this.workAudio.preload = 'auto'
      this.breakAudio.preload = 'auto'

      // Set initial volume
      this.setVolume(this.currentVolume)

      console.log('Audio files loaded successfully')
    } catch (error) {
      console.error('Error loading audio files:', error)
    }
  }

  /**
   * Play audio for the given notification type
   * @param type Notification type (work or break complete)
   * @param volume Volume level (0-100)
   */
  async play(type: NotificationType, volume: number): Promise<void> {
    try {
      // Select appropriate audio based on type
      const audio =
        type === NotificationType.WorkComplete
          ? this.workAudio
          : this.breakAudio

      if (!audio) {
        console.warn('Audio not loaded yet')
        return
      }

      // Stop any currently playing audio
      this.stop()

      // Set volume
      this.setVolume(volume)

      // Reset audio to start
      audio.currentTime = 0

      // Play audio
      await audio.play()
    } catch (error) {
      console.error('Error playing audio:', error)
      // Graceful degradation - don't throw error
    }
  }

  /**
   * Set volume for all audio elements
   * @param level Volume level (0-100)
   */
  setVolume(level: number): void {
    // Clamp volume between 0 and 100
    const clampedLevel = Math.max(0, Math.min(100, level))
    this.currentVolume = clampedLevel

    // Convert to 0-1 range for HTML audio element
    const normalizedVolume = clampedLevel / 100

    if (this.workAudio) {
      this.workAudio.volume = normalizedVolume
    }
    if (this.breakAudio) {
      this.breakAudio.volume = normalizedVolume
    }
  }

  /**
   * Stop all currently playing audio
   */
  stop(): void {
    if (this.workAudio && !this.workAudio.paused) {
      this.workAudio.pause()
      this.workAudio.currentTime = 0
    }
    if (this.breakAudio && !this.breakAudio.paused) {
      this.breakAudio.pause()
      this.breakAudio.currentTime = 0
    }
  }
}

// Singleton instance
export const audioPlayer = new AudioPlayerImpl()

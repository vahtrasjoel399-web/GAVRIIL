import type { MusicContent } from './types'

// Background music. Put the files in /public/media/audio and list them here:
// the songs play one after another and start over after the last one.

export const music: MusicContent = {
  tracks: [{ src: '/media/audio/placeholder-theme.mp3', title: 'Тема книги' }],
  volume: 0.4,
}

// Songs from Spotify, in a small player in the corner. Take the id from the share link:
// open.spotify.com/track/<id>. Without a Spotify login in the browser only 30 seconds play.
// While a song plays, the background music above goes quiet.

export const spotify = {
  label: 'Песни',
  tracks: [{ id: '0XxXIiZP0rJBS8S841UVdu', title: 'dance with me' }],
}

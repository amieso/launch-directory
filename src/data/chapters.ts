import { Chapter } from '@/types/video'

// Mock chapter data for existing videos
// This can be swapped to an API call later
const videoChapters: Record<string, Chapter[]> = {
  '1': [ // Lovable Launch (92s)
    { id: 'c1', title: 'Intro', startTime: 0 },
    { id: 'c2', title: 'The Problem', startTime: 12 },
    { id: 'c3', title: 'Product Demo', startTime: 28 },
    { id: 'c4', title: 'Features', startTime: 55 },
    { id: 'c5', title: 'Get Started', startTime: 78 },
  ],
  '2': [ // Lightfield (187s)
    { id: 'c1', title: 'Opening', startTime: 0 },
    { id: 'c2', title: 'The Technology', startTime: 25 },
    { id: 'c3', title: 'Use Cases', startTime: 70 },
    { id: 'c4', title: 'Deep Dive', startTime: 120 },
    { id: 'c5', title: 'Future Vision', startTime: 165 },
  ],
  '3': [ // ChatGPT Atlas (98s)
    { id: 'c1', title: 'Intro', startTime: 0 },
    { id: 'c2', title: 'Atlas Browser', startTime: 15 },
    { id: 'c3', title: 'Live Demo', startTime: 40 },
    { id: 'c4', title: 'Wrap Up', startTime: 80 },
  ],
  '4': [ // Cluely (99s)
    { id: 'c1', title: 'The Problem', startTime: 0 },
    { id: 'c2', title: 'Meet Cluely', startTime: 18 },
    { id: 'c3', title: 'In Action', startTime: 45 },
    { id: 'c4', title: 'Get Started', startTime: 82 },
  ],
  '5': [ // Dia Arc (78s)
    { id: 'c1', title: 'Arc Members', startTime: 0 },
    { id: 'c2', title: 'Introducing Dia', startTime: 12 },
    { id: 'c3', title: 'Features', startTime: 35 },
    { id: 'c4', title: 'Join Now', startTime: 62 },
  ],
  '6': [ // Bump (51s)
    { id: 'c1', title: 'From Zenly', startTime: 0 },
    { id: 'c2', title: 'Stay Close', startTime: 15 },
    { id: 'c3', title: 'Download', startTime: 38 },
  ],
  '7': [ // Ray Bloom (59s)
    { id: 'c1', title: 'Meet Ray', startTime: 0 },
    { id: 'c2', title: 'AI Companion', startTime: 18 },
    { id: 'c3', title: 'Try It', startTime: 45 },
  ],
  '8': [ // ElevenLabs (48s)
    { id: 'c1', title: 'Voice AI', startTime: 0 },
    { id: 'c2', title: 'New Features', startTime: 12 },
    { id: 'c3', title: 'Create', startTime: 32 },
  ],
  '9': [ // Human Interface (211s)
    { id: 'c1', title: 'Intro', startTime: 0 },
    { id: 'c2', title: 'Our Vision', startTime: 30 },
    { id: 'c3', title: 'The Product', startTime: 75 },
    { id: 'c4', title: 'Series B', startTime: 140 },
    { id: 'c5', title: 'Join Us', startTime: 185 },
  ],
  '10': [ // $3M Funding (85s)
    { id: 'c1', title: 'Big News', startTime: 0 },
    { id: 'c2', title: 'Our Journey', startTime: 20 },
    { id: 'c3', title: 'What\'s Next', startTime: 55 },
    { id: 'c4', title: 'Thank You', startTime: 72 },
  ],
  '11': [ // Furqan VC World (90s)
    { id: 'c1', title: 'The Misstep', startTime: 0 },
    { id: 'c2', title: 'A New Way', startTime: 25 },
    { id: 'c3', title: 'The Foundation', startTime: 55 },
    { id: 'c4', title: 'Join Us', startTime: 78 },
  ],
  '12': [ // Amie (54s)
    { id: 'c1', title: 'Joyful', startTime: 0 },
    { id: 'c2', title: 'Calendar', startTime: 15 },
    { id: 'c3', title: 'Tasks', startTime: 32 },
    { id: 'c4', title: 'Try Amie', startTime: 45 },
  ],
}

export function getChaptersForVideo(videoId: string): Chapter[] {
  return videoChapters[videoId] || []
}

import jeremyImg from '@assets/jeremy.webp'
import type { ImageMetadata } from 'astro'

export interface Props {
  name: string
  slug: string
  image: ImageMetadata
  bio: string
}

export type Author = Props

export const authors: Props[] = [
  {
    name: 'Jeremy London',
    slug: 'jeremy-london',
    image: jeremyImg,
    bio: 'Engineering leader and builder in Denver. I write about AI platforms, agents, security, reliability, homelab infrastructure, and the parts of engineering work that have to survive production.',
  },
]

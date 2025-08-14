export interface Props {
  name: string
  slug: string
  image: string
  bio: string
}

export type Author = Props

export const authors: Props[] = [
  {
    name: 'Jeremy London',
    slug: 'jeremy-london',
    image: '/images/jeremy.webp',
    bio: "Based in Denver and fill my days with creativity and curiosity. When I'm not snowboarding fresh powder, I'm in the kitchen chasing the perfect recipe or playing my guitar. I love to tinker, experimenting with flavors, sounds, and ideas, always looking for ways to turn the ordinary into something a little more extraordinary.",
  },
]

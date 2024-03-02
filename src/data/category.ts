export interface Props {
  title: string;
  slug: string;
  color: "green" | "blue" | "orange" | "purple" | "pink" | "yellow";
  description: string;
}
export type Category = Props;

export const categories: Props[] = [
  {
    "title": "Deep Learning Basics",
    "slug": "deep-learning-basics",
    "color": "green",
    "description": "Dive into the foundational concepts of deep learning. Explore the building blocks that power neural networks and AI innovations."
  },
  {
    "title": "Deep Learning Networks",
    "slug": "deep-learning-networks",
    "color": "blue",
    "description": "Unravel the complexities of neural networks. From CNNs to RNNs, learn how these architectures drive the future of AI."
  },
  {
    "title": "Advance Deep Learning",
    "slug": "advance-deep-learning",
    "color": "purple",
    "description": "Push the boundaries of AI with advanced deep learning techniques. Explore cutting-edge research and applications shaping our world."
  },
  {
    "title": "Deep Learning Principals",
    "slug": "deep-learning-principals",
    "color": "pink",
    "description": "Master the principles that underpin deep learning. Gain insights into the theory and practice that fuel AI progress."
  }
]


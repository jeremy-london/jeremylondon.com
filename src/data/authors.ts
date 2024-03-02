export interface Props {
  name: string;
  slug: string;
  image: string;
  bio: string;
}

export type Author = Props;

export const authors: Props[] = [
  {
    name: "Jeremy London",
    slug: "jeremy-london",
    image: "/images/jeremy.png",
    bio: "Jeremy from Denver: AI/ML engineer with Startup & Lockheed Martin experience, passionate about LLMs & cloud tech. Loves cooking, guitar, & snowboarding. Full Stack AI Engineer by day, Python enthusiast by night. Expert in MLOps, Kubernetes, committed to ethical AI."
  }
];

export type Achievement = {
  year: number;
  title: string;
  description: string;
};

export const achievements: Achievement[] = [
  {
    year: 2024,
    title: "International AI Hackathon Winners",
    description: "A team of our students won first place at the International AI Hackathon in Silicon Valley, presenting an innovative project on sustainable urban planning.",
  },
  {
    year: 2024,
    title: "Record Research Funding",
    description: "Secured a record $10 million in research funding for advancements in biotechnology and renewable energy.",
  },
  {
    year: 2023,
    title: "National Robotics Competition",
    description: "Our robotics club, 'The Gearheads', clinched the national title with their autonomous rescue robot.",
  },
  {
    year: 2023,
    title: "Published 50+ Research Papers",
    description: "Faculty and students co-authored over 50 papers published in high-impact international journals.",
  },
  {
    year: 2023,
    title: "Top University for Entrepreneurship",
    description: "Named the top university for fostering student startups by a leading business magazine.",
  },
  {
    year: 2022,
    title: "Green Campus Award",
    description: "Recognized for outstanding sustainability initiatives and achieving a carbon-neutral campus.",
  },
  {
    year: 2022,
    title: "National Debate Champions",
    description: "The university's debate society won the national inter-college debate championship for the third consecutive year.",
  },
];

export type CollegeEvent = {
  title: string;
  date: string;
  description: string;
  category: "Academic" | "Cultural" | "Sports" | "Workshop";
};

export const events: CollegeEvent[] = [
  {
    title: 'Annual Tech Fest "Innovate 2024"',
    date: "2024-10-15",
    description: "A three-day extravaganza of technology, workshops, and competitions, featuring guest speakers from top tech companies.",
    category: "Workshop",
  },
  {
    title: "Inter-College Sports Meet",
    date: "2024-11-05",
    description: "Athletes from over 50 colleges will compete in a variety of track and field events.",
    category: "Sports",
  },
  {
    title: "Alumni Homecoming Weekend",
    date: "2024-12-20",
    description: "A special weekend for alumni to reconnect, network, and revisit their campus memories.",
    category: "Cultural",
  },
  {
    title: "Quantum Computing Seminar",
    date: "2024-09-25",
    description: "A deep dive into the future of computing with Dr. Evelyn Reed, a pioneer in quantum physics.",
    category: "Academic",
  },
  {
    title: 'Cultural Night "Spectrum"',
    date: "2023-04-12",
    description: "An evening showcasing the diverse cultural talents of our students, from music and dance to theater and art.",
    category: "Cultural",
  },
  {
    title: "Convocation Ceremony 2023",
    date: "2023-08-20",
    description: "Celebrating the academic achievements of our graduating class of 2023.",
    category: "Academic",
  },
  {
    title: "Startup Incubation Program Launch",
    date: "2023-02-01",
    description: "The launch of our new incubator to support student-led startups with mentorship and seed funding.",
    category: "Workshop",
  },
  {
    title: "Annual Code-a-thon",
    date: "2022-11-18",
    description: "A 24-hour coding challenge where students tackle real-world problems.",
    category: "Workshop",
  }
];

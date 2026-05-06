export interface JobContent {
  presentation: string;
  responsibilities: string[];
  profile: string[];
  practical: string;
}

export interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  contract: string;
  sector: string;
  salary: string;
  date: string;
  image: string;
  tags: string[];
  excerpt: string;
  content: JobContent;
}

import { ModernTemplate } from '@/components/html-templates/ModernTemplate'

const sampleData = {
  personal: {
    fullName: "Ahmad Hassan",
    title: "Senior Software Engineer",
    email: "ahmad.hassan@gmail.com",
    phone: "+964 750 123 4567",
    location: "Erbil, Kurdistan Region",
    linkedin: "linkedin.com/in/ahmadhassan",
    website: "ahmadhassan.dev",
    profileImage: "",
    dateOfBirth: "",
    gender: "",
    nationality: "Kurdish",
    maritalStatus: "",
    country: "Iraq",
    originalProfileImage: "",
    profileImageCrop: undefined,
  },
  summary: "Results-driven Senior Software Engineer with 5+ years of experience building scalable web applications and leading engineering teams. Expert in React, TypeScript, and cloud infrastructure. Passionate about creating elegant solutions to complex problems and mentoring junior developers.",
  experience: [
    {
      id: "1",
      jobTitle: "Lead Developer",
      company: "Korek Telecom",
      location: "Erbil, Kurdistan",
      startDate: "2022-01",
      endDate: "",
      current: true,
      description: "<ul><li>Led team of 8 engineers building customer-facing platforms serving 4M+ subscribers</li><li>Reduced page load time by 40% through performance optimization and code splitting</li><li>Implemented CI/CD pipeline reducing deployment time from 2 hours to 15 minutes</li><li>Architected microservices migration reducing infrastructure costs by 30%</li></ul>",
    },
    {
      id: "2",
      jobTitle: "Software Engineer",
      company: "Tech Solutions Ltd",
      location: "Baghdad, Iraq",
      startDate: "2019-06",
      endDate: "2021-12",
      current: false,
      description: "<ul><li>Built REST APIs serving 100K+ daily requests with 99.9% uptime</li><li>Designed database architecture for multi-tenant SaaS platform</li><li>Developed real-time dashboard using WebSocket and React</li></ul>",
    },
  ],
  education: [
    {
      id: "1",
      degree: "BSc",
      field: "Computer Science",
      school: "University of Kurdistan Hewler",
      location: "Erbil",
      startDate: "2015",
      endDate: "2019",
      gpa: "3.7/4.0",
      achievements: "Dean's List, Senior Project Award",
    },
  ],
  skills: [
    { id: "1", name: "React / Next.js", level: "Expert" },
    { id: "2", name: "TypeScript", level: "Expert" },
    { id: "3", name: "Node.js", level: "Advanced" },
    { id: "4", name: "Python", level: "Advanced" },
    { id: "5", name: "AWS / Cloud", level: "Advanced" },
    { id: "6", name: "Docker / K8s", level: "Intermediate" },
    { id: "7", name: "PostgreSQL", level: "Advanced" },
  ],
  languages: [
    { id: "1", name: "Kurdish", proficiency: "Native" },
    { id: "2", name: "English", proficiency: "Fluent" },
    { id: "3", name: "Arabic", proficiency: "Professional" },
  ],
  certifications: [
    { id: "1", name: "AWS Solutions Architect", issuer: "Amazon Web Services", date: "2023", expiryDate: "2026" },
  ],
  projects: [
    { id: "1", name: "Work.krd", technologies: "Next.js, TypeScript, Tailwind", description: "AI-powered resume builder for Kurdistan", link: "https://work.krd" },
  ],
}

export default function DemoPage() {
  return (
    <div style={{ display: "flex", justifyContent: "center", padding: "20px", background: "#f5f5f5", minHeight: "100vh" }}>
      <ModernTemplate data={sampleData} watermark={false} />
    </div>
  )
}
import bcrypt from "bcrypt";
import { config } from "dotenv";
import connectToDatabase from "./config/database.js";
import User from "./models/user.model.js";
import Event from "./models/event.model.js";

config();

await connectToDatabase();

const realOpportunities = [
  {
    title: "MLH Fellowship",
    description: "A remote, 12-week program where you contribute to projects from companies like Meta and AWS. It's a great alternative to traditional internships with a focus on real-world production code.",
    category: "internship",
    provider: "Major League Hacking",
    deadline: new Date("2026-08-31"),
    mode: "online",
    status: "active",
    imageUrl: "https://images.unsplash.com/photo-1552664730-d307ca88d978?w=800&h=400&fit=crop",
    link: "https://fellowship.mlh.io",
    eligibility: "Open to all developers with coding experience",
    requirements: "Active GitHub profile, coding experience, ability to work 12 weeks",
    benefits: "Remote work, mentorship, portfolio projects, networking opportunities",
    isFeatured: true,
    tags: ["remote", "fellowship", "open-source", "mentorship"]
  },
  {
    title: "Google Summer of Code",
    description: "GSoC connects beginners with open-source organizations for structured, mentored projects. It is a highly recognized credential for any developer's resume.",
    category: "internship",
    provider: "Google",
    deadline: new Date("2027-03-31"),
    mode: "online",
    status: "active",
    imageUrl: "https://images.unsplash.com/photo-1552664730-d307ca88d978?w=800&h=400&fit=crop",
    link: "https://summerofcode.withgoogle.com",
    eligibility: "Students and open source contributors",
    requirements: "Programming experience, open source contributions, academic enrollment",
    benefits: "Stipend, mentorship, real-world experience, Google recognition",
    isFeatured: true,
    tags: ["google", "open-source", "summer", "mentorship", "stipend"]
  },
  {
    title: "Outreachy",
    description: "This program provides paid, remote internships for people subject to systemic bias. Interns receive a $7,000 USD stipend for three months of work on open-source or open-science projects.",
    category: "internship",
    provider: "Outreachy",
    deadline: new Date("2026-04-15"),
    mode: "online",
    status: "active",
    imageUrl: "https://images.unsplash.com/photo-1552664730-d307ca88d978?w=800&h=400&fit=crop",
    link: "https://www.outreachy.org/apply",
    eligibility: "Underrepresented groups in tech",
    requirements: "Technical skills, passion for open source, communication skills",
    benefits: "$7,000 USD stipend, remote work, mentorship, portfolio projects",
    isFeatured: true,
    tags: ["remote", "paid", "diversity", "open-source", "stipend"]
  },
  {
    title: "NASA Internship Program",
    description: "Offers prestigious paid opportunities in space exploration, robotics, and climate science.",
    category: "internship",
    provider: "NASA",
    deadline: new Date("2026-05-22"),
    mode: "hybrid",
    location: "Houston, TX & Remote",
    status: "active",
    imageUrl: "https://images.unsplash.com/photo-1446776877603-5481bd4890e5?w=800&h=400&fit=crop",
    link: "https://www.nasa.gov/humans-at-nasa/careers",
    eligibility: "US citizens, STEM students",
    requirements: "US citizenship, enrollment in STEM program, security clearance",
    benefits: "Prestigious experience, competitive pay, networking, contribution to space exploration",
    isFeatured: true,
    tags: ["nasa", "space", "robotics", "science", "prestigious"]
  },
  {
    title: "CERN Technical Student Programme",
    description: "Work at the home of Large Hadron Collider on software engineering or data science projects. They provide monthly stipends and travel allowances.",
    category: "internship",
    provider: "CERN",
    deadline: new Date("2026-12-31"),
    mode: "onsite",
    location: "Geneva, Switzerland",
    status: "active",
    imageUrl: "https://images.unsplash.com/photo-1552664730-d307ca88d978?w=800&h=400&fit=crop",
    link: "https://careers.cern/students",
    eligibility: "Software & electrical engineering students",
    requirements: "Enrollment in university, engineering background, programming skills",
    benefits: "Monthly stipend, travel allowance, work on cutting-edge physics projects",
    isFeatured: true,
    tags: ["cern", "physics", "software", "engineering", "research"]
  },
  {
    title: "TikTok Internships",
    description: "Algorithm & infrastructure developers for Fall 2026 / Summer 2027. Big tech companies are currently recruiting for late 2026 and early 2027 roles.",
    category: "internship",
    provider: "TikTok",
    deadline: new Date("2026-09-30"),
    mode: "hybrid",
    location: "Global",
    status: "active",
    imageUrl: "https://images.unsplash.com/photo-1552664730-d307ca88d978?w=800&h=400&fit=crop",
    link: "https://careers.tiktok.com",
    eligibility: "Computer science and engineering students",
    requirements: "Algorithm knowledge, infrastructure experience, programming skills",
    benefits: "Competitive salary, tech industry experience, global impact",
    isFeatured: true,
    tags: ["tiktok", "algorithm", "infrastructure", "social-media", "big-tech"]
  },
  {
    title: "Generation Google Scholarship",
    description: "Diverse students in Computer Science receive $10,000 USD for tuition and expenses.",
    category: "scholarship",
    provider: "Google",
    deadline: new Date("2026-05-31"),
    mode: "online",
    status: "active",
    imageUrl: "https://images.unsplash.com/photo-1552664730-d307ca88d978?w=800&h=400&fit=crop",
    link: "https://buildyourfuture.withgoogle.com/scholarships/",
    eligibility: "Diverse students in CS",
    requirements: "Academic excellence, leadership, passion for technology",
    benefits: "$10,000 USD, mentorship, Google network, career development",
    isFeatured: true,
    tags: ["google", "scholarship", "diversity", "education", "funding"]
  },
  {
    title: "DoD SMART Scholarship",
    description: "US/UK/CA students receive Full Tuition + $30k-$46k stipend.",
    category: "scholarship",
    provider: "Department of Defense",
    deadline: new Date("2026-05-31"),
    mode: "online",
    status: "active",
    imageUrl: "https://images.unsplash.com/photo-1552664730-d307ca88d978?w=800&h=400&fit=crop",
    link: "https://www.smartscholarshipforstem.org",
    eligibility: "US/UK/CA students in STEM",
    requirements: "STEM enrollment, security clearance eligibility, academic merit",
    benefits: "Full tuition coverage, $30k-$46k stipend, guaranteed employment",
    isFeatured: true,
    tags: ["dod", "scholarship", "government", "stem", "full-tuition"]
  },
  {
    title: "Palantir Women in Tech",
    description: "Women pursuing dev roles receive $7,000 USD + early internship access.",
    category: "scholarship",
    provider: "Palantir",
    deadline: new Date("2026-06-30"),
    mode: "online",
    status: "active",
    imageUrl: "https://images.unsplash.com/photo-1552664730-d307ca88d978?w=800&h=400&fit=crop",
    link: "https://www.palantir.com/careers/university",
    eligibility: "Women in technology fields",
    requirements: "Women in STEM, academic excellence, leadership potential",
    benefits: "$7,000 USD, early internship access, mentorship, Palantir network",
    isFeatured: true,
    tags: ["palantir", "women-in-tech", "scholarship", "diversity"]
  },
  {
    title: "Adobe Research Fellowship",
    description: "PhD & advanced dev students receive $10,000 USD + 1-on-1 mentorship.",
    category: "fellowship",
    provider: "Adobe",
    deadline: new Date("2026-06-30"),
    mode: "online",
    status: "active",
    imageUrl: "https://images.unsplash.com/photo-1552664730-d307ca88d978?w=800&h=400&fit=crop",
    link: "https://research.adobe.com/fellowship",
    eligibility: "PhD & advanced dev students",
    requirements: "Advanced degree, research experience, technical skills",
    benefits: "$10,000 USD, 1-on-1 mentorship, Adobe research access",
    isFeatured: true,
    tags: ["adobe", "research", "fellowship", "phd", "mentorship"]
  },
  {
    title: "NVIDIA Networking Systems",
    description: "Low-level C/C++ & Infrastructure roles for Fall 2026 in Santa Clara, CA.",
    category: "job",
    provider: "NVIDIA",
    deadline: new Date("2026-09-30"),
    mode: "onsite",
    location: "Santa Clara, CA",
    status: "active",
    imageUrl: "https://images.unsplash.com/photo-1552664730-d307ca88d978?w=800&h=400&fit=crop",
    link: "https://nvidia.wd5.myworkdayjobs.com/NVIDIA",
    eligibility: "C/C++ developers, systems programmers",
    requirements: "Strong C/C++ skills, systems programming experience, computer science degree",
    benefits: "Competitive salary, cutting-edge technology, GPU computing experience",
    isFeatured: true,
    tags: ["nvidia", "c++", "systems", "infrastructure", "gpu", "ai"]
  },
  {
    title: "Stripe Software Intern",
    description: "FinTech & API Design internship for Summer 2026 (Remote/Hybrid).",
    category: "internship",
    provider: "Stripe",
    deadline: new Date("2026-06-30"),
    mode: "hybrid",
    location: "Remote/Hybrid",
    status: "active",
    imageUrl: "https://images.unsplash.com/photo-1552664730-d307ca88d978?w=800&h=400&fit=crop",
    link: "https://stripe.com/jobs",
    eligibility: "Computer science students, fintech interest",
    requirements: "Programming skills, API knowledge, security awareness",
    benefits: "Competitive pay, fintech experience, remote work options",
    isFeatured: true,
    tags: ["stripe", "fintech", "api", "payments", "remote"]
  },
  {
    title: "Tesla Vehicle Software",
    description: "C++ & Embedded Systems roles for Fall 2026 in Palo Alto, CA.",
    category: "job",
    provider: "Tesla",
    deadline: new Date("2026-09-30"),
    mode: "onsite",
    location: "Palo Alto, CA",
    status: "active",
    imageUrl: "https://images.unsplash.com/photo-1552664730-d307ca88d978?w=800&h=400&fit=crop",
    link: "https://www.tesla.com/careers",
    eligibility: "C++ and embedded systems developers",
    requirements: "Strong C/C++ skills, embedded systems, automotive interest",
    benefits: "Revolutionary company work, competitive salary, EV industry experience",
    isFeatured: true,
    tags: ["tesla", "automotive", "c++", "embedded", "electric-vehicles"]
  },
  {
    title: "CDB Young Professionals",
    description: "2-year job rotation with $60,600/year in development finance.",
    category: "job",
    provider: "Commonwealth Development Bank",
    deadline: new Date("2026-05-15"),
    mode: "online",
    location: "Global",
    status: "active",
    imageUrl: "https://images.unsplash.com/photo-1552664730-d307ca88d978?w=800&h=400&fit=crop",
    link: "https://www.cdb.int/careers",
    eligibility: "Young professionals in development",
    requirements: "Development finance knowledge, analytical skills, global development interest",
    benefits: "$60,600/year, global impact, career development, rotation program",
    isFeatured: true,
    tags: ["cdb", "development", "finance", "global", "rotation"]
  },
  {
    title: "World Bank YPP",
    description: "Digital Transformation career in development tech globally.",
    category: "job",
    provider: "World Bank",
    deadline: new Date("2026-06-30"),
    mode: "online",
    location: "Global",
    status: "active",
    imageUrl: "https://images.unsplash.com/photo-1552664730-d307ca88d978?w=800&h=400&fit=crop",
    link: "https://www.worldbank.org/en/about/careers/young-professionals-program",
    eligibility: "Young professionals interested in development",
    requirements: "Development knowledge, global perspective, analytical skills",
    benefits: "Global impact, development finance experience, competitive salary",
    isFeatured: true,
    tags: ["world-bank", "development", "global", "finance", "transformation"]
  },
  {
    title: "IBM Associate Engineer",
    description: "Full-stack & AI role with rotation through IBM's AI & Cloud teams.",
    category: "job",
    provider: "IBM",
    deadline: new Date("2026-06-30"),
    mode: "hybrid",
    location: "Global",
    status: "active",
    imageUrl: "https://images.unsplash.com/photo-1552664730-d307ca88d978?w=800&h=400&fit=crop",
    link: "https://www.ibm.com/careers",
    eligibility: "Computer science graduates",
    requirements: "Full-stack development, AI/ML knowledge, problem-solving skills",
    benefits: "IBM benefits, career rotation, AI & Cloud experience, global opportunities",
    isFeatured: true,
    tags: ["ibm", "ai", "cloud", "full-stack", "rotation", "enterprise"]
  },
  {
    title: "SpaceX New Grad Eng",
    description: "Autonomous Systems role building software for Starlink & Rockets.",
    category: "job",
    provider: "SpaceX",
    deadline: new Date("2026-09-30"),
    mode: "onsite",
    location: "Hawthorne, CA & Boca Chica, FL",
    status: "active",
    imageUrl: "https://images.unsplash.com/photo-1552664730-d307ca88d978?w=800&h=400&fit=crop",
    link: "https://www.spacex.com/careers",
    eligibility: "Engineering graduates",
    requirements: "Strong engineering background, aerospace interest, systems thinking",
    benefits: "Space industry experience, competitive salary, revolutionary projects",
    isFeatured: true,
    tags: ["spacex", "aerospace", "rockets", "autonomous", "starlink"]
  },
  {
    title: "Notion AI New Grad",
    description: "LLMs & Product Dev role at fast-growing AI productivity platform.",
    category: "job",
    provider: "Notion",
    deadline: new Date("2026-06-30"),
    mode: "remote",
    location: "Remote",
    status: "active",
    imageUrl: "https://images.unsplash.com/photo-1552664730-d307ca88d978?w=800&h=400&fit=crop",
    link: "https://www.notion.so/careers",
    eligibility: "Computer science graduates",
    requirements: "AI/ML interest, product development skills, technical writing",
    benefits: "Remote work, AI industry experience, productivity tools, competitive salary",
    isFeatured: true,
    tags: ["notion", "ai", "productivity", "llm", "remote"]
  }
];

const seedOpportunities = async () => {
  try {
    console.log("Starting to seed opportunities...");

    // Check if opportunities already exist
    const existingOpportunities = await Event.countDocuments();
    if (existingOpportunities > 0) {
      console.log(`Found ${existingOpportunities} opportunities already. Clearing existing data...`);
      await Event.deleteMany({});
    }

    // Get or create admin user
    let adminUser = await User.findOne({ email: "admin@gmail.com" });
    if (!adminUser) {
      console.log("Creating admin user...");
      const hashedPassword = await bcrypt.hash("admin123", 10);
      adminUser = await User.create({
        firstname: "TrackIt",
        lastname: "Admin",
        email: "admin@gmail.com",
        role: "admin",
        password: hashedPassword,
      });
    }

    // Create real opportunities
    console.log("Creating real opportunities...");
    const opportunities = await Event.insertMany(
      realOpportunities.map(opp => ({
        ...opp,
        postedBy: adminUser._id,
        createdAt: new Date(),
        updatedAt: new Date()
      }))
    );

    console.log(`✅ Successfully created ${opportunities.length} real opportunities`);
    console.log("📋 Real opportunities include:");
    opportunities.forEach((opp, index) => {
      console.log(`   ${index + 1}. ${opp.title} (${opp.category}) - ${opp.provider}`);
    });

    process.exit(0);
  } catch (error) {
    console.error("❌ Error seeding opportunities:", error);
    process.exit(1);
  }
};

seedOpportunities();

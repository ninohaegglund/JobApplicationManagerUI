import { Plus, Edit, Trash2 } from "lucide-react";

const textBlocks = [
  {
    id: 1,
    category: "Intro",
    name: "Frontend Specialist Introduction",
    content: "Passionate frontend developer with 8+ years of experience building responsive, accessible web applications using React, TypeScript, and modern CSS frameworks.",
    lastModified: "2026-04-11"
  },
  {
    id: 2,
    category: "Intro",
    name: "Full Stack Introduction",
    content: "Versatile full-stack developer skilled in both frontend and backend technologies, with expertise in React, Node.js, and cloud infrastructure.",
    lastModified: "2026-04-10"
  },
  {
    id: 3,
    category: "Experience",
    name: "React & TypeScript Expertise",
    content: "Deep experience building scalable React applications with TypeScript, implementing component libraries, state management solutions, and optimizing performance for large-scale applications.",
    lastModified: "2026-04-09"
  },
  {
    id: 4,
    category: "Experience",
    name: "Team Leadership",
    content: "Led cross-functional teams of 5-8 developers, established coding standards, conducted code reviews, and mentored junior engineers in best practices and modern development workflows.",
    lastModified: "2026-04-08"
  },
  {
    id: 5,
    category: "Motivation",
    name: "Startup Culture Motivation",
    content: "Excited to join fast-paced startup environments where I can contribute to product direction, work across the full stack, and help build scalable solutions from the ground up.",
    lastModified: "2026-04-07"
  },
  {
    id: 6,
    category: "Motivation",
    name: "Impact-Driven Work",
    content: "Passionate about building products that make a real difference in people's lives. I thrive in environments where I can see the direct impact of my work on user experience and business outcomes.",
    lastModified: "2026-04-05"
  },
  {
    id: 7,
    category: "Closing",
    name: "Standard Closing",
    content: "I would welcome the opportunity to discuss how my skills and experience align with your team's needs. Thank you for considering my application.",
    lastModified: "2026-04-03"
  },
  {
    id: 8,
    category: "Closing",
    name: "Enthusiastic Closing",
    content: "I'm genuinely excited about this opportunity and would love to contribute to your team's success. Looking forward to the possibility of working together!",
    lastModified: "2026-04-01"
  },
];

const categories = ["All", "Intro", "Experience", "Motivation", "Closing"];

function getCategoryColor(category: string) {
  switch (category) {
    case "Intro":
      return "bg-blue-50 text-blue-700 border-blue-200";
    case "Experience":
      return "bg-purple-50 text-purple-700 border-purple-200";
    case "Motivation":
      return "bg-green-50 text-green-700 border-green-200";
    case "Closing":
      return "bg-orange-50 text-orange-700 border-orange-200";
    default:
      return "bg-gray-50 text-gray-700 border-gray-200";
  }
}

export function TextBlocks() {
  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[28px] font-medium mb-1">Text Blocks</h1>
          <p className="text-muted-foreground">Reusable content for cover letters and applications</p>
        </div>
        <button className="inline-flex items-center gap-2 px-4 py-2 bg-foreground text-background rounded-lg hover:bg-foreground/90 transition-colors">
          <Plus className="w-4 h-4" />
          New Text Block
        </button>
      </div>

      {/* Category Filters */}
      <div className="flex gap-2">
        {categories.map((category) => (
          <button
            key={category}
            className={`px-3 py-2 rounded-lg text-sm transition-colors ${
              category === "All"
                ? "bg-foreground text-background"
                : "bg-white border border-border hover:bg-[#fafafa]"
            }`}
          >
            {category}
          </button>
        ))}
      </div>

      {/* Text Blocks Grid */}
      <div className="grid grid-cols-2 gap-4">
        {textBlocks.map((block) => (
          <div key={block.id} className="bg-white rounded-lg border border-border p-6 space-y-4 hover:border-muted-foreground transition-colors">
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2">
                  <span className={`px-2 py-1 rounded text-xs border ${getCategoryColor(block.category)}`}>
                    {block.category}
                  </span>
                </div>
                <h3 className="font-medium mb-2">{block.name}</h3>
              </div>
              <div className="flex gap-1">
                <button className="p-2 hover:bg-muted rounded transition-colors">
                  <Edit className="w-4 h-4 text-muted-foreground" />
                </button>
                <button className="p-2 hover:bg-muted rounded transition-colors">
                  <Trash2 className="w-4 h-4 text-muted-foreground" />
                </button>
              </div>
            </div>
            <p className="text-sm text-muted-foreground line-clamp-3">{block.content}</p>
            <div className="text-xs text-muted-foreground">Modified {block.lastModified}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

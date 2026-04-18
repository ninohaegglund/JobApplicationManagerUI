import { Plus, Edit, Trash2, Copy, FileText } from "lucide-react";

const templates = [
  {
    id: 1,
    name: "Tech Startup Template",
    modified: "2026-04-11",
    preview: "Dear Hiring Manager,\n\nI am writing to express my strong interest in the [Position] role at [Company]. With my background in modern web development and passion for building innovative products...",
    usageCount: 8
  },
  {
    id: 2,
    name: "Enterprise Company Template",
    modified: "2026-04-05",
    preview: "Dear [Hiring Manager Name],\n\nI am pleased to submit my application for the [Position] position at [Company]. My experience aligns well with the requirements outlined in the job description...",
    usageCount: 5
  },
  {
    id: 3,
    name: "Remote Position Template",
    modified: "2026-03-28",
    preview: "Hello [Hiring Manager],\n\nI'm excited to apply for the [Position] role at [Company]. As an experienced remote developer with a proven track record of delivering high-quality work...",
    usageCount: 12
  },
];

export function CoverLetterTemplates() {
  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[28px] font-medium mb-1">Cover Letter Templates</h1>
          <p className="text-muted-foreground">Reusable templates for your cover letters</p>
        </div>
        <button className="inline-flex items-center gap-2 px-4 py-2 bg-foreground text-background rounded-lg hover:bg-foreground/90 transition-colors">
          <Plus className="w-4 h-4" />
          New Template
        </button>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Template List */}
        <div className="col-span-1 space-y-2">
          {templates.map((template) => (
            <div
              key={template.id}
              className="bg-white rounded-lg border border-border p-4 hover:border-muted-foreground cursor-pointer transition-colors"
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-sm mb-1 truncate">{template.name}</h3>
                  <div className="text-xs text-muted-foreground">
                    Modified {template.modified}
                  </div>
                </div>
              </div>
              <div className="text-xs text-muted-foreground mt-3">
                Used in {template.usageCount} applications
              </div>
            </div>
          ))}
        </div>

        {/* Preview Panel */}
        <div className="col-span-2 bg-white rounded-lg border border-border">
          <div className="p-6 border-b border-border flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-muted rounded-lg flex items-center justify-center">
                <FileText className="w-5 h-5 text-muted-foreground" />
              </div>
              <div>
                <h2 className="text-[17px] font-medium">Tech Startup Template</h2>
                <p className="text-xs text-muted-foreground">Modified 2026-04-11</p>
              </div>
            </div>
            <div className="flex gap-2">
              <button className="inline-flex items-center gap-1.5 px-3 py-2 text-sm bg-white border border-border rounded-lg hover:bg-[#fafafa] transition-colors">
                <Copy className="w-3.5 h-3.5" />
                Duplicate
              </button>
              <button className="inline-flex items-center gap-1.5 px-3 py-2 text-sm bg-white border border-border rounded-lg hover:bg-[#fafafa] transition-colors">
                <Edit className="w-3.5 h-3.5" />
                Edit
              </button>
              <button className="p-2 hover:bg-muted rounded transition-colors">
                <Trash2 className="w-4 h-4 text-muted-foreground" />
              </button>
            </div>
          </div>

          <div className="p-6">
            <div className="prose prose-sm max-w-none">
              <p className="text-muted-foreground whitespace-pre-wrap leading-relaxed">
              Hej,
              {"\n\n"}
              Jag vill härmed uttrycka mitt stora intresse för tjänsten som <span className="bg-yellow-100 px-1">[Position]</span> hos <span className="bg-yellow-100 px-1">[Company]</span>. Med min bakgrund inom modern webbutveckling och ett starkt intresse för att bygga välfungerande och genomtänkta lösningar tror jag att jag skulle kunna bidra positivt till ert team.
              {"\n\n"}
              Genom mina studier, praktiska erfarenheter och eget arbete har jag utvecklat kunskaper inom <span className="bg-yellow-100 px-1">[Key Skills]</span>, vilket jag ser som relevant i förhållande till kraven i er annons. Min erfarenhet omfattar bland annat:
              {"\n\n"}
              <span className="bg-yellow-100 px-1">[Experience Text Block]</span>
              {"\n\n"}
              Jag är särskilt intresserad av <span className="bg-yellow-100 px-1">[Company]</span> eftersom:
              {"\n\n"}
              <span className="bg-yellow-100 px-1">[Motivation Text Block]</span>
              {"\n\n"}
              <span className="bg-yellow-100 px-1">[Closing Text Block]</span>
              {"\n\n"}
              Med vänliga hälsningar,{"\n"}
              <span className="bg-yellow-100 px-1">[Your Name]</span>
            </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

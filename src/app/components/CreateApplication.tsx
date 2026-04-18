import { Link } from "react-router";
import { ArrowLeft, Save } from "lucide-react";

const cvVersions = [
  { id: 1, name: "Standard CV - Full Stack", version: "v2.3", date: "2026-04-10" },
  { id: 2, name: "Frontend Focused CV", version: "v1.5", date: "2026-04-08" },
  { id: 3, name: "Leadership CV", version: "v1.2", date: "2026-03-25" },
];

const textBlocks = [
  { id: 1, category: "Intro", name: "Frontend Specialist Introduction", preview: "Passionate frontend developer with 8+ years..." },
  { id: 2, category: "Experience", name: "React & TypeScript Expertise", preview: "Deep experience building scalable React applications..." },
  { id: 3, category: "Motivation", name: "Startup Culture Motivation", preview: "Excited to join fast-paced environments..." },
];

const coverLetterTemplates = [
  { id: 1, name: "Tech Startup Template", modified: "2026-04-11" },
  { id: 2, name: "Enterprise Company Template", modified: "2026-04-05" },
  { id: 3, name: "Remote Position Template", modified: "2026-03-28" },
];

export function CreateApplication() {
  return (
    <div className="p-8 space-y-6">
      <div>
        <Link to="/applications" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-4">
          <ArrowLeft className="w-4 h-4" />
          Back to Applications
        </Link>
        <h1 className="text-[28px] font-medium mb-1">Create New Application</h1>
        <p className="text-muted-foreground">Add a new job application to track</p>
      </div>

      <div className="max-w-4xl space-y-6">
        {/* Basic Information */}
        <div className="bg-white rounded-lg border border-border p-6 space-y-5">
          <h2 className="text-[17px] font-medium">Basic Information</h2>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm text-muted-foreground">Company Name</label>
              <input
                type="text"
                placeholder="e.g., Vercel"
                className="w-full px-3 py-2 bg-[#fafafa] border border-transparent rounded-lg focus:outline-none focus:border-border"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm text-muted-foreground">Role Title</label>
              <input
                type="text"
                placeholder="e.g., Senior Frontend Engineer"
                className="w-full px-3 py-2 bg-[#fafafa] border border-transparent rounded-lg focus:outline-none focus:border-border"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm text-muted-foreground">Status</label>
            <select className="w-full px-3 py-2 bg-[#fafafa] border border-transparent rounded-lg focus:outline-none focus:border-border">
              <option>Draft</option>
              <option>Applied</option>
              <option>Interview</option>
              <option>Offer</option>
              <option>Rejected</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-sm text-muted-foreground">Notes</label>
            <textarea
              rows={4}
              placeholder="Add any notes about this application..."
              className="w-full px-3 py-2 bg-[#fafafa] border border-transparent rounded-lg focus:outline-none focus:border-border resize-none"
            />
          </div>
        </div>

        {/* CV Document Selection */}
        <div className="bg-white rounded-lg border border-border p-6 space-y-5">
          <h2 className="text-[17px] font-medium">Select CV Version</h2>
          <div className="space-y-2">
            {cvVersions.map((cv) => (
              <label key={cv.id} className="flex items-center gap-3 p-3 border border-border rounded-lg hover:bg-[#fafafa] cursor-pointer transition-colors">
                <input type="radio" name="cv" className="w-4 h-4" />
                <div className="flex-1">
                  <div className="font-medium text-sm">{cv.name}</div>
                  <div className="text-xs text-muted-foreground">
                    {cv.version} • Updated {cv.date}
                  </div>
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* Text Blocks Selection */}
        <div className="bg-white rounded-lg border border-border p-6 space-y-5">
          <h2 className="text-[17px] font-medium">Select Text Blocks</h2>
          <div className="space-y-2">
            {textBlocks.map((block) => (
              <label key={block.id} className="flex items-start gap-3 p-3 border border-border rounded-lg hover:bg-[#fafafa] cursor-pointer transition-colors">
                <input type="checkbox" className="w-4 h-4 mt-1" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs px-2 py-0.5 bg-muted rounded">{block.category}</span>
                    <span className="font-medium text-sm">{block.name}</span>
                  </div>
                  <div className="text-xs text-muted-foreground truncate">{block.preview}</div>
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* Cover Letter Template */}
        <div className="bg-white rounded-lg border border-border p-6 space-y-5">
          <h2 className="text-[17px] font-medium">Cover Letter Template</h2>
          <div className="space-y-2">
            {coverLetterTemplates.map((template) => (
              <label key={template.id} className="flex items-center gap-3 p-3 border border-border rounded-lg hover:bg-[#fafafa] cursor-pointer transition-colors">
                <input type="radio" name="template" className="w-4 h-4" />
                <div className="flex-1">
                  <div className="font-medium text-sm">{template.name}</div>
                  <div className="text-xs text-muted-foreground">Modified {template.modified}</div>
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-4">
          <button className="inline-flex items-center gap-2 px-4 py-2 bg-foreground text-background rounded-lg hover:bg-foreground/90 transition-colors">
            <Save className="w-4 h-4" />
            Save Application
          </button>
          <Link
            to="/applications"
            className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-border rounded-lg hover:bg-[#fafafa] transition-colors"
          >
            Cancel
          </Link>
        </div>
      </div>
    </div>
  );
}

import { Download, FileText, File } from "lucide-react";

const exports = [
  {
    id: 1,
    filename: "Vercel_Application_CoverLetter.docx",
    application: "Vercel - Senior Frontend Engineer",
    exportDate: "2026-04-11",
    fileType: "DOCX",
    fileSize: "42 KB"
  },
  {
    id: 2,
    filename: "Linear_Application_Package.pdf",
    application: "Linear - Product Engineer",
    exportDate: "2026-04-09",
    fileType: "PDF",
    fileSize: "156 KB"
  },
  {
    id: 3,
    filename: "Stripe_CoverLetter.docx",
    application: "Stripe - Full Stack Developer",
    exportDate: "2026-04-08",
    fileType: "DOCX",
    fileSize: "38 KB"
  },
  {
    id: 4,
    filename: "Figma_Application.pdf",
    application: "Figma - Software Engineer",
    exportDate: "2026-04-07",
    fileType: "PDF",
    fileSize: "145 KB"
  },
  {
    id: 5,
    filename: "Notion_CoverLetter.docx",
    application: "Notion - Frontend Developer",
    exportDate: "2026-04-05",
    fileType: "DOCX",
    fileSize: "41 KB"
  },
];

export function Exports() {
  return (
    <div className="p-8 space-y-6">
      <div>
        <h1 className="text-[28px] font-medium mb-1">Exports</h1>
        <p className="text-muted-foreground">Download generated documents and cover letters</p>
      </div>

      <div className="bg-white rounded-lg border border-border overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border bg-[#fafafa]">
              <th className="text-left px-6 py-3 text-sm font-medium text-muted-foreground">File</th>
              <th className="text-left px-6 py-3 text-sm font-medium text-muted-foreground">Related Application</th>
              <th className="text-left px-6 py-3 text-sm font-medium text-muted-foreground">Export Date</th>
              <th className="text-left px-6 py-3 text-sm font-medium text-muted-foreground">Type</th>
              <th className="text-left px-6 py-3 text-sm font-medium text-muted-foreground">Size</th>
              <th className="text-left px-6 py-3 text-sm font-medium text-muted-foreground">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {exports.map((exp) => (
              <tr key={exp.id} className="hover:bg-[#fafafa] transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-muted rounded flex items-center justify-center flex-shrink-0">
                      {exp.fileType === "PDF" ? (
                        <File className="w-4 h-4 text-muted-foreground" />
                      ) : (
                        <FileText className="w-4 h-4 text-muted-foreground" />
                      )}
                    </div>
                    <span className="font-medium text-sm">{exp.filename}</span>
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-muted-foreground">{exp.application}</td>
                <td className="px-6 py-4 text-sm text-muted-foreground">{exp.exportDate}</td>
                <td className="px-6 py-4">
                  <span className="px-2 py-1 bg-muted text-xs rounded">{exp.fileType}</span>
                </td>
                <td className="px-6 py-4 text-sm text-muted-foreground">{exp.fileSize}</td>
                <td className="px-6 py-4">
                  <button className="inline-flex items-center gap-2 px-3 py-1.5 text-sm bg-foreground text-background rounded-lg hover:bg-foreground/90 transition-colors">
                    <Download className="w-3.5 h-3.5" />
                    Download
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

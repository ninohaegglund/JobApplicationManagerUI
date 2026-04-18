import { Upload, Download, Edit, Trash2, FileText } from "lucide-react";

const cvDocuments = [
  {
    id: 1,
    name: "Standard CV - Full Stack",
    version: "v2.3",
    uploadDate: "2026-04-10",
    fileSize: "245 KB",
    format: "PDF"
  },
  {
    id: 2,
    name: "Frontend Focused CV",
    version: "v1.5",
    uploadDate: "2026-04-08",
    fileSize: "198 KB",
    format: "PDF"
  },
  {
    id: 3,
    name: "Leadership CV",
    version: "v1.2",
    uploadDate: "2026-03-25",
    fileSize: "212 KB",
    format: "PDF"
  },
  {
    id: 4,
    name: "Academic CV",
    version: "v1.0",
    uploadDate: "2026-03-15",
    fileSize: "189 KB",
    format: "PDF"
  },
];

export function CVDocuments() {
  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[28px] font-medium mb-1">CV Documents</h1>
          <p className="text-muted-foreground">Manage your curriculum vitae versions</p>
        </div>
        <button className="inline-flex items-center gap-2 px-4 py-2 bg-foreground text-background rounded-lg hover:bg-foreground/90 transition-colors">
          <Upload className="w-4 h-4" />
          Upload New CV
        </button>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {cvDocuments.map((cv) => (
          <div key={cv.id} className="bg-white rounded-lg border border-border p-6 hover:border-muted-foreground transition-colors">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-muted rounded-lg flex items-center justify-center flex-shrink-0">
                <FileText className="w-6 h-6 text-muted-foreground" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-medium mb-1">{cv.name}</h3>
                <div className="flex items-center gap-3 text-sm text-muted-foreground mb-3">
                  <span>{cv.version}</span>
                  <span>•</span>
                  <span>{cv.fileSize}</span>
                  <span>•</span>
                  <span>{cv.format}</span>
                </div>
                <div className="text-xs text-muted-foreground mb-4">
                  Uploaded {cv.uploadDate}
                </div>
                <div className="flex gap-2">
                  <button className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm bg-foreground text-background rounded-lg hover:bg-foreground/90 transition-colors">
                    <Download className="w-3.5 h-3.5" />
                    Download
                  </button>
                  <button className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm bg-white border border-border rounded-lg hover:bg-[#fafafa] transition-colors">
                    <Edit className="w-3.5 h-3.5" />
                    Rename
                  </button>
                  <button className="p-1.5 hover:bg-muted rounded transition-colors">
                    <Trash2 className="w-4 h-4 text-muted-foreground" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

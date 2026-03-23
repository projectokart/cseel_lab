import { useEffect, useState, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Pencil, Trash2, Upload, X, Image as ImageIcon, FileSpreadsheet, Link as LinkIcon, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import * as XLSX from "xlsx";

// ─── TYPES ────────────────────────────────────────────────────────────────────
interface Experiment {
  id: string;
  title: string;
  subject: string;
  class: string | null;
  description: string | null;
  thumbnail_url: string | null;
  images?: string[] | null;
  demo_link: string | null;
  video_link: string | null;
  difficulty: string | null;
  materials: string | null;
  procedure: string | null;
  outcome: string | null;
  is_active: boolean | null;
}

interface FormState {
  title: string;
  subject: string;
  class: string;
  description: string;
  thumbnail_url: string;
  images: string[];
  demo_link: string;
  video_link: string;
  difficulty: string;
  materials: string;
  procedure: string;
  outcome: string;
}

const emptyForm: FormState = {
  title: "", subject: "Physics", class: "", description: "",
  thumbnail_url: "", images: [], demo_link: "", video_link: "",
  difficulty: "medium", materials: "", procedure: "", outcome: "",
};

const SUBJECTS = ["Physics", "Chemistry", "Biology", "Engineering", "Mathematics", "Technology"];
const CLASSES  = ["Higher Education", "High School", "Middle School"];
const DIFFICULTIES = ["easy", "medium", "hard"];

// ─── EXCEL COLUMN MAP ─────────────────────────────────────────────────────────
// Excel headers → form field names
const EXCEL_MAP: Record<string, keyof FormState> = {
  title:        "title",       Title:       "title",
  subject:      "subject",     Subject:     "subject",
  class:        "class",       Class:       "class",
  description:  "description", Description: "description",
  materials:    "materials",   Materials:   "materials",
  procedure:    "procedure",   Procedure:   "procedure",
  outcome:      "outcome",     Outcome:     "outcome",
  difficulty:   "difficulty",  Difficulty:  "difficulty",
  video_link:   "video_link",  "Video Link":"video_link",
  demo_link:    "demo_link",   "Demo Link": "demo_link",
  thumbnail_url:"thumbnail_url","Thumbnail URL":"thumbnail_url",
};

// ─── IMAGE UPLOAD COMPONENT ───────────────────────────────────────────────────
const MAX_IMAGES = 5;
const BUCKET = "experiment-images";

function ImageManager({
  images, onChange, thumbnail, onThumbnailChange,
}: {
  images: string[];
  onChange: (imgs: string[]) => void;
  thumbnail: string;
  onThumbnailChange: (url: string) => void;
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [urlInput, setUrlInput] = useState("");
  const [tab, setTab] = useState<"upload" | "url">("upload");
  const { toast } = useToast();

  const allImages = [
    ...(thumbnail ? [thumbnail] : []),
    ...images.filter(i => i !== thumbnail),
  ].slice(0, MAX_IMAGES);

  const handleFileUpload = async (files: FileList) => {
    const remaining = MAX_IMAGES - allImages.length;
    if (remaining <= 0) {
      toast({ title: "Max 5 images allowed", variant: "destructive" }); return;
    }
    setUploading(true);
    const newUrls: string[] = [];
    for (let i = 0; i < Math.min(files.length, remaining); i++) {
      const file = files[i];
      if (!file.type.startsWith("image/")) continue;
      const ext = file.name.split(".").pop();
      const path = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
      const { error } = await supabase.storage.from(BUCKET).upload(path, file, { upsert: true });
      if (error) { toast({ title: `Upload failed: ${file.name}`, variant: "destructive" }); continue; }
      const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
      newUrls.push(data.publicUrl);
    }
    if (newUrls.length) {
      const combined = [...allImages, ...newUrls].slice(0, MAX_IMAGES);
      onThumbnailChange(combined[0]);
      onChange(combined.slice(1));
      toast({ title: `${newUrls.length} image(s) uploaded` });
    }
    setUploading(false);
  };

  const addUrl = () => {
    const url = urlInput.trim();
    if (!url) return;
    if (allImages.length >= MAX_IMAGES) {
      toast({ title: "Max 5 images allowed", variant: "destructive" }); return;
    }
    const combined = [...allImages, url].slice(0, MAX_IMAGES);
    onThumbnailChange(combined[0]);
    onChange(combined.slice(1));
    setUrlInput("");
  };

  const removeImage = (idx: number) => {
    const updated = allImages.filter((_, i) => i !== idx);
    onThumbnailChange(updated[0] || "");
    onChange(updated.slice(1));
  };

  const setAsThumbnail = (url: string) => {
    const rest = allImages.filter(i => i !== url);
    onThumbnailChange(url);
    onChange(rest);
  };

  return (
    <div className="space-y-3">
      {/* Tab switch */}
      <div className="flex gap-1 p-1 bg-muted rounded-lg w-fit">
        <button
          type="button"
          onClick={() => setTab("upload")}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${tab === "upload" ? "bg-white shadow text-primary" : "text-muted-foreground"}`}
        >
          <Upload className="h-3 w-3" /> Upload File
        </button>
        <button
          type="button"
          onClick={() => setTab("url")}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${tab === "url" ? "bg-white shadow text-primary" : "text-muted-foreground"}`}
        >
          <LinkIcon className="h-3 w-3" /> Paste URL
        </button>
      </div>

      {/* Upload area */}
      {tab === "upload" && (
        <div
          onClick={() => fileRef.current?.click()}
          onDragOver={e => e.preventDefault()}
          onDrop={e => { e.preventDefault(); handleFileUpload(e.dataTransfer.files); }}
          className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-colors ${uploading ? "opacity-60 pointer-events-none" : "border-border hover:border-primary/50 hover:bg-primary/5"}`}
        >
          {uploading ? (
            <div className="flex flex-col items-center gap-2">
              <Loader2 className="h-6 w-6 text-primary animate-spin" />
              <p className="text-xs text-muted-foreground">Uploading...</p>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2">
              <ImageIcon className="h-7 w-7 text-muted-foreground" />
              <p className="text-sm font-medium text-foreground">Drop images here or click to browse</p>
              <p className="text-xs text-muted-foreground">JPG, PNG, WEBP · Max {MAX_IMAGES} images</p>
            </div>
          )}
          <input
            ref={fileRef} type="file" accept="image/*" multiple hidden
            onChange={e => e.target.files && handleFileUpload(e.target.files)}
          />
        </div>
      )}

      {/* URL input */}
      {tab === "url" && (
        <div className="flex gap-2">
          <Input
            placeholder="https://example.com/image.jpg"
            value={urlInput}
            onChange={e => setUrlInput(e.target.value)}
            onKeyDown={e => e.key === "Enter" && addUrl()}
            className="flex-1 text-sm"
          />
          <Button type="button" onClick={addUrl} size="sm" className="shrink-0">Add</Button>
        </div>
      )}

      {/* Image previews */}
      {allImages.length > 0 && (
        <div className="grid grid-cols-5 gap-2">
          {allImages.map((url, idx) => (
            <div key={idx} className="relative group">
              <div className={`aspect-square rounded-lg overflow-hidden border-2 transition-all ${idx === 0 ? "border-primary" : "border-border"}`}>
                <img src={url} alt="" className="w-full h-full object-cover" onError={e => { (e.target as HTMLImageElement).src = "https://via.placeholder.com/80"; }} />
              </div>
              {idx === 0 && (
                <span className="absolute bottom-0.5 left-0 right-0 text-center text-[9px] font-bold text-white bg-primary/80 rounded-b-md">Cover</span>
              )}
              <div className="absolute inset-0 bg-black/50 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1">
                {idx !== 0 && (
                  <button
                    type="button"
                    onClick={() => setAsThumbnail(url)}
                    className="text-[9px] bg-white text-primary font-bold px-1 py-0.5 rounded"
                    title="Set as cover"
                  >Cover</button>
                )}
                <button
                  type="button"
                  onClick={() => removeImage(idx)}
                  className="w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            </div>
          ))}
          {allImages.length < MAX_IMAGES && Array.from({ length: MAX_IMAGES - allImages.length }).map((_, i) => (
            <div
              key={`empty-${i}`}
              onClick={() => tab === "upload" ? fileRef.current?.click() : setTab("upload")}
              className="aspect-square rounded-lg border-2 border-dashed border-border flex items-center justify-center cursor-pointer hover:border-primary/50 transition-colors"
            >
              <Plus className="h-4 w-4 text-muted-foreground" />
            </div>
          ))}
        </div>
      )}
      <p className="text-xs text-muted-foreground">{allImages.length}/{MAX_IMAGES} images · First image = cover photo</p>
    </div>
  );
}

// ─── EXCEL IMPORT ─────────────────────────────────────────────────────────────
function ExcelImport({ onImport, onClose }: { onImport: (rows: Partial<FormState>[]) => void; onClose: () => void }) {
  const [rows, setRows]       = useState<Partial<FormState>[]>([]);
  const [preview, setPreview] = useState(false);
  const [importing, setImporting] = useState(false);
  const { toast } = useToast();

  const handleFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const wb = XLSX.read(e.target?.result, { type: "binary" });
        const ws = wb.Sheets[wb.SheetNames[0]];
        const json: Record<string, any>[] = XLSX.utils.sheet_to_json(ws);
        const mapped = json.map(row => {
          const entry: Partial<FormState> = {};
          Object.entries(row).forEach(([key, val]) => {
            const field = EXCEL_MAP[key.trim()];
            if (field) (entry as any)[field] = String(val ?? "").trim();
          });
          return entry;
        }).filter(r => r.title);
        if (!mapped.length) { toast({ title: "No valid rows found. Check column headers.", variant: "destructive" }); return; }
        setRows(mapped);
        setPreview(true);
      } catch { toast({ title: "Invalid Excel file", variant: "destructive" }); }
    };
    reader.readAsBinaryString(file);
  };

  const doImport = async () => {
    setImporting(true);
    const toInsert = rows.map(r => ({
      title: r.title || "Untitled",
      subject: r.subject || "Physics",
      class: r.class || null,
      description: r.description || null,
      materials: r.materials || null,
      procedure: r.procedure || null,
      outcome: r.outcome || null,
      difficulty: r.difficulty || null,
      video_link: r.video_link || null,
      demo_link: r.demo_link || null,
      thumbnail_url: r.thumbnail_url || null,
      images: [],
    }));
    const { error } = await supabase.from("experiments").insert(toInsert as any);
    setImporting(false);
    if (error) { toast({ title: "Import failed", description: error.message, variant: "destructive" }); return; }
    toast({ title: `${rows.length} experiments imported!` });
    onImport(rows);
    onClose();
  };

  const downloadTemplate = () => {
    const headers = ["title","subject","class","difficulty","description","materials","procedure","outcome","video_link","demo_link","thumbnail_url"];
    const example = ["Acid-Base Titration","Chemistry","Higher Education","medium","Learn titration techniques...","Burette, NaOH, HCl...","Step 1: Fill burette...","Students will determine concentration...","https://youtube.com/...","https://demo.com/...","https://image.com/..."];
    const ws = XLSX.utils.aoa_to_sheet([headers, example]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Experiments");
    XLSX.writeFile(wb, "experiment_template.xlsx");
  };

  return (
    <div className="space-y-4">
      {!preview ? (
        <>
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">Upload an Excel file (.xlsx) to bulk import experiments.</p>
            <Button variant="outline" size="sm" onClick={downloadTemplate} className="shrink-0 gap-1.5">
              <FileSpreadsheet className="h-3.5 w-3.5" /> Download Template
            </Button>
          </div>

          <div
            onDragOver={e => e.preventDefault()}
            onDrop={e => { e.preventDefault(); const f = e.dataTransfer.files[0]; if (f) handleFile(f); }}
            className="border-2 border-dashed border-border rounded-xl p-10 text-center cursor-pointer hover:border-primary/50 hover:bg-primary/5 transition-colors"
            onClick={() => document.getElementById("xlInput")?.click()}
          >
            <FileSpreadsheet className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
            <p className="text-sm font-medium text-foreground">Drop Excel file here or click to browse</p>
            <p className="text-xs text-muted-foreground mt-1">.xlsx, .xls files supported</p>
          </div>
          <input id="xlInput" type="file" accept=".xlsx,.xls" hidden onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f); }} />

          <div className="bg-muted/50 rounded-lg p-3 text-xs text-muted-foreground space-y-1">
            <p className="font-semibold text-foreground">Required columns:</p>
            <p>title, subject, class, difficulty, description, materials, procedure, outcome</p>
            <p className="font-semibold text-foreground mt-2">Optional columns:</p>
            <p>video_link, demo_link, thumbnail_url</p>
          </div>
        </>
      ) : (
        <>
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-foreground">{rows.length} experiments ready to import</p>
            <Button variant="ghost" size="sm" onClick={() => setPreview(false)}>← Back</Button>
          </div>
          <div className="border rounded-lg overflow-hidden max-h-64 overflow-y-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-xs">#</TableHead>
                  <TableHead className="text-xs">Title</TableHead>
                  <TableHead className="text-xs">Subject</TableHead>
                  <TableHead className="text-xs">Class</TableHead>
                  <TableHead className="text-xs">Difficulty</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((r, i) => (
                  <TableRow key={i}>
                    <TableCell className="text-xs text-muted-foreground">{i + 1}</TableCell>
                    <TableCell className="text-xs font-medium max-w-[140px] truncate">{r.title}</TableCell>
                    <TableCell className="text-xs">{r.subject || "-"}</TableCell>
                    <TableCell className="text-xs">{r.class || "-"}</TableCell>
                    <TableCell className="text-xs">{r.difficulty || "-"}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={onClose}>Cancel</Button>
            <Button onClick={doImport} disabled={importing} className="gap-1.5">
              {importing && <Loader2 className="h-4 w-4 animate-spin" />}
              Import {rows.length} Experiments
            </Button>
          </div>
        </>
      )}
    </div>
  );
}

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────
const AdminExperiments = () => {
  const [experiments, setExperiments] = useState<Experiment[]>([]);
  const [open, setOpen]               = useState(false);
  const [xlOpen, setXlOpen]           = useState(false);
  const [editing, setEditing]         = useState<string | null>(null);
  const [form, setForm]               = useState<FormState>(emptyForm);
  const [search, setSearch]           = useState("");
  const [saving, setSaving]           = useState(false);
  const { toast } = useToast();

  const fetchExperiments = async () => {
    const { data } = await supabase.from("experiments").select("*").order("created_at", { ascending: false });
    if (data) setExperiments(data as Experiment[]);
  };

  useEffect(() => { fetchExperiments(); }, []);

  const f = (k: keyof FormState, v: any) => setForm(prev => ({ ...prev, [k]: v }));

  const handleSave = async () => {
    if (!form.title.trim() || !form.subject) {
      toast({ title: "Title and subject are required", variant: "destructive" }); return;
    }
    setSaving(true);
    const payload = {
      title:         form.title.trim(),
      subject:       form.subject,
      class:         form.class || null,
      description:   form.description || null,
      thumbnail_url: form.thumbnail_url || null,
      images:        form.images,
      demo_link:     form.demo_link || null,
      video_link:    form.video_link || null,
      difficulty:    form.difficulty || null,
      materials:     form.materials || null,
      procedure:     form.procedure || null,
      outcome:       form.outcome || null,
    };
    if (editing) {
      await supabase.from("experiments").update(payload as any).eq("id", editing);
      toast({ title: "Experiment updated" });
    } else {
      await supabase.from("experiments").insert(payload as any);
      toast({ title: "Experiment created" });
    }
    setSaving(false);
    setOpen(false);
    setEditing(null);
    setForm(emptyForm);
    fetchExperiments();
  };

  const handleEdit = (exp: Experiment) => {
    setEditing(exp.id);
    setForm({
      title:         exp.title,
      subject:       exp.subject,
      class:         exp.class || "",
      description:   exp.description || "",
      thumbnail_url: exp.thumbnail_url || "",
      images:        Array.isArray(exp.images) ? exp.images : [],
      demo_link:     exp.demo_link || "",
      video_link:    exp.video_link || "",
      difficulty:    exp.difficulty || "medium",
      materials:     exp.materials || "",
      procedure:     exp.procedure || "",
      outcome:       exp.outcome || "",
    });
    setOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this experiment?")) return;
    await supabase.from("experiments").delete().eq("id", id);
    toast({ title: "Experiment deleted" });
    fetchExperiments();
  };

  const filtered = experiments.filter(e =>
    e.title.toLowerCase().includes(search.toLowerCase()) ||
    e.subject.toLowerCase().includes(search.toLowerCase())
  );

  const subjectBadge: Record<string, string> = {
    Biology: "bg-green-100 text-green-700", Chemistry: "bg-blue-100 text-blue-700",
    Physics: "bg-purple-100 text-purple-700", Engineering: "bg-orange-100 text-orange-700",
    Mathematics: "bg-red-100 text-red-700", Technology: "bg-cyan-100 text-cyan-700",
  };

  return (
    <div className="w-full max-w-full overflow-hidden">

      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-6">
        <h1 className="text-xl sm:text-2xl font-bold text-foreground">Experiments</h1>
        <div className="flex gap-2 w-full sm:w-auto flex-wrap">
          <Input
            placeholder="Search..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="flex-1 sm:w-48 min-w-0"
          />
          <Button
            variant="outline"
            onClick={() => setXlOpen(true)}
            className="gap-1.5 shrink-0"
          >
            <FileSpreadsheet className="h-4 w-4" /> Import Excel
          </Button>
          <Button
            onClick={() => { setEditing(null); setForm(emptyForm); setOpen(true); }}
            className="gap-1.5 shrink-0"
          >
            <Plus className="h-4 w-4" /> Add
          </Button>
        </div>
      </div>

      {/* Table */}
      <Card>
        <CardContent className="p-0 overflow-x-auto">
          <Table className="min-w-[540px]">
            <TableHeader>
              <TableRow>
                <TableHead className="w-10">#</TableHead>
                <TableHead>Title</TableHead>
                <TableHead>Subject</TableHead>
                <TableHead className="hidden sm:table-cell">Class</TableHead>
                <TableHead className="hidden md:table-cell">Difficulty</TableHead>
                <TableHead className="hidden md:table-cell">Images</TableHead>
                <TableHead className="w-20">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((exp, idx) => {
                const imgCount = (exp.images?.length || 0) + (exp.thumbnail_url ? 1 : 0);
                return (
                  <TableRow key={exp.id}>
                    <TableCell className="text-muted-foreground text-xs">{idx + 1}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {exp.thumbnail_url && (
                          <img src={exp.thumbnail_url} alt="" className="w-8 h-8 rounded-md object-cover hidden sm:block" />
                        )}
                        <span className="font-medium text-sm max-w-[140px] truncate">{exp.title}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${subjectBadge[exp.subject] || "bg-gray-100 text-gray-600"}`}>
                        {exp.subject}
                      </span>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell text-sm text-muted-foreground whitespace-nowrap">
                      {exp.class || "—"}
                    </TableCell>
                    <TableCell className="hidden md:table-cell text-sm text-muted-foreground capitalize">
                      {exp.difficulty || "—"}
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      <span className="flex items-center gap-1 text-xs text-muted-foreground">
                        <ImageIcon className="h-3 w-3" /> {imgCount}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => handleEdit(exp)}>
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                        <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => handleDelete(exp.id)}>
                          <Trash2 className="h-3.5 w-3.5 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
              {filtered.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-muted-foreground py-10">
                    No experiments found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Add / Edit Dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="w-full max-w-2xl mx-auto h-[92vh] sm:h-auto max-h-[92vh] overflow-y-auto p-4 sm:p-6">
          <DialogHeader>
            <DialogTitle>{editing ? "Edit Experiment" : "Add Experiment"}</DialogTitle>
          </DialogHeader>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2">

            {/* Title */}
            <div className="space-y-1.5 sm:col-span-2">
              <Label>Title <span className="text-destructive">*</span></Label>
              <Input placeholder="e.g. Acid-Base Titration" value={form.title} onChange={e => f("title", e.target.value)} />
            </div>

            {/* Subject */}
            <div className="space-y-1.5">
              <Label>Subject <span className="text-destructive">*</span></Label>
              <Select value={form.subject} onValueChange={v => f("subject", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {SUBJECTS.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            {/* Class */}
            <div className="space-y-1.5">
              <Label>Class</Label>
              <Select value={form.class || "none"} onValueChange={v => f("class", v === "none" ? "" : v)}>
                <SelectTrigger><SelectValue placeholder="Select class" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">— None —</SelectItem>
                  {CLASSES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            {/* Difficulty */}
            <div className="space-y-1.5">
              <Label>Difficulty</Label>
              <Select value={form.difficulty} onValueChange={v => f("difficulty", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {DIFFICULTIES.map(d => <SelectItem key={d} value={d} className="capitalize">{d}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            {/* Description */}
            <div className="space-y-1.5 sm:col-span-2">
              <Label>Description</Label>
              <Textarea rows={3} placeholder="Brief overview of the experiment..." value={form.description} onChange={e => f("description", e.target.value)} />
            </div>

            {/* Images */}
            <div className="space-y-1.5 sm:col-span-2">
              <Label>Images (up to 5)</Label>
              <ImageManager
                images={form.images}
                onChange={imgs => f("images", imgs)}
                thumbnail={form.thumbnail_url}
                onThumbnailChange={url => f("thumbnail_url", url)}
              />
            </div>

            {/* Video link */}
            <div className="space-y-1.5">
              <Label>Video Link</Label>
              <Input placeholder="https://youtube.com/..." value={form.video_link} onChange={e => f("video_link", e.target.value)} />
            </div>

            {/* Demo link */}
            <div className="space-y-1.5">
              <Label>Demo / Simulation Link</Label>
              <Input placeholder="https://simulation.com/..." value={form.demo_link} onChange={e => f("demo_link", e.target.value)} />
            </div>

            {/* Materials */}
            <div className="space-y-1.5 sm:col-span-2">
              <Label>Materials Required</Label>
              <Textarea rows={3} placeholder={"One item per line:\nBeaker 250ml\nDistilled water\nSafety goggles"} value={form.materials} onChange={e => f("materials", e.target.value)} />
            </div>

            {/* Procedure */}
            <div className="space-y-1.5 sm:col-span-2">
              <Label>Procedure</Label>
              <Textarea rows={5} placeholder={"One step per line:\nStep 1: Fill the burette...\nStep 2: Pipette 25ml..."} value={form.procedure} onChange={e => f("procedure", e.target.value)} />
            </div>

            {/* Outcome */}
            <div className="space-y-1.5 sm:col-span-2">
              <Label>Expected Outcome</Label>
              <Textarea rows={3} placeholder="What students will learn or observe..." value={form.outcome} onChange={e => f("outcome", e.target.value)} />
            </div>
          </div>

          <div className="flex justify-end gap-2 mt-4 pt-3 border-t">
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={handleSave} disabled={saving} className="gap-1.5 min-w-20">
              {saving && <Loader2 className="h-4 w-4 animate-spin" />}
              {editing ? "Update" : "Create"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Excel Import Dialog */}
      <Dialog open={xlOpen} onOpenChange={setXlOpen}>
        <DialogContent className="w-full max-w-2xl mx-auto max-h-[90vh] overflow-y-auto p-4 sm:p-6">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileSpreadsheet className="h-5 w-5 text-primary" />
              Import from Excel
            </DialogTitle>
          </DialogHeader>
          <ExcelImport onImport={() => fetchExperiments()} onClose={() => setXlOpen(false)} />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminExperiments;
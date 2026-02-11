import { useState, useEffect } from "react";
import {
  fetchSubjects,
  fetchChapters,
  fetchSubtopics,
  fetchMapping,
  saveMapping,
  type CurriculumItem,
} from "~/lib/curriculum-api";

interface CurriculumFiltersProps {
  assetId: string;
}

const selectStyle: React.CSSProperties = {
  padding: "6px 10px",
  fontSize: "13px",
  border: "1px solid #ccc",
  borderRadius: "6px",
  outline: "none",
  minWidth: "140px",
};

export default function CurriculumFilters({ assetId }: CurriculumFiltersProps) {
  const [subjects, setSubjects] = useState<CurriculumItem[]>([]);
  const [chapters, setChapters] = useState<CurriculumItem[]>([]);
  const [subtopics, setSubtopics] = useState<CurriculumItem[]>([]);

  const [selectedSubject, setSelectedSubject] = useState("");
  const [selectedChapter, setSelectedChapter] = useState("");
  const [selectedSubtopic, setSelectedSubtopic] = useState("");
  const [isMapped, setIsMapped] = useState(false);
  const [saving, setSaving] = useState(false);

  // Load subjects and existing mapping on mount / asset change
  useEffect(() => {
    fetchSubjects().then(setSubjects);

    fetchMapping(assetId).then(async (mapping) => {
      if (!mapping) {
        setIsMapped(false);
        setSelectedSubject("");
        setSelectedChapter("");
        setSelectedSubtopic("");
        setChapters([]);
        setSubtopics([]);
        return;
      }

      setIsMapped(true);
      setSelectedSubject(mapping.subjectId);

      const ch = await fetchChapters(mapping.subjectId);
      setChapters(ch);
      setSelectedChapter(mapping.chapterId);

      const st = await fetchSubtopics(mapping.chapterId);
      setSubtopics(st);
      setSelectedSubtopic(mapping.subtopicId);
    });
  }, [assetId]);

  useEffect(() => {
    if (!selectedSubject) {
      setChapters([]);
      return;
    }
    fetchChapters(selectedSubject).then(setChapters);
  }, [selectedSubject]);

  useEffect(() => {
    if (!selectedChapter) {
      setSubtopics([]);
      return;
    }
    fetchSubtopics(selectedChapter).then(setSubtopics);
  }, [selectedChapter]);

  const canSave = selectedSubject && selectedChapter && selectedSubtopic;

  const handleSave = async () => {
    if (!canSave) return;
    setSaving(true);
    await saveMapping(assetId, {
      subjectId: selectedSubject,
      chapterId: selectedChapter,
      subtopicId: selectedSubtopic,
    });
    setIsMapped(true);
    setSaving(false);
  };

  return (
    <div
      style={{
        display: "flex",
        gap: "8px",
        padding: "8px 16px",
        borderBottom: "1px solid #e0e0e0",
        alignItems: "center",
        flexWrap: "wrap",
      }}
    >
      <span style={{ fontSize: "12px", color: "#888", fontWeight: 500 }}>
        Map to:
      </span>

      <select
        value={selectedSubject}
        onChange={(e) => {
          setSelectedSubject(e.target.value);
          setSelectedChapter("");
          setSelectedSubtopic("");
        }}
        style={selectStyle}
      >
        <option value="">Select Subject</option>
        {subjects.map((s) => (
          <option key={s.id} value={s.id}>
            {s.name}
          </option>
        ))}
      </select>

      <select
        value={selectedChapter}
        onChange={(e) => {
          setSelectedChapter(e.target.value);
          setSelectedSubtopic("");
        }}
        disabled={!selectedSubject}
        style={{
          ...selectStyle,
          opacity: selectedSubject ? 1 : 0.5,
        }}
      >
        <option value="">Select Chapter</option>
        {chapters.map((c) => (
          <option key={c.id} value={c.id}>
            {c.name}
          </option>
        ))}
      </select>

      <select
        value={selectedSubtopic}
        onChange={(e) => setSelectedSubtopic(e.target.value)}
        disabled={!selectedChapter}
        style={{
          ...selectStyle,
          opacity: selectedChapter ? 1 : 0.5,
        }}
      >
        <option value="">Select Subtopic</option>
        {subtopics.map((st) => (
          <option key={st.id} value={st.id}>
            {st.name}
          </option>
        ))}
      </select>

      <button
        onClick={handleSave}
        disabled={!canSave || saving}
        style={{
          padding: "6px 14px",
          fontSize: "13px",
          fontWeight: 500,
          border: "none",
          borderRadius: "6px",
          cursor: canSave && !saving ? "pointer" : "default",
          backgroundColor: canSave ? "#1976d2" : "#ccc",
          color: "#fff",
          opacity: saving ? 0.7 : 1,
        }}
      >
        {saving ? "Saving..." : isMapped ? "Update Mapping" : "Add Mapping"}
      </button>
    </div>
  );
}

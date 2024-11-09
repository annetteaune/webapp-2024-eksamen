import React from "react";
import RichTextEditor from "./RichTextEditor";

type EditorProps = {
  value: string;
  onChange: (value: string) => void;
  useRichText?: boolean;
  className?: string;
};

const TextEditor = ({
  value,
  onChange,
  useRichText = false,
  className = "",
}: EditorProps) => {
  if (!useRichText) {
    // standard teksteditor
    return (
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`w-full rounded bg-slate-100 min-h-[150px] p-3 ${className}`}
      />
    );
  }

  return (
    // avansert teksteditor
    <RichTextEditor value={value} onChange={onChange} className={className} />
  );
};

export default TextEditor;

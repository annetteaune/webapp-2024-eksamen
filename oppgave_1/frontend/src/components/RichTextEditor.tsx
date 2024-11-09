import React from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { FaBold, FaCode, FaItalic, FaList, FaListOl } from "react-icons/fa";
import { BsTypeH2, BsTypeH3 } from "react-icons/bs";

type RichEditorProps = {
  value: string;
  onChange: (value: string) => void;
  useRichText?: boolean;
  className?: string;
};

const RichTextEditor = ({
  value,
  onChange,
  className = "",
}: RichEditorProps) => {
  //SRC: https://tiptap.dev/docs/editor/getting-started/install/nextjs
  const editor = useEditor({
    extensions: [StarterKit],
    content: value,
    // SRC: https://tiptap.dev/docs/editor/extensions/functionality/table-of-contents
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: "min-h-[150px] p-3 focus:outline-none w-full prose",
      },
    },
  });

  // brukt docs mye under oppsettet av menyen; samtlige onclicks, classtoggles etc er kopiert og limt inn
  // SRC: https://tiptap.dev/docs/examples/basics/default-text-editor
  return (
    <div className={`w-full rounded bg-slate-100 ${className}`}>
      {editor && (
        <div className="border-b border-slate-200 p-2 flex gap-2 flex-wrap justify-evenly">
          <button
            onClick={() => editor.chain().focus().toggleBold().run()}
            className={`px-2 py-1 rounded ${
              editor.isActive("bold") ? "bg-gray-300" : "bg-slate-100"
            }`}
            type="button"
          >
            <FaBold />
          </button>

          <button
            onClick={() => editor.chain().focus().toggleItalic().run()}
            className={`px-2 py-1 rounded ${
              editor.isActive("italic") ? "bg-gray-300" : "bg-slate-100"
            }`}
            type="button"
          >
            <FaItalic />
          </button>

          <button
            onClick={() => editor.chain().focus().toggleCode().run()}
            className={`px-2 py-1 rounded ${
              editor.isActive("code") ? "bg-gray-300" : "bg-slate-100"
            }`}
            type="button"
          >
            <FaCode />
          </button>

          <button
            onClick={() =>
              editor.chain().focus().toggleHeading({ level: 2 }).run()
            }
            className={`px-2 py-1 rounded ${
              editor.isActive("heading", { level: 2 })
                ? "bg-gray-300"
                : "bg-slate-100"
            }`}
            type="button"
          >
            <BsTypeH2 />
          </button>
          <button
            onClick={() =>
              editor.chain().focus().toggleHeading({ level: 3 }).run()
            }
            className={`px-2 py-1 rounded ${
              editor.isActive("heading", { level: 3 })
                ? "bg-gray-300"
                : "bg-slate-100"
            }`}
            type="button"
          >
            <BsTypeH3 />
          </button>
          <button
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            className={`px-2 py-1 rounded ${
              editor.isActive("bulletList") ? "bg-gray-300" : "bg-slate-100"
            }`}
            type="button"
          >
            <FaList />
          </button>
          <button
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            className={`px-2 py-1 rounded ${
              editor.isActive("orderedList") ? "bg-gray-300" : "bg-slate-100"
            }`}
            type="button"
          >
            <FaListOl />
          </button>
        </div>
      )}
      <EditorContent editor={editor} />
    </div>
  );
};

export default RichTextEditor;

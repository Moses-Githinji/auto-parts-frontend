import { useState, useEffect, useCallback, useRef } from "react";
import ReactMarkdown from "react-markdown";
import { uploadToCloudinary } from "../../utils/cloudinaryService";

interface BlogEditorProps {
  value: string;
  onChange: (value: string) => void;
  onImageUpload?: (url: string) => void;
  placeholder?: string;
}

// Toolbar button component
const ToolbarButton = ({
  onClick,
  children,
  title,
  active = false,
}: {
  onClick: () => void;
  children: React.ReactNode;
  title: string;
  active?: boolean;
}) => (
  <button
    type="button"
    onClick={onClick}
    title={title}
    className={`p-2 rounded hover:bg-slate-200 transition-colors ${
      active ? "bg-blue-100 text-blue-700" : "text-slate-700"
    }`}
  >
    {children}
  </button>
);

// Insert text at cursor position
const insertText = (
  textarea: HTMLTextAreaElement,
  before: string,
  after: string = ""
) => {
  const start = textarea.selectionStart;
  const end = textarea.selectionEnd;
  const text = textarea.value;
  const selectedText = text.substring(start, end);
  const newText =
    text.substring(0, start) +
    before +
    selectedText +
    after +
    text.substring(end);
  return newText;
};

export function BlogEditor({
  value,
  onChange,
  onImageUpload,
  placeholder = "Write your content in Markdown...",
}: BlogEditorProps) {
  const [isPreview, setIsPreview] = useState(false);
  const [wordCount, setWordCount] = useState(0);
  const [readingTime, setReadingTime] = useState(0);
  const [showLinkDialog, setShowLinkDialog] = useState(false);
  const [linkUrl, setLinkUrl] = useState("");
  const [linkText, setLinkText] = useState("");
  const [showTableDialog, setShowTableDialog] = useState(false);
  const [tableRows, setTableRows] = useState(3);
  const [tableCols, setTableCols] = useState(3);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-save to localStorage
  useEffect(() => {
    const savedDraft = localStorage.getItem("blog-draft");
    if (savedDraft && !value) {
      onChange(savedDraft);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      localStorage.setItem("blog-draft", value);
    }, 2000);

    return () => clearTimeout(timer);
  }, [value]);

  // Calculate word count and reading time
  useEffect(() => {
    const words = value.trim().split(/\s+/).filter(Boolean).length;
    setWordCount(words);
    setReadingTime(Math.ceil(words / 200)); // Average reading speed: 200 words/min
  }, [value]);

  const insertAtCursor = useCallback(
    (text: string, after?: string) => {
      if (textareaRef.current) {
        const newValue = insertText(textareaRef.current, text, after);
        onChange(newValue);
        textareaRef.current.focus();
      }
    },
    [onChange]
  );

  const handleInsertHeading = (level: number) => {
    const hashes = "#".repeat(level);
    insertAtCursor(`${hashes} `);
  };

  const handleInsertBold = () => insertAtCursor("**", "**");
  const handleInsertItalic = () => insertAtCursor("*", "*");
  const handleInsertStrikethrough = () => insertAtCursor("~~", "~~");
  const handleInsertBulletList = () => insertAtCursor("\n- ");
  const handleInsertNumberedList = () => insertAtCursor("\n1. ");
  const handleInsertBlockquote = () => insertAtCursor("\n> ");

  const handleInsertLink = () => {
    if (linkUrl && linkText) {
      insertAtCursor(`[${linkText}](${linkUrl})`);
      setLinkUrl("");
      setLinkText("");
      setShowLinkDialog(false);
    }
  };

  const handleInsertTable = () => {
    let table = "\n|";
    for (let i = 0; i < tableCols; i++) {
      table += ` Column${i + 1} |`;
    }
    table += "\n|";
    for (let i = 0; i < tableCols; i++) {
      table += " --- |";
    }
    for (let r = 0; r < tableRows - 1; r++) {
      table += "\n|";
      for (let i = 0; i < tableCols; i++) {
        table += ` Cell |`;
      }
    }
    table += "\n";
    insertAtCursor(table);
    setShowTableDialog(false);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("Please select an image file");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert("Image size must be less than 5MB");
      return;
    }

    const url = await uploadToCloudinary(file);
    if (url) {
      const imageMarkdown = `![Image](${url})`;
      insertAtCursor(imageMarkdown);
      onImageUpload?.(url);
    } else {
      alert("Failed to upload image. Please try again.");
    }
  };

  const toolbarItems = [
    { title: "Heading 1", onClick: () => handleInsertHeading(1), icon: "H1" },
    { title: "Heading 2", onClick: () => handleInsertHeading(2), icon: "H2" },
    { title: "Heading 3", onClick: () => handleInsertHeading(3), icon: "H3" },
    { title: "Bold", onClick: handleInsertBold, icon: <strong>B</strong> },
    { title: "Italic", onClick: handleInsertItalic, icon: <em>I</em> },
    {
      title: "Strikethrough",
      onClick: handleInsertStrikethrough,
      icon: <s>S</s>,
    },
    { title: "Bullet List", onClick: handleInsertBulletList, icon: "•" },
    { title: "Numbered List", onClick: handleInsertNumberedList, icon: "1." },
    { title: "Blockquote", onClick: handleInsertBlockquote, icon: '"' },
  ];

  return (
    <div className="border border-slate-300 rounded-lg overflow-hidden">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-1 p-2 bg-slate-100 border-b border-slate-300">
        {/* Headings Dropdown */}
        <div className="relative group">
          <button className="px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-200 rounded flex items-center gap-1">
            Headers
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </button>
          <div className="absolute left-0 top-full mt-1 hidden group-hover:block bg-white border border-slate-300 rounded shadow-lg z-10">
            <button
              onClick={() => handleInsertHeading(1)}
              className="block w-full px-4 py-2 text-left hover:bg-slate-100 text-sm"
            >
              Heading 1
            </button>
            <button
              onClick={() => handleInsertHeading(2)}
              className="block w-full px-4 py-2 text-left hover:bg-slate-100 text-sm"
            >
              Heading 2
            </button>
            <button
              onClick={() => handleInsertHeading(3)}
              className="block w-full px-4 py-2 text-left hover:bg-slate-100 text-sm"
            >
              Heading 3
            </button>
          </div>
        </div>

        <div className="w-px h-6 bg-slate-300 mx-1" />

        {/* Format Buttons */}
        {toolbarItems.slice(3).map((item, idx) => (
          <ToolbarButton key={idx} onClick={item.onClick} title={item.title}>
            {item.icon}
          </ToolbarButton>
        ))}

        <div className="w-px h-6 bg-slate-300 mx-1" />

        {/* List Buttons */}
        {toolbarItems.slice(6).map((item, idx) => (
          <ToolbarButton key={idx} onClick={item.onClick} title={item.title}>
            {item.icon}
          </ToolbarButton>
        ))}

        <div className="w-px h-6 bg-slate-300 mx-1" />

        {/* Link Button */}
        <ToolbarButton
          onClick={() => setShowLinkDialog(true)}
          title="Insert Link"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
            />
          </svg>
        </ToolbarButton>

        {/* Table Button */}
        <ToolbarButton
          onClick={() => setShowTableDialog(true)}
          title="Insert Table"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
            />
          </svg>
        </ToolbarButton>

        {/* Image Upload */}
        <label className="cursor-pointer p-2 rounded hover:bg-slate-200 transition-colors text-slate-700">
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
          <input
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            className="hidden"
          />
        </label>

        <div className="flex-1" />

        {/* Preview Toggle */}
        <button
          type="button"
          onClick={() => setIsPreview(!isPreview)}
          className={`px-3 py-1.5 text-sm rounded transition-colors ${
            isPreview
              ? "bg-[#2b579a] text-white"
              : "bg-white border border-slate-300 text-slate-700 hover:bg-slate-50"
          }`}
        >
          {isPreview ? "Edit" : "Preview"}
        </button>
      </div>

      {/* Link Dialog */}
      {showLinkDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-lg p-4 w-96 shadow-lg">
            <h3 className="font-semibold mb-3">Insert Link</h3>
            <div className="space-y-3">
              <div>
                <label className="block text-sm text-slate-600 mb-1">URL</label>
                <input
                  type="url"
                  value={linkUrl}
                  onChange={(e) => setLinkUrl(e.target.value)}
                  placeholder="https://example.com"
                  className="w-full border border-slate-300 rounded px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm text-slate-600 mb-1">
                  Display Text
                </label>
                <input
                  type="text"
                  value={linkText}
                  onChange={(e) => setLinkText(e.target.value)}
                  placeholder="Link text"
                  className="w-full border border-slate-300 rounded px-3 py-2 text-sm"
                />
              </div>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowLinkDialog(false)}
                  className="px-3 py-1.5 text-sm border border-slate-300 rounded hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleInsertLink}
                  className="px-3 py-1.5 text-sm bg-[#2b579a] text-white rounded hover:bg-[#2b579a]/90"
                >
                  Insert
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Table Dialog */}
      {showTableDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-lg p-4 w-80 shadow-lg">
            <h3 className="font-semibold mb-3">Insert Table</h3>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm text-slate-600 mb-1">
                    Rows
                  </label>
                  <input
                    type="number"
                    min="2"
                    max="10"
                    value={tableRows}
                    onChange={(e) =>
                      setTableRows(parseInt(e.target.value) || 3)
                    }
                    className="w-full border border-slate-300 rounded px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm text-slate-600 mb-1">
                    Columns
                  </label>
                  <input
                    type="number"
                    min="2"
                    max="10"
                    value={tableCols}
                    onChange={(e) =>
                      setTableCols(parseInt(e.target.value) || 3)
                    }
                    className="w-full border border-slate-300 rounded px-3 py-2 text-sm"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowTableDialog(false)}
                  className="px-3 py-1.5 text-sm border border-slate-300 rounded hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleInsertTable}
                  className="px-3 py-1.5 text-sm bg-[#2b579a] text-white rounded hover:bg-[#2b579a]/90"
                >
                  Insert
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Editor/Preview Area */}
      {isPreview ? (
        <div className="p-4 min-h-[400px] max-h-[600px] overflow-y-auto prose prose-sm max-w-none">
          <ReactMarkdown>{value}</ReactMarkdown>
        </div>
      ) : (
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full h-[400px] p-4 resize-none focus:outline-none font-mono text-sm"
        />
      )}

      {/* Status Bar */}
      <div className="flex items-center justify-between px-3 py-2 bg-slate-50 border-t border-slate-300 text-xs text-slate-600">
        <div className="flex items-center gap-4">
          <span>{wordCount} words</span>
          <span>~{readingTime} min read</span>
          <span>{value.length} characters</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-slate-400">Auto-saved</span>
        </div>
      </div>
    </div>
  );
}

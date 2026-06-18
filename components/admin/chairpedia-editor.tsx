"use client"

import { useRef } from "react"
import { useEditor, EditorContent, type Editor } from "@tiptap/react"
import StarterKit from "@tiptap/starter-kit"
import Image from "@tiptap/extension-image"
import Link from "@tiptap/extension-link"
import {
  Bold, Italic, Strikethrough, Heading2, Heading3, List, ListOrdered,
  Quote, Minus, Link2, ImagePlus, Undo, Redo,
} from "lucide-react"
import { cn } from "@/lib/utils"

function Btn({
  onClick, active, disabled, title, children,
}: {
  onClick: () => void; active?: boolean; disabled?: boolean; title: string; children: React.ReactNode
}) {
  return (
    <button
      type="button"
      title={title}
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "h-8 w-8 inline-flex items-center justify-center rounded hover:bg-muted disabled:opacity-40",
        active && "bg-foreground text-background hover:bg-foreground"
      )}
    >
      {children}
    </button>
  )
}

function Toolbar({ editor }: { editor: Editor }) {
  const fileRef = useRef<HTMLInputElement>(null)

  async function uploadAndInsert(file: File) {
    const fd = new FormData()
    fd.append("file", file)
    const res = await fetch("/api/admin/chairpedia/upload", { method: "POST", body: fd })
    const data = await res.json()
    if (data.url) editor.chain().focus().setImage({ src: data.url, alt: file.name }).run()
    else alert(data.error ?? "Image upload failed")
  }

  return (
    <div className="flex flex-wrap items-center gap-0.5 border-b border-border bg-muted/40 p-1.5 sticky top-0 z-10">
      <Btn title="Bold" active={editor.isActive("bold")} onClick={() => editor.chain().focus().toggleBold().run()}><Bold className="h-4 w-4" /></Btn>
      <Btn title="Italic" active={editor.isActive("italic")} onClick={() => editor.chain().focus().toggleItalic().run()}><Italic className="h-4 w-4" /></Btn>
      <Btn title="Strike" active={editor.isActive("strike")} onClick={() => editor.chain().focus().toggleStrike().run()}><Strikethrough className="h-4 w-4" /></Btn>
      <span className="mx-1 h-5 w-px bg-border" />
      <Btn title="Heading 2" active={editor.isActive("heading", { level: 2 })} onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}><Heading2 className="h-4 w-4" /></Btn>
      <Btn title="Heading 3" active={editor.isActive("heading", { level: 3 })} onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}><Heading3 className="h-4 w-4" /></Btn>
      <Btn title="Bullet list" active={editor.isActive("bulletList")} onClick={() => editor.chain().focus().toggleBulletList().run()}><List className="h-4 w-4" /></Btn>
      <Btn title="Numbered list" active={editor.isActive("orderedList")} onClick={() => editor.chain().focus().toggleOrderedList().run()}><ListOrdered className="h-4 w-4" /></Btn>
      <Btn title="Quote" active={editor.isActive("blockquote")} onClick={() => editor.chain().focus().toggleBlockquote().run()}><Quote className="h-4 w-4" /></Btn>
      <Btn title="Divider" onClick={() => editor.chain().focus().setHorizontalRule().run()}><Minus className="h-4 w-4" /></Btn>
      <span className="mx-1 h-5 w-px bg-border" />
      <Btn
        title="Link"
        active={editor.isActive("link")}
        onClick={() => {
          if (editor.isActive("link")) { editor.chain().focus().unsetLink().run(); return }
          const url = window.prompt("Link URL")
          if (url) editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run()
        }}
      ><Link2 className="h-4 w-4" /></Btn>
      <Btn title="Insert image" onClick={() => fileRef.current?.click()}><ImagePlus className="h-4 w-4" /></Btn>
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0]
          if (f) void uploadAndInsert(f)
          e.target.value = ""
        }}
      />
      <span className="mx-1 h-5 w-px bg-border" />
      <Btn title="Undo" disabled={!editor.can().undo()} onClick={() => editor.chain().focus().undo().run()}><Undo className="h-4 w-4" /></Btn>
      <Btn title="Redo" disabled={!editor.can().redo()} onClick={() => editor.chain().focus().redo().run()}><Redo className="h-4 w-4" /></Btn>
    </div>
  )
}

export function ChairpediaEditor({
  value,
  onChange,
}: {
  value: string
  onChange: (html: string) => void
}) {
  const editor = useEditor({
    immediatelyRender: false, // required for Next.js SSR
    extensions: [
      StarterKit.configure({ link: false }),
      Image.configure({ inline: false }),
      Link.configure({ openOnClick: false, autolink: true }),
    ],
    content: value || "<p></p>",
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
    editorProps: {
      attributes: {
        class:
          "chairpedia-body min-h-[460px] max-w-none px-5 py-4 focus:outline-none",
      },
    },
  })

  if (!editor) {
    return <div className="min-h-[460px] rounded-b-lg bg-white" />
  }

  return (
    <div className="rounded-lg border border-border bg-white overflow-hidden">
      <Toolbar editor={editor} />
      <EditorContent editor={editor} />
    </div>
  )
}

import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Search, ArrowLeft, Shield } from 'lucide-react';
import { NoteItem } from '../types';

interface DiscreetNotesProps {
  onUnlock: () => void;
}

export const DiscreetNotes: React.FC<DiscreetNotesProps> = ({ onUnlock }) => {
  const [notes, setNotes] = useState<NoteItem[]>(() => {
    const saved = localStorage.getItem('sg_notes');
    return saved
      ? JSON.parse(saved)
      : [
          {
            id: '1',
            title: 'Grocery Checklist',
            content: 'Milk, Almonds, Brown Bread, Green Tea, Apples, Oats',
            updatedAt: Date.now() - 3600000,
          },
          {
            id: '2',
            title: 'Books to Read',
            content: 'Atomic Habits, Deep Work, Psychology of Money',
            updatedAt: Date.now() - 86400000,
          },
          {
            id: '3',
            title: 'Meeting Notes',
            content: 'Follow up on project roadmap and quarterly targets before Friday.',
            updatedAt: Date.now() - 172800000,
          },
        ];
  });

  const [search, setSearch] = useState('');
  const [editingNote, setEditingNote] = useState<NoteItem | null>(null);
  const [titleInput, setTitleInput] = useState('');
  const [contentInput, setContentInput] = useState('');
  const [holdTimer, setHoldTimer] = useState<number | null>(null);

  useEffect(() => {
    localStorage.setItem('sg_notes', JSON.stringify(notes));
  }, [notes]);

  const handleStartHold = () => {
    const t = window.setTimeout(() => {
      onUnlock();
    }, 1500);
    setHoldTimer(t);
  };

  const handleEndHold = () => {
    if (holdTimer) {
      clearTimeout(holdTimer);
      setHoldTimer(null);
    }
  };

  const handleSaveNote = () => {
    if (!titleInput.trim() && !contentInput.trim()) return;
    if (editingNote) {
      setNotes((prev) =>
        prev.map((n) =>
          n.id === editingNote.id
            ? { ...n, title: titleInput || 'Untitled', content: contentInput, updatedAt: Date.now() }
            : n
        )
      );
    } else {
      const newNote: NoteItem = {
        id: String(Date.now()),
        title: titleInput || 'Untitled',
        content: contentInput,
        updatedAt: Date.now(),
      };
      setNotes((prev) => [newNote, ...prev]);
    }
    setEditingNote(null);
    setTitleInput('');
    setContentInput('');
  };

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setNotes((prev) => prev.filter((n) => n.id !== id));
  };

  const filteredNotes = notes.filter(
    (n) =>
      n.title.toLowerCase().includes(search.toLowerCase()) ||
      n.content.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#f8f9fa] text-[#202124] flex flex-col font-sans select-none">
      {/* Discreet Header */}
      <header className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between sticky top-0 z-10 shadow-sm">
        <div
          className="flex items-center gap-2 cursor-pointer select-none"
          onMouseDown={handleStartHold}
          onMouseUp={handleEndHold}
          onTouchStart={handleStartHold}
          onTouchEnd={handleEndHold}
        >
          <span className="text-xl">📝</span>
          <div>
            <h1 className="text-lg font-bold tracking-tight text-gray-900 leading-none">
              QuickNotes
            </h1>
            <span className="text-[10px] text-gray-400">Hold title 2s to return</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onUnlock}
            className="p-1.5 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-600"
            title="SafeGuard Quick Switch"
          >
            <Shield className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Editing View */}
      {editingNote !== null ? (
        <div className="flex-1 p-4 flex flex-col bg-white">
          <div className="flex items-center justify-between pb-3 border-b border-gray-100 mb-3">
            <button
              onClick={() => setEditingNote(null)}
              className="p-1 rounded-full text-gray-600 hover:bg-gray-100"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <button
              onClick={handleSaveNote}
              className="px-4 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-semibold hover:bg-blue-700"
            >
              Save Note
            </button>
          </div>
          <input
            type="text"
            placeholder="Title"
            value={titleInput}
            onChange={(e) => setTitleInput(e.target.value)}
            className="text-lg font-bold text-gray-900 outline-none mb-2 placeholder-gray-400"
          />
          <textarea
            placeholder="Write your note here..."
            value={contentInput}
            onChange={(e) => setContentInput(e.target.value)}
            className="flex-1 resize-none outline-none text-sm text-gray-700 placeholder-gray-400"
          />
        </div>
      ) : (
        /* Note List View */
        <div className="flex-1 p-4 max-w-md mx-auto w-full">
          {/* Search bar */}
          <div className="relative mb-4">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Search notes..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-white rounded-xl border border-gray-200 text-xs text-gray-800 outline-none focus:border-blue-500 shadow-sm"
            />
          </div>

          <div className="space-y-3">
            {filteredNotes.map((note) => (
              <div
                key={note.id}
                onClick={() => {
                  setEditingNote(note);
                  setTitleInput(note.title);
                  setContentInput(note.content);
                }}
                className="p-3.5 bg-white rounded-xl border border-gray-200 shadow-xs hover:shadow transition cursor-pointer flex justify-between items-start"
              >
                <div>
                  <h3 className="font-semibold text-sm text-gray-900">{note.title}</h3>
                  <p className="text-xs text-gray-500 line-clamp-2 mt-1">{note.content}</p>
                  <span className="text-[10px] text-gray-400 mt-2 block">
                    {new Date(note.updatedAt).toLocaleDateString()}
                  </span>
                </div>
                <button
                  onClick={(e) => handleDelete(note.id, e)}
                  className="text-gray-300 hover:text-red-500 p-1"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>

          {/* Floating Add Button */}
          <button
            onClick={() => {
              setEditingNote({ id: '', title: '', content: '', updatedAt: Date.now() });
              setTitleInput('');
              setContentInput('');
            }}
            className="fixed bottom-6 right-6 w-14 h-14 rounded-full bg-blue-600 text-white shadow-lg flex items-center justify-center hover:bg-blue-700 active:scale-95 transition"
          >
            <Plus className="w-7 h-7" />
          </button>
        </div>
      )}
    </div>
  );
};

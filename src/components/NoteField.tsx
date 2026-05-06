import { useEffect, useRef, useState } from 'react';

interface Props {
  persistedNote: string | undefined;
  onSave: (note: string | undefined) => void;
}

export default function NoteField({ persistedNote, onSave }: Props) {
  const [expanded, setExpanded] = useState(false);
  const [text, setText] = useState('');
  const onSaveRef = useRef(onSave);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    onSaveRef.current = onSave;
  });

  useEffect(() => {
    if (!expanded) return;
    debounceRef.current = setTimeout(() => {
      onSaveRef.current(text.trim() || undefined);
    }, 500);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [text, expanded]);

  function handleExpand() {
    setText(persistedNote ?? '');
    setExpanded(true);
  }

  function handleDone() {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    onSaveRef.current(text.trim() || undefined);
    setExpanded(false);
  }

  if (!expanded) {
    return (
      <div
        onClick={handleExpand}
        className="bg-cream border-2 border-coral/20 rounded-2xl px-4 py-3 flex items-center gap-2 cursor-pointer active:scale-[0.99] transition-all"
      >
        <span>{persistedNote ? '📝' : '✏️'}</span>
        {persistedNote ? (
          <span className="text-ink/80 text-sm font-semibold line-clamp-2">{persistedNote}</span>
        ) : (
          <span className="text-ink/50 text-sm font-semibold">Add a note</span>
        )}
      </div>
    );
  }

  return (
    <div className="bg-cream border-2 border-coral rounded-2xl p-4">
      <textarea
        autoFocus
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Anything to remember about today?"
        className="w-full bg-transparent resize-none focus:outline-none text-ink placeholder:text-ink/40 min-h-[100px]"
      />
      <div className="flex justify-end mt-2">
        <button
          onClick={handleDone}
          className="bg-coral text-white rounded-full px-4 py-1.5 text-sm font-semibold"
        >
          Done
        </button>
      </div>
    </div>
  );
}

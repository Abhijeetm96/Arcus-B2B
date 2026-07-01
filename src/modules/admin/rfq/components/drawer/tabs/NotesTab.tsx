import * as React from 'react';
import { MessageSquare, Send } from 'lucide-react';
import type { RFQDetail } from '../../../types/rfqTypes';
import { Button } from '../../../../../../components/ui/Button';
import { Textarea } from '../../../../../../components/ui/textarea-base';
import { Checkbox } from '../../../../../../components/ui/Checkbox';
import { Badge } from '../../../../../../components/ui/Badge';
import { EmptyStateContainer } from '../../shared/EmptyStateContainer';

interface NotesTabProps {
  rfq: RFQDetail;
  onAddNote: (text: string, isInternal: boolean) => Promise<void>;
}

export function NotesTab({ rfq, onAddNote }: NotesTabProps) {
  const [text, setText] = React.useState('');
  const [isInternal, setIsInternal] = React.useState(true);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const notes = rfq.notes || [];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      await onAddNote(text, isInternal);
      setText('');
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 text-left select-none animate-in fade-in duration-200">
      {/* 1. New Comment Form */}
      <form onSubmit={handleSubmit} className="p-4 border border-border rounded bg-surface space-y-3">
        <h4 className="font-extrabold text-xs text-text-primary uppercase tracking-wider mb-1">
          Post Note / Clarification
        </h4>
        <Textarea
          placeholder="Type collaboration comments, spec feedback, or internal logs..."
          value={text}
          onChange={(e) => setText(e.target.value)}
          className="min-h-[80px] text-xs p-2.5 border-border focus:ring-primary"
          required
        />
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-1.5" onClick={() => setIsInternal(!isInternal)}>
            <Checkbox
              id="is-internal-note"
              checked={isInternal}
              onCheckedChange={(checked) => setIsInternal(!!checked)}
              aria-label="Mark note as internal"
            />
            <label htmlFor="is-internal-note" className="text-xs text-text-secondary font-semibold cursor-pointer">
              Internal (Sales Reps Only)
            </label>
          </div>
          <Button type="submit" size="sm" isLoading={isSubmitting} className="h-8 text-xs font-bold flex items-center gap-1">
            <Send className="h-3 w-3" />
            Post
          </Button>
        </div>
      </form>

      {/* 2. Notes Feed List */}
      <div className="space-y-4">
        {notes.length === 0 ? (
          <EmptyStateContainer
            title="No Notes Added"
            description="Be the first to leave an internal observation or a comment for the customer."
            icon={MessageSquare}
          />
        ) : (
          notes.map((note) => {
            const commentDate = new Date(note.timestamp);
            return (
              <div
                key={note.id}
                className={`p-3 border rounded ${
                  note.isInternal
                    ? 'bg-amber-500/5 border-amber-500/10'
                    : 'bg-slate-50 border-border/80'
                }`}
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="space-y-0.5">
                    <div className="font-bold text-xs text-text-primary">
                      {note.author}
                    </div>
                    <div className="text-[9px] text-text-secondary uppercase font-bold tracking-wide">
                      {note.authorRole}
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <Badge variant={note.isInternal ? 'warning' : 'info'} className="text-[9px] px-1.5 font-bold uppercase tracking-wider">
                      {note.isInternal ? 'Internal' : 'Customer-Visible'}
                    </Badge>
                    <span className="text-[10px] text-text-secondary font-medium">
                      {commentDate.toLocaleDateString()}
                    </span>
                  </div>
                </div>

                <p className="text-xs text-text-secondary leading-relaxed bg-white p-2.5 rounded border border-border/40">
                  {note.text}
                </p>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

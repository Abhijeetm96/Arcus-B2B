import * as React from 'react';
import { MessageSquare, Send, Bold, Italic, Code, Quote, CornerDownRight } from 'lucide-react';
import type { RFQDetail } from '../../../types/rfqTypes';
import { Button } from '../../../../../../components/ui/Button';
import { Textarea } from '../../../../../../components/ui/textarea-base';
import { Checkbox } from '../../../../../../components/ui/Checkbox';
import { Badge } from '../../../../../../components/ui/Badge';
import { EmptyStateContainer } from '../../shared/EmptyStateContainer';
import { cn } from '../../../../../../components/ui/utils';
interface NotesTabProps {
  rfq: RFQDetail;
  onAddNote: (text: string, isInternal: boolean, parentCommentId?: string) => Promise<void>;
  onRefresh?: () => void;
}

export function NotesTab({ rfq, onAddNote, onRefresh }: NotesTabProps) {
  const [text, setText] = React.useState('');
  const [isInternal, setIsInternal] = React.useState(true);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [replyToId, setReplyToId] = React.useState<string | null>(null);

  // Mention system state
  const [showMentions, setShowMentions] = React.useState(false);
  const [mentionFilter, setMentionFilter] = React.useState('');
  const [cursorPos, setCursorPos] = React.useState(0);
  const textareaRef = React.useRef<HTMLTextAreaElement>(null);

  const notes = rfq.notes || [];

  // List of team members to mention
  const teamMembers = [
    { name: 'Rajesh Varma', username: 'rajesh' },
    { name: 'Karan Mehra', username: 'karan' },
    { name: 'Ananya Shrivastava', username: 'ananya' },
    { name: 'Siddharth Malhotra', username: 'siddharth' },
    { name: 'Operations Admin', username: 'admin' }
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      await onAddNote(text, isInternal, replyToId || undefined);
      setText('');
      setReplyToId(null);
      if (onRefresh) onRefresh();
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Rich Text Toolbar actions
  const insertText = (before: string, after: string = '') => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selection = text.substring(start, end);
    const replacement = before + (selection || 'text') + after;

    setText(text.substring(0, start) + replacement + text.substring(end));
    
    // Reset focus
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + before.length, start + before.length + (selection || 'text').length);
    }, 50);
  };

  // Mention detection logic
  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setText(value);
    const selectionEnd = e.target.selectionEnd;
    setCursorPos(selectionEnd);

    // Look back from cursor to find if we're typing a mention
    const textBeforeCursor = value.substring(0, selectionEnd);
    const lastAtIdx = textBeforeCursor.lastIndexOf('@');

    if (lastAtIdx !== -1 && lastAtIdx >= textBeforeCursor.lastIndexOf(' ')) {
      const filter = textBeforeCursor.substring(lastAtIdx + 1);
      setMentionFilter(filter);
      setShowMentions(true);
    } else {
      setShowMentions(false);
    }
  };

  const handleSelectMention = (username: string) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const textBeforeCursor = text.substring(0, cursorPos);
    const lastAtIdx = textBeforeCursor.lastIndexOf('@');
    const textAfterCursor = text.substring(cursorPos);

    const newText = text.substring(0, lastAtIdx) + `@${username} ` + textAfterCursor;
    setText(newText);
    setShowMentions(false);

    setTimeout(() => {
      textarea.focus();
      const newPos = lastAtIdx + username.length + 2;
      textarea.setSelectionRange(newPos, newPos);
    }, 50);
  };

  // Organize comments into parent and children threads
  const parentComments = notes.filter(n => !(n as any).parent_comment_id && !(n as any).parentCommentId);
  const getRepliesFor = (parentId: string) => {
    return notes.filter(n => (n as any).parent_comment_id === parentId || (n as any).parentCommentId === parentId);
  };

  return (
    <div className="space-y-6 text-left select-none animate-in fade-in duration-200">
      
      {/* 1. Rich-Text and Mentions Form */}
      <form onSubmit={handleSubmit} className="p-4 border border-slate-100 rounded-lg bg-white shadow-sm space-y-3 relative">
        <div className="flex justify-between items-center mb-1">
          <h4 className="font-extrabold text-xs text-slate-700 uppercase tracking-wider">
            {replyToId ? 'Post Reply to Thread' : 'Post Note / Clarification'}
          </h4>
          {replyToId && (
            <button 
              type="button" 
              onClick={() => setReplyToId(null)}
              className="text-[10px] text-rose-500 font-bold hover:underline"
            >
              Cancel Reply
            </button>
          )}
        </div>

        {/* Toolbar */}
        <div className="flex items-center gap-1.5 border border-slate-200 border-b-0 rounded-t p-1.5 bg-slate-50">
          <button 
            type="button" 
            title="Bold"
            onClick={() => insertText('**', '**')} 
            className="p-1 hover:bg-slate-200 rounded text-slate-600"
          >
            <Bold className="h-3.5 w-3.5" />
          </button>
          <button 
            type="button" 
            title="Italic"
            onClick={() => insertText('*', '*')} 
            className="p-1 hover:bg-slate-200 rounded text-slate-600"
          >
            <Italic className="h-3.5 w-3.5" />
          </button>
          <button 
            type="button" 
            title="Code Block"
            onClick={() => insertText('`', '`')} 
            className="p-1 hover:bg-slate-200 rounded text-slate-600"
          >
            <Code className="h-3.5 w-3.5" />
          </button>
          <button 
            type="button" 
            title="Quote"
            onClick={() => insertText('> ', '\n')} 
            className="p-1 hover:bg-slate-200 rounded text-slate-600"
          >
            <Quote className="h-3.5 w-3.5" />
          </button>
        </div>

        <div className="relative">
          <Textarea
            ref={textareaRef}
            placeholder="Type collaboration comments, spec feedback, or internal logs. Use @ to mention operators..."
            value={text}
            onChange={handleTextChange}
            className="min-h-[90px] text-xs p-2.5 rounded-t-none border-slate-200 focus:ring-indigo-500"
            required
          />

          {/* Mentions Autocomplete Box */}
          {showMentions && (
            <div className="absolute left-2 bottom-full mb-1 bg-white border border-slate-200 rounded shadow-lg max-h-32 overflow-y-auto w-48 z-20">
              {teamMembers
                .filter(m => m.username.includes(mentionFilter.toLowerCase()) || m.name.toLowerCase().includes(mentionFilter.toLowerCase()))
                .map(m => (
                  <button
                    key={m.username}
                    type="button"
                    onClick={() => handleSelectMention(m.username)}
                    className="w-full text-left px-2 py-1 text-xs hover:bg-slate-50 text-slate-700 block border-b last:border-b-0"
                  >
                    <span className="font-semibold">{m.name}</span> <span className="text-[10px] text-slate-400">@{m.username}</span>
                  </button>
                ))}
            </div>
          )}
        </div>

        <div className="flex justify-between items-center">
          <div className="flex items-center gap-1.5" onClick={() => setIsInternal(!isInternal)}>
            <Checkbox
              id="is-internal-note"
              checked={isInternal}
              onCheckedChange={(checked) => setIsInternal(!!checked)}
              aria-label="Mark note as internal"
            />
            <label htmlFor="is-internal-note" className="text-xs text-slate-500 font-semibold cursor-pointer">
              Internal (Sales Reps Only)
            </label>
          </div>
          <Button type="submit" size="sm" isLoading={isSubmitting} className="h-8 text-xs font-bold flex items-center gap-1 bg-indigo-600 hover:bg-indigo-700">
            <Send className="h-3 w-3" />
            {replyToId ? 'Reply' : 'Post'}
          </Button>
        </div>
      </form>

      {/* 2. Threaded Notes Feed */}
      <div className="space-y-4 max-h-[350px] overflow-y-auto pr-1">
        {parentComments.length === 0 ? (
          <EmptyStateContainer
            title="No Notes Added"
            description="Be the first to leave an internal observation or a comment for the team."
            icon={MessageSquare}
          />
        ) : (
          parentComments.map((note) => {
            const commentDate = new Date(note.timestamp);
            const replies = getRepliesFor(note.id);

            return (
              <div key={note.id} className="space-y-3">
                
                {/* Parent Comment */}
                <div
                  className={cn(
                    "p-3 border rounded-lg shadow-sm space-y-2",
                    note.isInternal || (note as any).is_internal
                      ? 'bg-amber-50/40 border-amber-100'
                      : 'bg-slate-50/40 border-slate-100'
                  )}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="font-bold text-xs text-slate-800">
                        {note.author || (note as any).author_name}
                      </div>
                      <div className="text-[9px] text-slate-400 uppercase font-bold tracking-wide">
                        {note.authorRole || (note as any).author_role || 'Operator'}
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <Badge 
                        variant={note.isInternal || (note as any).is_internal ? 'warning' : 'info'} 
                        className="text-[9px] px-1.5 font-bold uppercase tracking-wider"
                      >
                        {note.isInternal || (note as any).is_internal ? 'Internal' : 'Customer-Visible'}
                      </Badge>
                      <span className="text-[10px] text-slate-400 font-medium">
                        {commentDate.toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed bg-white p-2.5 rounded border border-slate-100">
                    {note.text}
                  </p>
                  
                  <div className="flex justify-end">
                    <button 
                      onClick={() => setReplyToId(note.id)}
                      className="text-[10px] font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-0.5"
                    >
                      Reply
                    </button>
                  </div>
                </div>

                {/* Nested Replies */}
                {replies.map((reply) => {
                  const replyDate = new Date(reply.timestamp);
                  return (
                    <div key={reply.id} className="flex gap-2 pl-6 animate-in slide-in-from-left-2 duration-150">
                      <CornerDownRight className="h-4 w-4 text-slate-300 shrink-0 mt-2" />
                      <div
                        className={cn(
                          "p-3 border rounded-lg shadow-sm space-y-2 flex-1",
                          reply.isInternal || (reply as any).is_internal
                            ? 'bg-amber-50/20 border-amber-100/60'
                            : 'bg-slate-50/20 border-slate-100/60'
                        )}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <div className="font-bold text-xs text-slate-800">
                              {reply.author || (reply as any).author_name}
                            </div>
                            <div className="text-[9px] text-slate-400 uppercase font-bold tracking-wide">
                              {reply.authorRole || (reply as any).author_role || 'Operator'}
                            </div>
                          </div>

                          <div className="flex items-center gap-1.5">
                            <span className="text-[10px] text-slate-400 font-medium">
                              {replyDate.toLocaleDateString()}
                            </span>
                          </div>
                        </div>

                        <p className="text-xs text-slate-600 leading-relaxed bg-white/80 p-2.5 rounded border border-slate-100/60">
                          {reply.text}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

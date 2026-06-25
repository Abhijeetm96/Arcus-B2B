import * as React from 'react';
import { Send, User } from 'lucide-react';
import { cn } from '../ui/utils';
import { Button } from '../ui/Button';

export interface CommentBoxProps extends React.HTMLAttributes<HTMLDivElement> {
  onSubmitComment?: (comment: string) => void;
  placeholder?: string;
  submitLabel?: string;
}

const CommentBox = React.forwardRef<HTMLDivElement, CommentBoxProps>(
  ({ className, onSubmitComment, placeholder = 'Add a comment...', submitLabel = 'Send', ...props }, ref) => {
    const [text, setText] = React.useState('');

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      if (!text.trim()) return;
      if (onSubmitComment) {
        onSubmitComment(text.trim());
      }
      setText('');
    };

    return (
      <div ref={ref} className={cn('space-y-4 w-full', className)} {...props}>
        <form onSubmit={handleSubmit} className="flex gap-3">
          <div className="flex-shrink-0 mt-1">
            <div className="h-8 w-8 rounded-full bg-surface-secondary border border-border flex items-center justify-center text-text-secondary">
              <User className="h-4 w-4" />
            </div>
          </div>
          <div className="flex-grow space-y-2">
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder={placeholder}
              rows={3}
              className="w-full rounded border border-border bg-surface px-3 py-2 text-sm text-text-primary placeholder:text-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            />
            <div className="flex justify-end">
              <Button type="submit" size="sm" className="gap-1.5" disabled={!text.trim()}>
                <Send className="h-3 w-3" />
                {submitLabel}
              </Button>
            </div>
          </div>
        </form>
      </div>
    );
  }
);
CommentBox.displayName = 'CommentBox';

export { CommentBox };

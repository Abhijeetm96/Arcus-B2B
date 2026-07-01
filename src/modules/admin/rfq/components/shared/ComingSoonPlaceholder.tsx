import { Hammer } from 'lucide-react';
import { Card, CardContent } from '../../../../../components/ui/Card';

interface ComingSoonPlaceholderProps {
  title: string;
  description: string;
}

export function ComingSoonPlaceholder({ title, description }: ComingSoonPlaceholderProps) {
  return (
    <Card className="border border-dashed border-border bg-surface-secondary/5 h-full min-h-[250px] flex items-center justify-center">
      <CardContent className="p-6 text-center max-w-sm flex flex-col items-center">
        <div className="h-10 w-10 rounded bg-primary/10 flex items-center justify-center text-primary mb-4 animate-bounce">
          <Hammer className="h-5 w-5" />
        </div>
        <h4 className="font-bold text-text-primary text-sm mb-1">{title}</h4>
        <p className="text-xs text-text-secondary leading-relaxed">
          {description}
        </p>
      </CardContent>
    </Card>
  );
}

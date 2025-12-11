
"use client";

import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface ReadMoreProps {
  text: string;
  className?: string;
  initialLines?: number;
}

export function ReadMore({ text, className, initialLines = 2 }: ReadMoreProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
  };

  const lines = useMemo(() => text.split('\n'), [text]);
  const needsTruncation = lines.length > initialLines;
  
  const displayText = useMemo(() => {
    if (!needsTruncation || isExpanded) {
        return text;
    }
    return lines.slice(0, initialLines).join('\n');
  }, [needsTruncation, isExpanded, text, lines, initialLines]);


  return (
    <div className={className}>
      <p className={cn(
        'text-muted-foreground transition-all duration-300 whitespace-pre-wrap',
      )}>
        {displayText}
      </p>
      {needsTruncation && (
        <Button
          variant="link"
          className="px-0 h-auto py-1 text-sm text-primary hover:text-primary/80"
          onClick={toggleExpanded}
        >
          {isExpanded ? 'Read less' : 'Read more'}
        </Button>
      )}
    </div>
  );
}

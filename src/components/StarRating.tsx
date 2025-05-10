"use client";

import React, { useState } from 'react';
import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StarRatingProps {
  totalStars?: number;
  initialRating?: number;
  onRate: (rating: number) => void;
  size?: number;
  className?: string;
  readOnly?: boolean;
}

export function StarRating({ 
  totalStars = 5, 
  initialRating = 0, 
  onRate,
  size = 24,
  className,
  readOnly = false,
}: StarRatingProps) {
  const [hoverRating, setHoverRating] = useState(0);
  
  const handleClick = (rating: number) => {
    if (readOnly) return;
    onRate(rating);
  };

  const handleMouseEnter = (rating: number) => {
    if (readOnly) return;
    setHoverRating(rating);
  };

  const handleMouseLeave = () => {
    if (readOnly) return;
    setHoverRating(0);
  };

  return (
    <div className={cn("flex items-center space-x-1", className, readOnly ? "cursor-default" : "cursor-pointer")}>
      {[...Array(totalStars)].map((_, index) => {
        const starValue = index + 1;
        const filled = starValue <= (hoverRating || initialRating);
        return (
          <Star
            key={starValue}
            size={size}
            className={cn(
              "transition-colors",
              filled ? "fill-accent text-accent" : "text-muted-foreground/50",
              !readOnly && "hover:text-accent"
            )}
            onClick={() => handleClick(starValue)}
            onMouseEnter={() => handleMouseEnter(starValue)}
            onMouseLeave={handleMouseLeave}
            aria-label={`Rate ${starValue} out of ${totalStars} stars`}
          />
        );
      })}
    </div>
  );
}

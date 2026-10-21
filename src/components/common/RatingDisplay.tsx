import React from 'react';
import { Star, Award } from 'lucide-react';
import { QuestionRating } from '../../types';

interface RatingDisplayProps {
  rating?: QuestionRating;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

export const RatingDisplay: React.FC<RatingDisplayProps> = ({
  rating,
  size = 'md',
  showLabel = true,
}) => {
  const hasEvaluations = Boolean(rating && rating.evaluation_count > 0);
  const score = rating?.average_score ?? 0;
  const count = rating?.evaluation_count ?? 0;

  if (!hasEvaluations) {
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-amber-50 text-amber-800 border border-amber-200/60">
        <Star className="w-3.5 h-3.5 text-amber-500 fill-transparent" />
        <span>Not yet evaluated</span>
      </span>
    );
  }

  // Size styling classes
  const sizeClasses = {
    sm: 'text-xs px-2.5 py-0.5',
    md: 'text-sm px-3 py-1',
    lg: 'text-base px-4 py-1.5',
  };

  return (
    <div className="inline-flex items-center gap-2">
      <span
        className={`inline-flex items-center gap-1.5 rounded-full font-semibold bg-purple-50 text-syllabo-900 border border-purple-200/80 ${sizeClasses[size]}`}
      >
        <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
        <span>{score.toFixed(1)}</span>
        <span className="text-slate-400 font-normal text-xs">/ 8</span>
      </span>

      {showLabel && (
        <span className="text-xs text-slate-500 flex items-center gap-1">
          <Award className="w-3.5 h-3.5 text-slate-400" />
          <span>
            {count} faculty {count === 1 ? 'evaluation' : 'evaluations'}
          </span>
        </span>
      )}
    </div>
  );
};

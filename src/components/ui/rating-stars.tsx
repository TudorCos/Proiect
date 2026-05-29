import { Star } from 'lucide-react';

interface RatingStarsProps {
  rating: number;
  reviewCount: number;
  showScoreText?: boolean;
  size?: number;
  textSizeClass?: string;
}

export function RatingStars({
  rating,
  reviewCount,
  showScoreText = true,
  size = 14,
  textSizeClass = "text-[10px] text-zinc-500",
}: RatingStarsProps) {
  return (
    <div className="flex items-center gap-1.5 select-none">
      <div className="flex items-center gap-0.5">
        {Array.from({ length: 5 }).map((_, index) => {
          const fillPercent = Math.min(100, Math.max(0, (rating - index) * 100));
          return (
            <div
              key={index}
              className="relative inline-flex items-center justify-center"
              style={{ width: `${size}px`, height: `${size}px` }}
            >
              {/* Background star */}
              <Star
                className="text-zinc-700"
                style={{ width: `${size}px`, height: `${size}px`, minWidth: `${size}px` }}
              />
              {/* Foreground star */}
              <div
                className="absolute top-0 left-0 bottom-0 overflow-hidden"
                style={{ width: `${fillPercent}%`, height: `${size}px` }}
              >
                <Star
                  className="text-sky-400 fill-sky-400"
                  style={{ width: `${size}px`, height: `${size}px`, minWidth: `${size}px` }}
                />
              </div>
            </div>
          );
        })}
      </div>
      {showScoreText && (
        <span className={textSizeClass}>
          {Number(rating).toFixed(1)}/5 ({reviewCount} {reviewCount === 1 ? 'recenzie' : 'recenzii'})
        </span>
      )}
    </div>
  );
}

'use client';

import * as React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Star, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface ReviewSectionProps {
  vin: string;
  initialReviewed?: boolean;
  initialRating?: number;
  initialNotes?: string;
  onReviewUpdate?: (data: { reviewed: boolean; rating?: number; notes?: string }) => void;
}

interface SaveState {
  status: 'idle' | 'saving' | 'success' | 'error';
  message?: string;
}

export function ReviewSection({
  vin,
  initialReviewed = false,
  initialRating,
  initialNotes = '',
  onReviewUpdate,
}: ReviewSectionProps) {
  const [reviewed, setReviewed] = React.useState(initialReviewed);
  const [rating, setRating] = React.useState<number>(initialRating || 0);
  const [hoverRating, setHoverRating] = React.useState<number>(0);
  const [notes, setNotes] = React.useState(initialNotes);
  const [saveState, setSaveState] = React.useState<SaveState>({ status: 'idle' });

  // Check if form has unsaved changes
  const hasChanges =
    reviewed !== initialReviewed ||
    rating !== (initialRating || 0) ||
    notes !== initialNotes;

  const handleSave = async () => {
    try {
      setSaveState({ status: 'saving' });

      const response = await fetch(`/api/listings/${vin}/review`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          reviewed_by_user: reviewed,
          user_rating: rating > 0 ? rating : undefined,
          user_notes: notes.trim() || undefined,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to save review');
      }

      const data = await response.json();

      setSaveState({
        status: 'success',
        message: 'Review saved successfully!',
      });

      // Call the callback if provided
      if (onReviewUpdate) {
        onReviewUpdate({
          reviewed: data.data.reviewed_by_user,
          rating: data.data.user_rating,
          notes: data.data.user_notes,
        });
      }

      // Clear success message after 3 seconds
      setTimeout(() => {
        setSaveState({ status: 'idle' });
      }, 3000);
    } catch (error) {
      console.error('Error saving review:', error);
      setSaveState({
        status: 'error',
        message: error instanceof Error ? error.message : 'Failed to save review',
      });

      // Clear error message after 5 seconds
      setTimeout(() => {
        setSaveState({ status: 'idle' });
      }, 5000);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Your Review</CardTitle>
        <CardDescription>
          Mark this vehicle as reviewed and add your rating and notes
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Reviewed Checkbox */}
        <div className="flex items-center space-x-2">
          <Checkbox
            id="reviewed"
            checked={reviewed}
            onCheckedChange={(checked) => setReviewed(checked === true)}
          />
          <Label
            htmlFor="reviewed"
            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
          >
            Mark as Reviewed
          </Label>
        </div>

        {/* Star Rating */}
        <div className="space-y-2">
          <Label>Rating (Optional)</Label>
          <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setRating(star)}
                onMouseEnter={() => setHoverRating(star)}
                onMouseLeave={() => setHoverRating(0)}
                className="focus:outline-none focus:ring-2 focus:ring-primary rounded transition-transform hover:scale-110"
                aria-label={`Rate ${star} star${star > 1 ? 's' : ''}`}
              >
                <Star
                  className={cn(
                    'w-8 h-8 transition-colors',
                    star <= (hoverRating || rating)
                      ? 'fill-yellow-400 text-yellow-400'
                      : 'text-gray-300'
                  )}
                />
              </button>
            ))}
            {rating > 0 && (
              <button
                type="button"
                onClick={() => setRating(0)}
                className="ml-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Clear
              </button>
            )}
          </div>
          {rating > 0 && (
            <p className="text-sm text-muted-foreground">
              {rating} star{rating > 1 ? 's' : ''}
            </p>
          )}
        </div>

        {/* Notes Textarea */}
        <div className="space-y-2">
          <Label htmlFor="notes">Notes (Optional)</Label>
          <Textarea
            id="notes"
            placeholder="Add your notes about this vehicle..."
            value={notes || ''}
            onChange={(e) => setNotes(e.target.value)}
            rows={4}
            className="resize-none"
          />
          <p className="text-xs text-muted-foreground">
            {notes?.length || 0} characters
          </p>
        </div>

        {/* Save Button */}
        <div className="flex items-center gap-3">
          <Button
            onClick={handleSave}
            disabled={!hasChanges || saveState.status === 'saving'}
            className="min-w-[120px]"
          >
            {saveState.status === 'saving' ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              'Save Review'
            )}
          </Button>

          {/* Feedback Messages */}
          {saveState.status === 'success' && (
            <div className="flex items-center gap-2 text-green-600">
              <CheckCircle className="w-4 h-4" />
              <span className="text-sm font-medium">{saveState.message}</span>
            </div>
          )}

          {saveState.status === 'error' && (
            <div className="flex items-center gap-2 text-red-600">
              <AlertCircle className="w-4 h-4" />
              <span className="text-sm font-medium">{saveState.message}</span>
            </div>
          )}

          {hasChanges && saveState.status === 'idle' && (
            <span className="text-sm text-muted-foreground">
              You have unsaved changes
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export default ReviewSection;

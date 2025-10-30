import React, { useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Star } from 'lucide-react';
import { Review, User } from '@/api/entities';

export default function ReviewForm({ nonprofitId, onSubmit }) {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [hoverRating, setHoverRating] = useState(0);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (rating === 0) {
      alert("Please select a rating.");
      return;
    }
    setLoading(true);
    try {
      const user = await User.me();
      await Review.create({
        reviewer_id: user.id,
        nonprofit_id: nonprofitId,
        rating: rating,
        comment: comment,
      });
      setRating(0);
      setComment("");
      onSubmit(); // Callback to refresh parent component
    } catch (error) {
      console.error("Error submitting review:", error);
      alert("You may have already reviewed this nonprofit.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="bg-blue-50 border-blue-100">
      <CardContent className="p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <h3 className="font-semibold text-lg">Leave a Review</h3>
          <div>
            <div className="flex items-center gap-1 mb-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={`w-6 h-6 cursor-pointer transition-colors ${
                    (hoverRating || rating) >= star ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'
                  }`}
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                />
              ))}
            </div>
          </div>
          <Textarea
            placeholder="Share your experience..."
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            className="bg-white"
            rows={4}
          />
          <Button type="submit" disabled={loading || rating === 0} className="bg-blue-600 hover:bg-blue-700">
            {loading ? 'Submitting...' : 'Submit Review'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
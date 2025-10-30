import React, { useState, useEffect } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Star } from 'lucide-react';
import { User } from '@/api/entities';
import { formatDistanceToNow } from 'date-fns';

export default function ReviewCard({ review }) {
  const [reviewer, setReviewer] = useState(null);

  useEffect(() => {
    const fetchReviewer = async () => {
      try {
        const userData = await User.get(review.reviewer_id);
        setReviewer(userData);
      } catch (error) {
        console.error("Error fetching reviewer data:", error);
        setReviewer({ full_name: "Anonymous" });
      }
    };
    fetchReviewer();
  }, [review.reviewer_id]);

  const reviewerName = reviewer?.full_name || 'Anonymous';
  const reviewerInitials = reviewerName.split(' ').map(n => n[0]).join('');

  return (
    <Card className="border-gray-200 shadow-sm">
      <CardContent className="p-4">
        <div className="flex gap-4">
          <Avatar>
            <AvatarImage src={reviewer?.profile_picture_url} />
            <AvatarFallback>{reviewerInitials}</AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <div className="flex justify-between items-center">
              <h4 className="font-semibold">{reviewerName}</h4>
              <span className="text-xs text-gray-500">
                {formatDistanceToNow(new Date(review.created_date), { addSuffix: true })}
              </span>
            </div>
            <div className="flex items-center gap-1 my-1">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`w-4 h-4 ${i < review.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`}
                />
              ))}
            </div>
            <p className="text-gray-700 text-sm">{review.comment}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
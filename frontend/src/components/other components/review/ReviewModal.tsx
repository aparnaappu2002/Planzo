import React, { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { RootState } from '@/redux/Store';
import { useSelector } from 'react-redux';
import { ReviewEntity } from '@/types/ReviewEntity';
import { useAddReview } from '@/hooks/clientCustomHooks';
interface ReviewModalProps {
  booking: {
    _id: string;
    service: { _id: string };
  };
  showReviewModal: boolean;
  setShowReviewModal: (value: boolean) => void;
}

interface UseAddReview {
  mutate: (review: ReviewEntity) => void;
  isLoading: boolean;
}


const Button: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement>> = ({ children, className, ...props }) => (
  <button className={className} {...props}>
    {children}
  </button>
);

const ReviewModal: React.FC<ReviewModalProps> = ({ booking, showReviewModal, setShowReviewModal }) => {
  const queryClient = useQueryClient();
  const clientId = useSelector((state: RootState) => state.clientSlice.client?._id || '');
  const addReview = useAddReview();

  // Form state
  const [rating, setRating] = useState<number>(0);
  const [comment, setComment] = useState<string>('');
  const [errors, setErrors] = useState<{ rating?: string; comment?: string }>({});

  // Validate form
  const validateForm = (): boolean => {
    const newErrors: { rating?: string; comment?: string } = {};
    if (!rating || rating < 1 || rating > 5) {
      newErrors.rating = 'Please select a rating between 1 and 5';
    }
    if (!comment.trim()) {
      newErrors.comment = 'Please enter a comment';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    const review: ReviewEntity = {
      reviewerId: clientId,
      targetId: booking.service._id,
      targetType: 'service',
      rating,
      comment,
    };

    addReview.mutate(review, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['Reviews', booking.service._id] });
        toast.success('Review submitted successfully');
        setShowReviewModal(false);
        setRating(0);
        setComment('');
      },
      onError: (err: any) => {
        toast.error(err.message || 'Failed to submit review');
      },
    });
  };

  // Handle star rating click
  const handleRatingClick = (value: number) => {
    setRating(value);
    setErrors((prev) => ({ ...prev, rating: undefined }));
  };

  // Handle modal close
  const handleClose = () => {
    setShowReviewModal(false);
    setRating(0);
    setComment('');
    setErrors({});
  };

  if (!showReviewModal) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60]">
      <div className="bg-white rounded-lg p-6 max-w-md w-full border-2 border-yellow-400">
        <h3 className="text-xl font-bold text-yellow-600 mb-4">Add Review</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Rating Input */}
          <div>
            <label className="block text-sm font-semibold text-yellow-600 mb-2">Rating</label>
            <div className="flex space-x-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => handleRatingClick(star)}
                  className={`text-2xl ${rating >= star ? 'text-yellow-500' : 'text-gray-300'} hover:text-yellow-400 transition-colors`}
                >
                  ★
                </button>
              ))}
            </div>
            {errors.rating && <p className="text-red-500 text-sm mt-1">{errors.rating}</p>}
          </div>

          {/* Comment Input */}
          <div>
            <label className="block text-sm font-semibold text-yellow-600 mb-2">Comment</label>
            <textarea
              value={comment}
              onChange={(e) => {
                setComment(e.target.value);
                setErrors((prev) => ({ ...prev, comment: undefined }));
              }}
              className="w-full p-2 border border-yellow-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400"
              rows={4}
              placeholder="Write your review here..."
            />
            {errors.comment && <p className="text-red-500 text-sm mt-1">{errors.comment}</p>}
          </div>

          {/* Buttons */}
          <div className="flex justify-end space-x-3">
            <Button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400 transition-colors"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={addReview.isLoading}
              className={`px-6 py-2.5 bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-white rounded-xl transition-all duration-200 transform hover:scale-105 shadow-lg ${
                addReview.isLoading ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {addReview.isLoading ? 'Submitting...' : 'Submit Review'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ReviewModal;
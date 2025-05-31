import { motion } from "framer-motion";
import { Input } from "@/components/ui/input";

interface RatingInputProps {
  rating: number;
  value: number;
  onChange: (value: number) => void;
  percentage: number;
}

const ratingLabels = {
  1: "Very Poor",
  2: "Poor", 
  3: "Fair",
  4: "Good",
  5: "Excellent"
};

const ratingEmojis = {
  1: "😞",
  2: "😕", 
  3: "😐",
  4: "😊",
  5: "😍"
};

export default function RatingInput({ rating, value, onChange, percentage }: RatingInputProps) {
  return (
    <motion.div 
      className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6 hover:shadow-md transition-shadow"
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.2 }}
    >
      <div className="text-center mb-4">
        <div className="text-4xl mb-2">
          {ratingEmojis[rating as keyof typeof ratingEmojis]}
        </div>
        <div className={`text-lg font-semibold rating-${rating}`}>
          {rating} Star{rating !== 1 ? 's' : ''}
        </div>
        <div className="text-sm text-muted-foreground">
          {ratingLabels[rating as keyof typeof ratingLabels]}
        </div>
      </div>
      
      <Input
        type="number"
        min="0"
        value={value}
        onChange={(e) => onChange(parseInt(e.target.value) || 0)}
        className={`text-center font-semibold border-rating-${rating} focus:ring-[hsl(var(--rating-${rating}))]`}
      />
      
      {/* Rating Bar */}
      <div className="mt-3 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
        <motion.div 
          className={`bg-rating-${rating} h-2 rounded-full`}
          style={{ width: `${percentage}%` }}
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        />
      </div>
      <div className="text-center text-sm text-muted-foreground mt-1">
        {percentage.toFixed(1)}%
      </div>
    </motion.div>
  );
}

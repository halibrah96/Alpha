import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Shield, X } from "lucide-react";

interface PrivacyBannerProps {
  onAccept: () => void;
}

export default function PrivacyBanner({ onAccept }: PrivacyBannerProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -100 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -100 }}
      className="fixed top-0 left-0 right-0 z-50 p-4"
    >
      <Card className="max-w-4xl mx-auto border-blue-200 bg-blue-50 dark:bg-blue-950 dark:border-blue-800">
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            <Shield className="w-6 h-6 text-blue-600 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-sm text-blue-800 dark:text-blue-200">
                <strong>Privacy & GDPR Compliance:</strong> We process your data securely and in compliance with GDPR regulations. 
                Data is used only for tool functionality and is not stored permanently unless required for service operation.
              </p>
            </div>
            <div className="flex gap-2">
              <Button 
                size="sm" 
                onClick={onAccept}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                Accept
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
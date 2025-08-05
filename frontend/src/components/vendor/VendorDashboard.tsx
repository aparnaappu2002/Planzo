import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { AlertTriangle, Clock, Mail, RefreshCw, User } from "lucide-react";

const ProfileNotApproved = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-orange-50 to-yellow-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Main Status Card */}
        <Card className="text-center border-orange-200 bg-white/80 backdrop-blur-sm shadow-lg">
          <CardHeader className="pb-4">
            <div className="flex justify-center mb-6">
              <div className="relative">
                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center opacity-90 border-2 border-gray-200">
                  <User className="w-10 h-10 text-gray-400" />
                </div>
                <div className="absolute -top-1 -right-1 w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center shadow-lg">
                  <AlertTriangle className="w-4 h-4 text-white" />
                </div>
              </div>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Profile Under Review
            </h1>
            <p className="text-gray-600 leading-relaxed">
              Your profile is currently being reviewed by our team. You'll be notified once the approval process is complete.
            </p>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Status Items */}
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-3 bg-orange-50 rounded-lg border border-orange-200">
                <Clock className="w-5 h-5 text-orange-600 flex-shrink-0" />
                <div className="text-left">
                  <p className="font-medium text-gray-900 text-sm">Review in Progress</p>
                  <p className="text-xs text-gray-500">Usually takes 1-2 business days</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                <Mail className="w-5 h-5 text-gray-500 flex-shrink-0" />
                <div className="text-left">
                  <p className="font-medium text-gray-900 text-sm">Email Notification</p>
                  <p className="text-xs text-gray-500">We'll email you when approved</p>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            {/* <div className="space-y-3 pt-4">
              <Button 
                className="w-full bg-orange-500 hover:bg-orange-600 text-white"
                onClick={() => window.location.reload()}
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Check Status
              </Button>
              
              <Button 
                variant="outline"
                className="w-full border-orange-200 text-orange-600 hover:bg-orange-50"
                onClick={() => window.open('mailto:support@example.com', '_blank')}
              >
                <Mail className="w-4 h-4 mr-2" />
                Contact Support
              </Button>
            </div> */}
          </CardContent>
        </Card>

        {/* Additional Info */}
        <Card className="bg-white/60 backdrop-blur-sm border-gray-200">
          <CardContent className="p-4">
            <h3 className="font-semibold text-gray-900 mb-2 text-sm">What happens next?</h3>
            <ul className="text-xs text-gray-600 space-y-1">
              <li>• Our team reviews your submitted information</li>
              <li>• You'll receive an email notification with the result</li>
              <li>• If approved, you'll gain full access immediately</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ProfileNotApproved;
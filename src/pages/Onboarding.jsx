import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { User, Nonprofit } from "@/api/entities";
import { createPageUrl } from "@/utils";
import { Heart } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { motion } from "framer-motion";

import CreateNonprofitForm from "../components/onboarding/CreateNonprofitForm";
import CategorySelector from "../components/onboarding/CategorySelector";

export default function OnboardingPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [userType, setUserType] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Determine user type from URL parameter
    const params = new URLSearchParams(location.search);
    const type = params.get('type');
    if (type === 'volunteer' || type === 'nonprofit_admin') {
      setUserType(type);
    } else {
      // If no valid type, redirect to landing to make a choice
      navigate(createPageUrl("LandingPage"));
    }
  }, [location.search, navigate]);

  const handleVolunteerSetup = async (data) => {
    setLoading(true);
    try {
      await User.updateMyUserData({
        full_name: data.full_name,
        phone: data.phone,
        location: data.location,
        user_type: "volunteer",
        preferred_categories: data.preferred_categories,
        profile_completed: true,
      });
      navigate(createPageUrl("Dashboard"));
    } catch (error) {
      console.error("Error setting up volunteer profile:", error);
      setLoading(false);
    }
  };

  const handleNonprofitSetup = async ({ nonprofitData, userData }) => {
    setLoading(true);
    try {
      const newNonprofit = await Nonprofit.create(nonprofitData);
      await User.updateMyUserData({
        full_name: userData.full_name,
        phone: userData.phone,
        location: userData.location,
        user_type: "nonprofit_admin",
        nonprofit_id: newNonprofit.id,
        profile_completed: true,
      });
      navigate(createPageUrl("Dashboard"));
    } catch (error) {
      console.error("Error setting up nonprofit profile:", error);
      setLoading(false);
    }
  };

  const renderOnboardingStep = () => {
    if (userType === "volunteer") {
      return (
        <motion.div
          key="volunteer-setup"
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <CategorySelector onComplete={handleVolunteerSetup} loading={loading} />
        </motion.div>
      );
    }
    if (userType === "nonprofit_admin") {
      return (
        <motion.div
          key="nonprofit-setup"
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <CreateNonprofitForm onComplete={handleNonprofitSetup} loading={loading} />
        </motion.div>
      );
    }
    return null;
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-indigo-50 p-4">
      <div className="w-full max-w-4xl">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-2">
            <Heart className="w-8 h-8 text-blue-600" />
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Welcome to Karma
            </h1>
          </div>
          <p className="text-lg text-gray-600">Let's get your profile set up!</p>
        </div>
        
        <Card className="bg-white/80 backdrop-blur-sm border-blue-100 shadow-2xl">
          <CardContent className="p-8 md:p-12">
            {renderOnboardingStep()}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
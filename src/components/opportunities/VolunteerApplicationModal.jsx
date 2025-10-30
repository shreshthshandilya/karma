import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Users, Send, Clock, MapPin } from "lucide-react";
import { User, VolunteerApplication, Opportunity } from "@/api/entities";

export default function VolunteerApplicationModal({ opportunity, nonprofitName, children }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [applicationData, setApplicationData] = useState({
    applicationMessage: "",
    relevantSkills: [],
    availability: "",
    contactPhone: ""
  });

  const handleInputChange = (field, value) => {
    setApplicationData(prev => ({ ...prev, [field]: value }));
  };

  const handleSkillsChange = (value) => {
    const skills = value.split(',').map(skill => skill.trim()).filter(skill => skill);
    setApplicationData(prev => ({ ...prev, relevantSkills: skills }));
  };

  const submitApplication = async () => {
    setLoading(true);
    try {
      const user = await User.me();
      
      await VolunteerApplication.create({
        volunteer_id: user.id,
        opportunity_id: opportunity.id,
        nonprofit_id: opportunity.nonprofit_id,
        application_message: applicationData.applicationMessage,
        relevant_skills: applicationData.relevantSkills,
        availability: applicationData.availability,
        contact_phone: applicationData.contactPhone,
        status: "pending"
      });

      // Update the opportunity's volunteer count
      await Opportunity.update(opportunity.id, {
        volunteers_signed_up: (opportunity.volunteers_signed_up || 0) + 1
      });

      setSubmitted(true);
    } catch (error) {
      console.error("Error submitting application:", error);
    } finally {
      setLoading(false);
    }
  };

  const resetModal = () => {
    setSubmitted(false);
    setApplicationData({
      applicationMessage: "",
      relevantSkills: [],
      availability: "",
      contactPhone: ""
    });
  };

  const handleOpenChange = (newOpen) => {
    setOpen(newOpen);
    if (!newOpen) {
      setTimeout(resetModal, 300); // Reset after modal closes
    }
  };

  const spotsAvailable = opportunity.volunteers_needed - (opportunity.volunteers_signed_up || 0);
  const isFull = spotsAvailable <= 0;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="w-5 h-5 text-blue-500" />
            Apply to Volunteer
          </DialogTitle>
        </DialogHeader>
        
        {submitted ? (
          <div className="text-center space-y-6 py-4">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
              <Users className="w-8 h-8 text-green-600" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Application Submitted!</h3>
              <p className="text-gray-600">
                {nonprofitName} will review your application and contact you soon.
              </p>
            </div>
            <Button onClick={() => setOpen(false)} className="bg-blue-600 hover:bg-blue-700">
              Close
            </Button>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Opportunity Summary */}
            <div className="p-4 bg-blue-50 rounded-lg">
              <h3 className="font-semibold text-gray-900 mb-2">{opportunity.title}</h3>
              <p className="text-sm text-gray-600 mb-3">{nonprofitName}</p>
              <div className="flex items-center gap-4 text-sm text-gray-500">
                <div className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {opportunity.time_commitment}
                </div>
                <div className="flex items-center gap-1">
                  <Users className="w-3 h-3" />
                  {spotsAvailable} spots left
                </div>
                {opportunity.location?.city && (
                  <div className="flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    {opportunity.location.city}
                  </div>
                )}
              </div>
            </div>

            {isFull ? (
              <div className="text-center py-8">
                <p className="text-gray-600 mb-4">Sorry, this opportunity is currently full.</p>
                <Button onClick={() => setOpen(false)} variant="outline">
                  Close
                </Button>
              </div>
            ) : (
              <>
                {/* Application Form */}
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Why are you interested in this opportunity?</Label>
                    <Textarea
                      placeholder="Tell us about your motivation and how you'd like to contribute..."
                      value={applicationData.applicationMessage}
                      onChange={(e) => handleInputChange('applicationMessage', e.target.value)}
                      className="h-24"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Relevant Skills (optional)</Label>
                    <Input
                      placeholder="e.g., teaching, event planning, graphic design"
                      value={applicationData.relevantSkills.join(', ')}
                      onChange={(e) => handleSkillsChange(e.target.value)}
                    />
                    <p className="text-xs text-gray-500">Separate multiple skills with commas</p>
                  </div>

                  <div className="space-y-2">
                    <Label>Your Availability</Label>
                    <Input
                      placeholder="e.g., Weekends, Evenings, Flexible"
                      value={applicationData.availability}
                      onChange={(e) => handleInputChange('availability', e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Phone Number</Label>
                    <Input
                      type="tel"
                      placeholder="(555) 123-4567"
                      value={applicationData.contactPhone}
                      onChange={(e) => handleInputChange('contactPhone', e.target.value)}
                    />
                  </div>
                </div>

                {/* Required Skills Display */}
                {opportunity.skills_needed && opportunity.skills_needed.length > 0 && (
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <Label className="text-sm font-medium text-gray-700 mb-2 block">
                      Skills Requested for this Opportunity:
                    </Label>
                    <div className="flex flex-wrap gap-2">
                      {opportunity.skills_needed.map((skill, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex gap-3">
                  <Button 
                    variant="outline" 
                    onClick={() => setOpen(false)}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={submitApplication}
                    disabled={loading || !applicationData.applicationMessage.trim()}
                    className="flex-1 bg-blue-600 hover:bg-blue-700"
                  >
                    {loading ? "Submitting..." : (
                      <>
                        <Send className="w-4 h-4 mr-2" />
                        Submit Application
                      </>
                    )}
                  </Button>
                </div>
              </>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
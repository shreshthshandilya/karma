
import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { User as UserIcon, Edit, Save, MapPin, Heart, Award, Calendar, Repeat, LogOut } from "lucide-react";
import RecurringDonationsTab from "../components/profile/RecurringDonationsTab";

export default function ProfilePage() {
  const [user, setUser] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({});

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const userData = await base44.auth.me();
      setUser(userData);
      setFormData(userData);
    } catch (error) {
      console.error("Error loading user data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await base44.auth.updateMe(formData);
      setUser({ ...user, ...formData });
      setIsEditing(false);
    } catch (error) {
      console.error("Error updating profile:", error);
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    if (confirm("Are you sure you want to log out?")) {
      base44.auth.logout();
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleLocationChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      location: {
        ...prev.location,
        [field]: value
      }
    }));
  };

  const handleCategoryToggle = (category) => {
    const currentCategories = formData.preferred_categories || [];
    const updatedCategories = currentCategories.includes(category)
      ? currentCategories.filter(c => c !== category)
      : [...currentCategories, category];
    
    handleInputChange('preferred_categories', updatedCategories);
  };

  const categories = [
    "education", "environment", "health", "poverty", "animals", 
    "arts_culture", "community_development", "human_rights", 
    "disaster_relief", "elderly_care", "youth_development", "other"
  ];

  const categoryColors = {
    education: "bg-blue-100 text-blue-800 hover:bg-blue-200",
    environment: "bg-green-100 text-green-800 hover:bg-green-200",
    health: "bg-red-100 text-red-800 hover:bg-red-200",
    poverty: "bg-yellow-100 text-yellow-800 hover:bg-yellow-200",
    animals: "bg-purple-100 text-purple-800 hover:bg-purple-200"
  };

  if (loading) {
    return (
      <div className="p-8">
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="animate-pulse">
            <div className="h-8 bg-blue-200 rounded w-1/3 mb-4"></div>
            <div className="h-64 bg-blue-100 rounded-xl"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <div className="p-4 md:p-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-24 h-24 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <UserIcon className="w-12 h-12 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{user?.full_name}</h1>
            <p className="text-gray-600">{user?.email}</p>
            <div className="mt-4 flex justify-center gap-3">
              <Button
                onClick={() => setIsEditing(!isEditing)}
                variant={isEditing ? "outline" : "default"}
                className={isEditing ? "border-blue-200 text-blue-700" : "bg-blue-600 hover:bg-blue-700"}
              >
                {isEditing ? (
                  <>Cancel</>
                ) : (
                  <>
                    <Edit className="w-4 h-4 mr-2" />
                    Edit Profile
                  </>
                )}
              </Button>
              {isEditing && (
                <Button
                  onClick={handleSave}
                  disabled={saving}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <Save className="w-4 h-4 mr-2" />
                  {saving ? "Saving..." : "Save Changes"}
                </Button>
              )}
              <Button
                onClick={handleLogout}
                variant="outline"
                className="border-red-200 text-red-700 hover:bg-red-50"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Log Out
              </Button>
            </div>
          </div>

          <Tabs defaultValue="profile" className="space-y-6">
            <TabsList className="grid w-full grid-cols-5 bg-blue-50">
              <TabsTrigger value="profile" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">Profile</TabsTrigger>
              <TabsTrigger value="preferences" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">Preferences</TabsTrigger>
              <TabsTrigger value="recurring" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">Recurring</TabsTrigger>
              <TabsTrigger value="achievements" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">Achievements</TabsTrigger>
              <TabsTrigger value="activity" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">Activity</TabsTrigger>
            </TabsList>

            <TabsContent value="profile">
              <Card className="bg-white/80 backdrop-blur-sm border-blue-100 shadow-xl">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <UserIcon className="w-5 h-5 text-blue-600" />
                    Personal Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="full_name">Full Name</Label>
                      <Input
                        id="full_name"
                        value={isEditing ? (formData.full_name || '') : (user?.full_name || '')}
                        onChange={(e) => handleInputChange('full_name', e.target.value)}
                        disabled={!isEditing}
                        className="bg-white border-blue-200"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        value={user?.email || ''}
                        disabled
                        className="bg-gray-50"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone</Label>
                      <Input
                        id="phone"
                        value={isEditing ? (formData.phone || '') : (user?.phone || '')}
                        onChange={(e) => handleInputChange('phone', e.target.value)}
                        disabled={!isEditing}
                        className="bg-white border-blue-200"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="user_type">Account Type</Label>
                      <Select
                        value={isEditing ? (formData.user_type || 'volunteer') : (user?.user_type || 'volunteer')}
                        onValueChange={(value) => handleInputChange('user_type', value)}
                        disabled={!isEditing}
                      >
                        <SelectTrigger className="bg-white border-blue-200">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="volunteer">Volunteer</SelectItem>
                          <SelectItem value="nonprofit_admin">Nonprofit Admin</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <Label>Location</Label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="city">City</Label>
                        <Input
                          id="city"
                          value={isEditing ? (formData.location?.city || '') : (user?.location?.city || '')}
                          onChange={(e) => handleLocationChange('city', e.target.value)}
                          disabled={!isEditing}
                          className="bg-white border-blue-200"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="state">State</Label>
                        <Input
                          id="state"
                          value={isEditing ? (formData.location?.state || '') : (user?.location?.state || '')}
                          onChange={(e) => handleLocationChange('state', e.target.value)}
                          disabled={!isEditing}
                          className="bg-white border-blue-200"
                        />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="preferences">
              <Card className="bg-white/80 backdrop-blur-sm border-blue-100 shadow-xl">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Heart className="w-5 h-5 text-blue-600" />
                    Preferred Categories
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 mb-4">
                    Select the causes you're most passionate about to get personalized recommendations
                  </p>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                    {categories.map((category) => (
                      <button
                        key={category}
                        onClick={() => isEditing && handleCategoryToggle(category)}
                        disabled={!isEditing}
                        className={`p-3 rounded-lg border text-sm font-medium transition-all duration-200 ${
                          (isEditing ? formData.preferred_categories : user?.preferred_categories)?.includes(category)
                            ? categoryColors[category] || "bg-blue-100 text-blue-800"
                            : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50"
                        } ${isEditing ? "cursor-pointer hover:scale-105" : "cursor-default"}`}
                      >
                        {category.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      </button>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="recurring">
              <RecurringDonationsTab user={user} />
            </TabsContent>
            
            <TabsContent value="achievements">
              <Card className="bg-white/80 backdrop-blur-sm border-blue-100 shadow-xl">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Award className="w-5 h-5 text-blue-600" />
                    Your Achievements
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                    <div className="text-center p-6 rounded-lg bg-gradient-to-br from-blue-50 to-blue-100">
                      <div className="text-3xl font-bold text-blue-600">${user?.total_donated || 0}</div>
                      <p className="text-gray-600">Total Donated</p>
                    </div>
                    <div className="text-center p-6 rounded-lg bg-gradient-to-br from-green-50 to-green-100">
                      <div className="text-3xl font-bold text-green-600">{user?.total_volunteer_hours || 0}</div>
                      <p className="text-gray-600">Hours Volunteered</p>
                    </div>
                    <div className="text-center p-6 rounded-lg bg-gradient-to-br from-purple-50 to-purple-100">
                      <div className="text-3xl font-bold text-purple-600">{user?.favorite_nonprofits?.length || 0}</div>
                      <p className="text-gray-600">Organizations Supported</p>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <h3 className="font-semibold text-gray-900">Badges Earned</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {user?.achievements?.length > 0 ? (
                        user.achievements.map((achievement, index) => (
                          <div key={index} className="text-center p-4 rounded-lg bg-gradient-to-br from-yellow-50 to-orange-50 border border-yellow-200">
                            <div className="text-2xl mb-2">🏆</div>
                            <p className="font-medium text-gray-900">{achievement}</p>
                          </div>
                        ))
                      ) : (
                        <div className="col-span-full text-center py-8">
                          <Award className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                          <p className="text-gray-600">Start volunteering and donating to earn badges!</p>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="activity">
              <Card className="bg-white/80 backdrop-blur-sm border-blue-100 shadow-xl">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-blue-600" />
                    Recent Activity
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8">
                    <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">Your activity history will appear here</p>
                    <p className="text-sm text-gray-500 mt-2">Start volunteering and donating to see your impact!</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}

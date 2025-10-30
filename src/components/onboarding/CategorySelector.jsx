import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Heart, CheckCircle } from "lucide-react";

export default function CategorySelector({ onComplete, loading }) {
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [formData, setFormData] = useState({
    full_name: "",
    phone: "",
    city: "",
    state: ""
  });

  const categories = [
    "education", "environment", "health", "poverty", "animals", 
    "arts_culture", "community_development", "human_rights", 
    "disaster_relief", "elderly_care", "youth_development", "other"
  ];

  const categoryColors = {
    education: "border-blue-300 bg-blue-50 text-blue-800 hover:bg-blue-100",
    environment: "border-green-300 bg-green-50 text-green-800 hover:bg-green-100",
    health: "border-red-300 bg-red-50 text-red-800 hover:bg-red-100",
    poverty: "border-yellow-300 bg-yellow-50 text-yellow-800 hover:bg-yellow-100",
    animals: "border-purple-300 bg-purple-50 text-purple-800 hover:bg-purple-100",
    arts_culture: "border-pink-300 bg-pink-50 text-pink-800 hover:bg-pink-100",
    community_development: "border-indigo-300 bg-indigo-50 text-indigo-800 hover:bg-indigo-100"
  };

  const handleToggle = (category) => {
    setSelectedCategories(prev => 
      prev.includes(category) 
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const isFormValid = () => {
    return formData.full_name && formData.phone && formData.city && formData.state && selectedCategories.length > 0;
  };

  const handleSubmit = () => {
    onComplete({
      ...formData,
      location: {
        city: formData.city,
        state: formData.state
      },
      preferred_categories: selectedCategories
    });
  };

  return (
    <div className="space-y-8">
      {/* Personal Information Section */}
      <div>
        <Heart className="w-12 h-12 mx-auto mb-4 text-blue-600" />
        <h2 className="text-2xl font-bold text-gray-900 mb-2 text-center">Let's get to know you</h2>
        <p className="text-gray-600 mb-6 text-center">Tell us a bit about yourself</p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <div className="space-y-2">
            <Label htmlFor="full_name">Full Name *</Label>
            <Input
              id="full_name"
              value={formData.full_name}
              onChange={(e) => handleInputChange('full_name', e.target.value)}
              placeholder="John Doe"
              className="border-blue-200"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="phone">Phone Number *</Label>
            <Input
              id="phone"
              value={formData.phone}
              onChange={(e) => handleInputChange('phone', e.target.value)}
              placeholder="(555) 123-4567"
              className="border-blue-200"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="city">City *</Label>
            <Input
              id="city"
              value={formData.city}
              onChange={(e) => handleInputChange('city', e.target.value)}
              placeholder="San Francisco"
              className="border-blue-200"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="state">State *</Label>
            <Input
              id="state"
              value={formData.state}
              onChange={(e) => handleInputChange('state', e.target.value)}
              placeholder="CA"
              className="border-blue-200"
            />
          </div>
        </div>
      </div>

      {/* Categories Section */}
      <div>
        <h3 className="text-xl font-bold text-gray-900 mb-2 text-center">What causes are you passionate about?</h3>
        <p className="text-gray-600 mb-6 text-center">Select at least one category that interests you</p>
        
        <div className="flex flex-wrap justify-center gap-3 mb-8">
          {categories.map(category => (
            <Badge
              key={category}
              onClick={() => handleToggle(category)}
              className={`px-4 py-2 text-sm font-medium cursor-pointer transition-all duration-200 border ${
                selectedCategories.includes(category)
                  ? `${categoryColors[category] || 'border-blue-500 bg-blue-100 text-blue-900'} ring-2 ring-blue-500`
                  : "border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
              }`}
            >
              {category.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
            </Badge>
          ))}
        </div>
      </div>

      <div className="text-center">
        <Button
          onClick={handleSubmit}
          disabled={loading || !isFormValid()}
          size="lg"
          className="bg-blue-600 hover:bg-blue-700"
        >
          <CheckCircle className="w-5 h-5 mr-2" />
          {loading ? "Saving..." : "Complete Profile"}
        </Button>
        {!isFormValid() && (
          <p className="text-sm text-gray-500 mt-2">Please fill in all required fields and select at least one category</p>
        )}
      </div>
    </div>
  );
}
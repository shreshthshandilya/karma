import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Building2, CheckCircle, User as UserIcon } from "lucide-react";
import { User } from "@/api/entities";

export default function CreateNonprofitForm({ onComplete, loading }) {
  const [formData, setFormData] = useState({
    // Personal info
    full_name: "",
    phone: "",
    city: "",
    state: "",
    // Nonprofit info
    name: "",
    ein: "",
    category: "",
    description: "",
    mission_statement: "",
    contact_email: "",
    website: "",
    org_city: "",
    org_state: "",
  });

  const categories = [
    "education", "environment", "health", "poverty", "animals", 
    "arts_culture", "community_development", "human_rights", 
    "disaster_relief", "elderly_care", "youth_development", "other"
  ];

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };
  
  const handleSubmit = async () => {
    const currentUser = await User.me();
    const nonprofitData = { 
      name: formData.name,
      ein: formData.ein,
      category: formData.category,
      description: formData.description,
      mission_statement: formData.mission_statement,
      contact_email: formData.contact_email,
      website: formData.website,
      location: {
        city: formData.org_city,
        state: formData.org_state
      },
      admin_user_id: currentUser.id 
    };
    
    const userData = {
      full_name: formData.full_name,
      phone: formData.phone,
      location: {
        city: formData.city,
        state: formData.state
      }
    };
    
    onComplete({ nonprofitData, userData });
  };

  const isFormValid = () => {
    return formData.full_name && formData.phone && formData.city && formData.state &&
           formData.name && formData.category && formData.description && formData.contact_email && formData.ein;
  }

  return (
    <div className="space-y-8">
      {/* Personal Information Section */}
      <div>
        <div className="text-center mb-6">
          <UserIcon className="w-12 h-12 mx-auto mb-4 text-blue-600" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Your Information</h2>
          <p className="text-gray-600">Let's start with your personal details</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-6 bg-blue-50 rounded-lg border border-blue-200">
          <div className="space-y-2">
            <Label htmlFor="full_name">Your Full Name *</Label>
            <Input 
              id="full_name" 
              value={formData.full_name} 
              onChange={e => handleChange('full_name', e.target.value)} 
              placeholder="Jane Smith"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="phone">Your Phone Number *</Label>
            <Input 
              id="phone" 
              value={formData.phone} 
              onChange={e => handleChange('phone', e.target.value)} 
              placeholder="(555) 123-4567"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="city">Your City *</Label>
            <Input 
              id="city" 
              value={formData.city} 
              onChange={e => handleChange('city', e.target.value)} 
              placeholder="San Francisco"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="state">Your State *</Label>
            <Input 
              id="state" 
              value={formData.state} 
              onChange={e => handleChange('state', e.target.value)} 
              placeholder="CA"
            />
          </div>
        </div>
      </div>

      {/* Organization Information Section */}
      <div>
        <div className="text-center mb-6">
          <Building2 className="w-12 h-12 mx-auto mb-4 text-indigo-600" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Organization Information</h2>
          <p className="text-gray-600">Tell us about your nonprofit organization</p>
        </div>
        
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="name">Organization Name *</Label>
              <Input id="name" value={formData.name} onChange={e => handleChange('name', e.target.value)} placeholder="Hope Foundation" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="ein">EIN (Tax ID) *</Label>
              <Input id="ein" value={formData.ein} onChange={e => handleChange('ein', e.target.value)} placeholder="XX-XXXXXXX" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="category">Category *</Label>
              <Select onValueChange={value => handleChange('category', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map(cat => (
                    <SelectItem key={cat} value={cat}>
                      {cat.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="website">Website</Label>
              <Input id="website" type="url" value={formData.website} onChange={e => handleChange('website', e.target.value)} placeholder="https://..." />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="description">Description *</Label>
            <Textarea id="description" value={formData.description} onChange={e => handleChange('description', e.target.value)} placeholder="What does your organization do?" rows={3} />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="mission_statement">Mission Statement</Label>
            <Textarea id="mission_statement" value={formData.mission_statement} onChange={e => handleChange('mission_statement', e.target.value)} placeholder="What is your organization's mission?" rows={3} />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="contact_email">Contact Email *</Label>
              <Input id="contact_email" type="email" value={formData.contact_email} onChange={e => handleChange('contact_email', e.target.value)} placeholder="info@organization.org" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="org_city">Organization City</Label>
              <Input id="org_city" value={formData.org_city} onChange={e => handleChange('org_city', e.target.value)} placeholder="San Francisco" />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="org_state">Organization State</Label>
            <Input id="org_state" value={formData.org_state} onChange={e => handleChange('org_state', e.target.value)} placeholder="CA" />
          </div>
        </div>
      </div>

      <div className="mt-8 text-center">
        <Button
          onClick={handleSubmit}
          disabled={loading || !isFormValid()}
          size="lg"
          className="bg-indigo-600 hover:bg-indigo-700"
        >
          <CheckCircle className="w-5 h-5 mr-2" />
          {loading ? "Creating Profile..." : "Create Nonprofit Profile"}
        </Button>
        {!isFormValid() && (
          <p className="text-sm text-gray-500 mt-2">Please fill in all required fields (*)</p>
        )}
      </div>
    </div>
  );
}
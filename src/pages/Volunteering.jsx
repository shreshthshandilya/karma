
import React, { useState, useEffect, useCallback } from "react";
import { Opportunity, Nonprofit } from "@/api/entities";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Users, MapPin, Clock, Calendar, AlertCircle } from "lucide-react";
import OpportunityCard from "../components/opportunities/OpportunityCard";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Slider } from "@/components/ui/slider"; // Added Slider import

const calculateDistance = (lat1, lon1, lat2, lon2) => {
  if (lat1 === null || lon1 === null || lat2 === null || lon2 === null || isNaN(lat1) || isNaN(lon1) || isNaN(lat2) || isNaN(lon2)) {
    return null;
  }
  const R = 3959; // Radius of the Earth in miles
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

export default function VolunteeringPage() {
  const [opportunities, setOpportunities] = useState([]);
  const [nonprofits, setNonprofits] = useState([]);
  const [filteredOpportunities, setFilteredOpportunities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [sortBy, setSortBy] = useState("newest");
  const [userLocation, setUserLocation] = useState(null);
  const [locationError, setLocationError] = useState(null);
  const [filterNearby, setFilterNearby] = useState(false);
  const [preferredCategories, setPreferredCategories] = useState(['education', 'environment', 'health']);
  const [maxDistance, setMaxDistance] = useState([50]); // New state for max distance, using array for Slider component

  useEffect(() => {
    loadData();
    
    // Better geolocation handling
    if (navigator.geolocation) {
      const options = {
        enableHighAccuracy: false,
        timeout: 10000,
        maximumAge: 300000
      };

      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
          setSortBy("distance");
          setFilterNearby(true);
          setLocationError(null);
        },
        (error) => {
          // Don't log expected errors - just handle gracefully
          let errorMessage = "Could not get your location. ";
          
          switch (error.code) {
            case error.PERMISSION_DENIED:
              errorMessage += "Location access was denied. You can still browse all opportunities.";
              break;
            case error.POSITION_UNAVAILABLE:
              errorMessage += "Location information is unavailable. You can still browse all opportunities.";
              break;
            case error.TIMEOUT:
              errorMessage += "Location request timed out. You can still browse all opportunities.";
              break;
            default:
              errorMessage += "An unknown error occurred while getting your location.";
              break;
          }
          
          setLocationError(errorMessage);
          setFilterNearby(false);
        },
        options
      );
    } else {
      setLocationError("Geolocation is not supported by your browser.");
      setFilterNearby(false);
    }
  }, []);

  const loadData = async () => {
    try {
      const [opportunitiesData, nonprofitsData] = await Promise.all([
        Opportunity.filter({ is_active: true }),
        Nonprofit.list()
      ]);
      
      setOpportunities(opportunitiesData);
      setNonprofits(nonprofitsData);
    } catch (error) {
      console.error("Error loading data:", error);
    } finally {
      setLoading(false);
    }
  };

  const filterAndSortOpportunities = useCallback(() => {
    let processedOpportunities = opportunities.map(opp => ({
        ...opp,
        distance: userLocation && opp.location?.latitude && opp.location?.longitude
                  ? calculateDistance(userLocation.latitude, userLocation.longitude, opp.location.latitude, opp.location.longitude)
                  : null,
        isPreferredCategory: preferredCategories.includes(opp.category)
    }));
      
    let filtered = [...processedOpportunities];

    if (searchQuery) {
      filtered = filtered.filter(opp =>
        opp.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        opp.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (selectedCategory !== "all") {
      filtered = filtered.filter(opp => opp.category === selectedCategory);
    }

    if (filterNearby && userLocation) {
      filtered = filtered.filter(opp => opp.distance !== null && opp.distance <= maxDistance[0]); // Using maxDistance
    }

    filtered.sort((a, b) => {
      if (sortBy === "recommended") {
        if (a.isPreferredCategory && !b.isPreferredCategory) return -1;
        if (!a.isPreferredCategory && b.isPreferredCategory) return 1;
        return new Date(b.created_date) - new Date(a.created_date);
      }

      switch (sortBy) {
        case "distance":
          if (!userLocation) {
            return new Date(b.created_date) - new Date(a.created_date);
          }
          if (a.distance === null && b.distance === null) return 0;
          if (a.distance === null) return 1;
          if (b.distance === null) return -1;
          return a.distance - b.distance;
        case "newest":
          return new Date(b.created_date) - new Date(a.created_date);
        case "oldest":
          return new Date(a.created_date) - new Date(b.created_date);
        case "deadline":
          if (!a.end_date && !b.end_date) return 0;
          if (!a.end_date) return 1;
          if (!b.end_date) return -1;
          return new Date(a.end_date) - new Date(b.end_date);
        case "spots":
          const aSpots = (a.volunteers_needed || 0) - (a.volunteers_signed_up || 0);
          const bSpots = (b.volunteers_needed || 0) - (b.volunteers_signed_up || 0);
          return bSpots - aSpots;
        default:
          return 0;
      }
    });

    setFilteredOpportunities(filtered);
  }, [opportunities, searchQuery, selectedCategory, sortBy, userLocation, filterNearby, preferredCategories, maxDistance]); // Added maxDistance to dependencies

  useEffect(() => {
    filterAndSortOpportunities();
  }, [filterAndSortOpportunities]);

  const getNonprofitName = (nonprofitId) => {
    const nonprofit = nonprofits.find(n => n.id === nonprofitId);
    return nonprofit?.name || "Unknown Organization";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <div className="p-4 md:p-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-4">
              Volunteer Opportunities
            </h1>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Find meaningful ways to contribute your time and skills to causes you care about
            </p>
          </div>
          
          {locationError && (
            <Alert className="mb-6 border-amber-200 bg-amber-50">
              <AlertCircle className="h-4 w-4 text-amber-600" />
              <AlertTitle className="text-amber-800">Location Not Available</AlertTitle>
              <AlertDescription className="text-amber-700">{locationError}</AlertDescription>
            </Alert>
          )}

          {/* Search and Filters */}
          <Card className="mb-8 bg-white/80 backdrop-blur-sm border-blue-100 shadow-xl">
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="md:col-span-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      placeholder="Search opportunities..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10 border-blue-200 focus:border-blue-500"
                    />
                  </div>
                </div>
                
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger className="border-blue-200 focus:border-blue-500">
                    <SelectValue placeholder="All Categories" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    <SelectItem value="education">Education</SelectItem>
                    <SelectItem value="environment">Environment</SelectItem>
                    <SelectItem value="health">Health</SelectItem>
                    <SelectItem value="poverty">Poverty</SelectItem>
                    <SelectItem value="animals">Animals</SelectItem>
                    <SelectItem value="arts_culture">Arts & Culture</SelectItem>
                    <SelectItem value="community_development">Community</SelectItem>
                    <SelectItem value="human_rights">Human Rights</SelectItem>
                    <SelectItem value="disaster_relief">Disaster Relief</SelectItem>
                    <SelectItem value="elderly_care">Elderly Care</SelectItem>
                    <SelectItem value="youth_development">Youth Development</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="border-blue-200 focus:border-blue-500">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="recommended">Recommended</SelectItem>
                    {userLocation && <SelectItem value="distance">Distance</SelectItem>}
                    <SelectItem value="newest">Newest</SelectItem>
                    <SelectItem value="oldest">Oldest</SelectItem>
                    <SelectItem value="deadline">Deadline</SelectItem>
                    <SelectItem value="spots">Most Spots Available</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {userLocation && (
                <div className="space-y-4 mt-4"> {/* Changed from flex to space-y for vertical stacking */}
                  <div className="flex items-center space-x-2">
                    <Switch 
                      id="nearby-filter" 
                      checked={filterNearby}
                      onCheckedChange={setFilterNearby}
                    />
                    <Label htmlFor="nearby-filter" className="text-sm font-medium text-gray-700">
                      Show nearby opportunities only
                    </Label>
                  </div>
                  
                  {filterNearby && (
                    <div className="space-y-3 p-4 bg-blue-50 rounded-lg">
                      <div className="flex justify-between items-center">
                        <Label className="text-sm font-medium text-gray-700">
                          Maximum Distance: {maxDistance[0]} miles
                        </Label>
                        <span className="text-xs text-gray-500">
                          {maxDistance[0] <= 25 ? '~30 min drive' : maxDistance[0] <= 50 ? '~1 hour drive' : '1+ hour drive'}
                        </span>
                      </div>
                      <Slider
                        value={maxDistance}
                        onValueChange={setMaxDistance}
                        max={100}
                        min={5}
                        step={5}
                        className="w-full"
                      />
                      <div className="flex justify-between text-xs text-gray-500">
                        <span>5 mi</span>
                        <span>100 mi</span>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Results */}
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="bg-blue-100 rounded-xl h-80"></div>
                </div>
              ))}
            </div>
          ) : (
            <>
              <div className="flex justify-between items-center mb-6">
                <p className="text-gray-600">
                  Found {filteredOpportunities.length} opportunit{filteredOpportunities.length !== 1 ? 'ies' : 'y'}
                  {!userLocation && sortBy === "distance" && " (sorted by newest since location is unavailable)"}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {filteredOpportunities.map((opportunity) => (
                  <OpportunityCard 
                    key={opportunity.id} 
                    opportunity={opportunity}
                    nonprofitName={getNonprofitName(opportunity.nonprofit_id)}
                    nonprofitId={opportunity.nonprofit_id}
                  />
                ))}
              </div>

              {filteredOpportunities.length === 0 && (
                <div className="text-center py-12">
                  <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No opportunities found</h3>
                  <p className="text-gray-600 mb-4">
                    Try adjusting your search criteria or browse all categories
                  </p>
                  <Button onClick={() => {
                    setSearchQuery("");
                    setSelectedCategory("all");
                    setFilterNearby(false);
                  }} className="bg-blue-600 hover:bg-blue-700">
                    Clear Filters
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

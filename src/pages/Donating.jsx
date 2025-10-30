
import React, { useState, useEffect, useCallback } from "react";
import { Nonprofit, Review, User } from "@/api/entities";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, MapPin, Heart, Building2, Filter, Star, LocateFixed, AlertCircle } from "lucide-react";
import NonprofitCard from "../components/nonprofits/NonprofitCard";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";

// Haversine formula to calculate distance
const calculateDistance = (lat1, lon1, lat2, lon2) => {
  if (!lat1 || !lon1 || !lat2 || !lon2) return null;
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

export default function DonatingPage() {
  const [nonprofits, setNonprofits] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [user, setUser] = useState(null); // Added user state
  const [filteredNonprofits, setFilteredNonprofits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [sortBy, setSortBy] = useState("name");
  const [userLocation, setUserLocation] = useState(null);
  const [locationError, setLocationError] = useState(null);
  // userPreferredCategories state is removed as it will be derived from user.preferred_categories

  const loadData = async () => {
    try {
      setLoading(true);
      const [nonprofitsData, reviewsData, userData] = await Promise.all([
        Nonprofit.list(),
        Review.list(),
        User.me().catch(() => null) // Fetch user data, gracefully handle if not logged in
      ]);
      setNonprofits(nonprofitsData);
      setReviews(reviewsData);
      setUser(userData); // Set user state
    } catch (error) {
      console.error("Error loading data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Try to get user location with better error handling
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
          setLocationError(null);
        },
        (error) => {
          // Don't log expected errors - just handle gracefully
          let errorMessage = "Could not get your location. ";
          
          switch (error.code) {
            case error.PERMISSION_DENIED:
              errorMessage += "Location access was denied. You can still browse all nonprofits.";
              break;
            case error.POSITION_UNAVAILABLE:
              errorMessage += "Location information is unavailable. You can still browse all nonprofits.";
              break;
            case error.TIMEOUT:
              errorMessage += "Location request timed out. You can still browse all nonprofits.";
              break;
            default:
              errorMessage += "An unknown error occurred while getting your location.";
              break;
          }
          
          setLocationError(errorMessage);
        },
        options
      );
    } else {
      setLocationError("Geolocation is not supported by your browser. You can still browse all nonprofits.");
    }

    loadData();
    // fetchUserPreferences(); // Removed, as user preferences are now derived from user state
  }, []);

  const handleFavoriteToggle = async (nonprofitId, isCurrentlyFavorited) => {
    if (!user) return; // Cannot favorite if not logged in or user data not loaded
    const currentFavorites = user.favorite_nonprofits || [];
    const updatedFavorites = isCurrentlyFavorited
      ? currentFavorites.filter(id => id !== nonprofitId)
      : [...currentFavorites, nonprofitId];
    
    try {
      await User.updateMyUserData({ favorite_nonprofits: updatedFavorites });
      setUser(prevUser => ({ ...prevUser, favorite_nonprofits: updatedFavorites }));
    } catch (error) {
      console.error("Error updating favorites:", error);
      // Optionally show a toast notification for the error
    }
  };

  const filterAndSortNonprofits = useCallback(() => {
    const userPreferredCategories = user?.preferred_categories || []; // Derived from user state

    let processedNonprofits = nonprofits.map(org => {
      const orgReviews = reviews.filter(r => r.nonprofit_id === org.id);
      const avgRating = orgReviews.length > 0
        ? orgReviews.reduce((sum, r) => sum + r.rating, 0) / orgReviews.length
        : 0;

      let relevance_score = 0;
      if (userPreferredCategories.includes(org.category)) {
        relevance_score += 100;
      }
      if (avgRating >= 4) {
        relevance_score += 20;
      }
      
      const isFavorited = user?.favorite_nonprofits?.includes(org.id) || false; // Check if favorited

      return {
        ...org,
        distance: userLocation && org.location?.latitude && org.location?.longitude
          ? calculateDistance(userLocation.latitude, userLocation.longitude, org.location?.latitude, org.location?.longitude)
          : null,
        reviews_count: orgReviews.length,
        avg_rating: avgRating,
        isFavorited: isFavorited, // Add isFavorited to the nonprofit object
        relevance_score: relevance_score
      };
    });

    let filtered = [...processedNonprofits];

    if (searchQuery) {
      filtered = filtered.filter(org =>
        org.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        org.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (selectedCategory !== "all") {
      filtered = filtered.filter(org => org.category === selectedCategory);
    }
    
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "distance":
          if (!userLocation) {
            return a.name.localeCompare(b.name);
          }
          if (a.distance === null) return 1;
          if (b.distance === null) return -1;
          return a.distance - b.distance;
        case "name":
          return a.name.localeCompare(b.name);
        case "donations":
          return (b.total_donations_received || 0) - (a.total_donations_received || 0);
        case "volunteers":
          return (b.volunteers_count || 0) - (a.volunteers_count || 0);
        case "rating":
          return b.avg_rating - a.avg_rating;
        case "newest":
          return new Date(b.created_date) - new Date(a.created_date);
        case "recommended":
          if (b.relevance_score !== a.relevance_score) {
            return b.relevance_score - a.relevance_score;
          }
          if (b.avg_rating !== a.avg_rating) {
            return b.avg_rating - a.avg_rating;
          }
          return a.name.localeCompare(b.name);
        default:
          return 0;
      }
    });

    setFilteredNonprofits(filtered);
  }, [nonprofits, reviews, searchQuery, selectedCategory, sortBy, userLocation, user]); // Added 'user' to dependencies

  useEffect(() => {
    filterAndSortNonprofits();
  }, [filterAndSortNonprofits]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <div className="p-4 md:p-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-4">
              Donate to Causes You Care About
            </h1>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Find amazing organizations making a difference and support them with your donations
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
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-center">
                <div className="lg:col-span-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      placeholder="Search nonprofits..."
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
                    {user?.id && ( // Show "Recommended" only if user is logged in
                      <SelectItem value="recommended">Recommended</SelectItem>
                    )}
                    {userLocation && <SelectItem value="distance">Distance</SelectItem>}
                    <SelectItem value="rating">Top Rated</SelectItem>
                    <SelectItem value="name">Name</SelectItem>
                    <SelectItem value="donations">Most Funded</SelectItem>
                    <SelectItem value="volunteers">Most Volunteers</SelectItem>
                    <SelectItem value="newest">Newest</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Results */}
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="bg-blue-100 rounded-xl h-64"></div>
                </div>
              ))}
            </div>
          ) : (
            <>
              <div className="flex justify-between items-center mb-6">
                <p className="text-gray-600">
                  Found {filteredNonprofits.length} organization{filteredNonprofits.length !== 1 ? 's' : ''}
                  {!userLocation && " (sorted alphabetically since location is unavailable)"}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredNonprofits.map((nonprofit) => (
                   <Link key={nonprofit.id} to={createPageUrl(`NonprofitDetails?id=${nonprofit.id}`)} className="group">
                    <NonprofitCard nonprofit={nonprofit} onFavoriteToggle={handleFavoriteToggle} />
                  </Link>
                ))}
              </div>

              {filteredNonprofits.length === 0 && (
                <div className="text-center py-12">
                  <Building2 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No organizations found</h3>
                  <p className="text-gray-600 mb-4">
                    Try adjusting your search criteria or browse all categories
                  </p>
                  <Button onClick={() => {
                    setSearchQuery("");
                    setSelectedCategory("all");
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

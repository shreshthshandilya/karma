
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Building2, ExternalLink, MapPin, Globe, Loader2, Star, Share2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

export default function NonprofitsDirectoryPage() {
  const [nonprofits, setNonprofits] = useState([]);
  const [filteredNonprofits, setFilteredNonprofits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [distanceFilter, setDistanceFilter] = useState("any"); // "any", "national", "local"
  // userLocation now includes latitude and longitude, but also city/country for existing filters
  const [userLocation, setUserLocation] = useState({ city: "New York", state: "NY", country: "USA", latitude: null, longitude: null });
  const [locationError, setLocationError] = useState(null);

  const [showVolunteerModal, setShowVolunteerModal] = useState(false);
  const [selectedNonprofitForVolunteer, setSelectedNonprofitForVolunteer] = useState(null);

  useEffect(() => {
    // Get user's actual location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          // In a real application, reverse geocoding API would be used here (e.g., Google Maps Geocoding API)
          // to get actual city/country from lat/lon. For this demo, we simulate it.
          setUserLocation(prev => ({
            ...prev,
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            city: "Your Detected City", // Simulated city name
            country: "Your Detected Country", // Simulated country name
          }));
          setLocationError(null);
        },
        (error) => {
          console.error("Geolocation error:", error);
          let errorMessage = "Could not get your location. Displaying global results.";
          if (error.code === error.PERMISSION_DENIED) {
            errorMessage = "Location access denied. Please enable it in browser settings for local results.";
          }
          setLocationError(errorMessage);
          // Set userLocation to a 'global' or 'unknown' state if geolocation fails
          setUserLocation(prev => ({ ...prev, city: "Global", country: "Global", latitude: null, longitude: null }));
        }
      );
    } else {
      setLocationError("Geolocation is not supported by your browser. Displaying global results.");
      setUserLocation(prev => ({ ...prev, city: "Global", country: "Global", latitude: null, longitude: null }));
    }

    loadPublicNonprofits();
  }, []);

  const loadPublicNonprofits = async () => {
    setLoading(true);
    // Using a curated, reliable list of fallback data instead of LLM
    const fallbackData = [
      {
        name: "American Red Cross",
        category: "disaster_relief",
        description: "The American Red Cross prevents and alleviates human suffering in the face of emergencies by mobilizing volunteers and donors.",
        mission_statement: "To prevent and alleviate human suffering wherever it may be found.",
        website: "https://www.redcross.org",
        rating: 4.2,
        reviews_count: 847,
        location: { city: "Washington", state: "DC", country: "USA" },
        volunteer_opportunities: [
          { title: "Disaster Responder", description: "Help provide aid and support to communities affected by disasters.", skills_required: ["First Aid", "Communication"], time_commitment: "On-call" },
          { title: "Blood Donor Ambassador", description: "Assist staff at blood drives to ensure a positive donor experience.", skills_required: ["Customer Service", "Organization"], time_commitment: "Flexible hours" }
        ]
      },
      {
        name: "Doctors Without Borders",
        category: "health",
        description: "International medical humanitarian organization providing aid in conflict zones, disasters, and underserved communities worldwide.",
        mission_statement: "To provide medical assistance to populations in distress regardless of race, politics, religion or gender.",
        website: "https://www.doctorswithoutborders.org",
        rating: 4.7,
        reviews_count: 623,
        location: { city: "New York", state: "NY", country: "USA" },
        volunteer_opportunities: [
          { title: "Administrative Support", description: "Assist with office tasks and data entry.", skills_required: ["Data Entry", "Microsoft Office"], time_commitment: "Weekly" },
          { title: "Fundraising Event Volunteer", description: "Help organize and run fundraising events.", skills_required: ["Event Planning", "Communication"], time_commitment: "One-time event" }
        ]
      },
      {
        name: "UNICEF",
        category: "youth_development",
        description: "Works for the rights of every child, everywhere, especially the most disadvantaged. Provides humanitarian and developmental aid worldwide.",
        mission_statement: "To advocate for the protection of children's rights, to help meet their basic needs and to expand their opportunities to reach their full potential.",
        website: "https://www.unicef.org",
        rating: 4.5,
        reviews_count: 1100,
        location: { city: "New York", state: "NY", country: "USA" },
        volunteer_opportunities: [
          { title: "Advocacy Campaigner", description: "Participate in campaigns to raise awareness for children's rights.", skills_required: ["Public Speaking", "Persuasion"], time_commitment: "Flexible hours" },
          { title: "Social Media Assistant", description: "Help manage social media content and engagement.", skills_required: ["Social Media Management", "Content Creation"], time_commitment: "Weekly" }
        ]
      },
      {
        name: "World Wildlife Fund (WWF)",
        category: "environment",
        description: "Dedicated to conserving nature and reducing the most pressing threats to the diversity of life on Earth.",
        mission_statement: "To conserve nature and reduce the most pressing threats to the diversity of life on Earth.",
        website: "https://www.worldwildlife.org",
        rating: 4.8,
        reviews_count: 950,
        location: { city: "Washington", state: "DC", country: "USA" },
        volunteer_opportunities: [
          { title: "Conservation Supporter", description: "Help with local conservation efforts and community outreach.", skills_required: ["Environmental Knowledge", "Community Engagement"], time_commitment: "Weekends" }
        ]
      },
      {
        name: "Habitat for Humanity",
        category: "community_development",
        description: "A nonprofit organization that helps families build and improve homes. It aims to eliminate poverty housing and homelessness worldwide.",
        mission_statement: "Seeking to put God's love into action, Habitat for Humanity brings people together to build homes, communities and hope.",
        website: "https://www.habitat.org",
        rating: 4.6,
        reviews_count: 780,
        location: { city: "Americus", state: "GA", country: "USA" },
        volunteer_opportunities: [
          { title: "Construction Volunteer", description: "Help build and repair homes on construction sites.", skills_required: ["Basic Construction", "Teamwork"], time_commitment: "Weekends" },
          { title: "ReStore Assistant", description: "Help organize and sell donated goods at ReStore locations.", skills_required: ["Retail", "Customer Service"], time_commitment: "Flexible hours" }
        ]
      },
      {
        name: "Oxfam International",
        category: "poverty",
        description: "A global organization working to end the injustice of poverty.",
        mission_statement: "To create a just world without poverty.",
        website: "https://www.oxfam.org",
        rating: 4.3,
        reviews_count: 680,
        location: { city: "Oxford", state: "", country: "UK" },
        volunteer_opportunities: [
          { title: "Campaign Organizer", description: "Support campaigns for fair trade and poverty eradication.", skills_required: ["Advocacy", "Research"], time_commitment: "Weekly" }
        ]
      },
      {
        name: "United Way",
        category: "community_development",
        description: "A network of local organizations working to advance the common good by focusing on education, income and health.",
        mission_statement: "To improve lives by mobilizing the caring power of communities around the world to advance the common good.",
        website: "https://www.unitedway.org",
        rating: 4.1,
        reviews_count: 892,
        location: { city: "Alexandria", state: "VA", country: "USA" },
        volunteer_opportunities: [
          { title: "Community Coordinator", description: "Help coordinate local volunteer activities and community programs.", skills_required: ["Organization", "Communication"], time_commitment: "Monthly" },
          { title: "Fundraising Volunteer", description: "Assist with fundraising events and donor outreach.", skills_required: ["Sales", "Networking"], time_commitment: "Flexible hours" }
        ]
      },
      {
        name: "Save the Children",
        category: "youth_development",
        description: "An international non-governmental organization that promotes children's rights, provides relief and helps support children in developing countries.",
        mission_statement: "To inspire breakthroughs in the way the world treats children and to achieve immediate and lasting change in their lives.",
        website: "https://www.savethechildren.org",
        rating: 4.4,
        reviews_count: 756,
        location: { city: "Fairfield", state: "CT", country: "USA" },
        volunteer_opportunities: [
          { title: "Education Advocate", description: "Support educational programs and literacy initiatives.", skills_required: ["Education", "Mentoring"], time_commitment: "Weekly" },
          { title: "Event Volunteer", description: "Help with fundraising events and awareness campaigns.", skills_required: ["Event Planning", "Customer Service"], time_commitment: "One-time event" }
        ]
      },
      {
        name: "Greenpeace",
        category: "environment",
        description: "A non-governmental environmental organization with offices in over 55 countries that campaigns to protect the environment.",
        mission_statement: "To ensure the ability of Earth to nurture life in all its diversity.",
        website: "https://www.greenpeace.org",
        rating: 4.0,
        reviews_count: 634,
        location: { city: "Amsterdam", state: "", country: "Netherlands" },
        volunteer_opportunities: [
          { title: "Campaign Activist", description: "Participate in environmental campaigns and awareness events.", skills_required: ["Activism", "Public Speaking"], time_commitment: "Flexible hours" },
          { title: "Research Assistant", description: "Help with environmental research and data collection.", skills_required: ["Research", "Data Analysis"], time_commitment: "Weekly" }
        ]
      },
      {
        name: "Amnesty International",
        category: "human_rights",
        description: "A non-governmental organization focused on human rights, with its headquarters in the United Kingdom.",
        mission_statement: "To undertake research and action focused on preventing and ending grave abuses of human rights.",
        website: "https://www.amnesty.org",
        rating: 4.3,
        reviews_count: 567,
        location: { city: "London", state: "", country: "UK" },
        volunteer_opportunities: [
          { title: "Human Rights Researcher", description: "Conduct research on human rights violations and advocacy.", skills_required: ["Research", "Writing"], time_commitment: "Monthly" },
          { title: "Campaign Organizer", description: "Help organize campaigns for human rights awareness.", skills_required: ["Organization", "Leadership"], time_commitment: "Flexible hours" }
        ]
      },
      {
        name: "Feeding America",
        category: "poverty",
        description: "The largest hunger-relief organization in the United States, with a network of food banks and food pantries.",
        mission_statement: "To feed America's hungry through a nationwide network of member food banks.",
        website: "https://www.feedingamerica.org",
        rating: 4.5,
        reviews_count: 923,
        location: { city: "Chicago", state: "IL", country: "USA" },
        volunteer_opportunities: [
          { title: "Food Sorter", description: "Help sort and package food donations at local food banks.", skills_required: ["Physical Work", "Teamwork"], time_commitment: "Weekly" },
          { title: "Distribution Volunteer", description: "Assist with food distribution to families in need.", skills_required: ["Customer Service", "Organization"], time_commitment: "Flexible hours" }
        ]
      },
      {
        name: "The Salvation Army",
        category: "community_development",
        description: "An international movement and evangelical part of the universal Christian Church providing social services.",
        mission_statement: "To preach the gospel of Jesus Christ and to meet human needs in His name without discrimination.",
        website: "https://www.salvationarmy.org",
        rating: 4.2,
        reviews_count: 1045,
        location: { city: "London", state: "", country: "UK" },
        volunteer_opportunities: [
          { title: "Soup Kitchen Helper", description: "Help serve meals at local soup kitchens and shelters.", skills_required: ["Food Service", "Compassion"], time_commitment: "Weekly" },
          { title: "Thrift Store Assistant", description: "Sort donations and help customers at thrift stores.", skills_required: ["Retail", "Customer Service"], time_commitment: "Flexible hours" }
        ]
      },
      {
        name: "Make-A-Wish Foundation",
        category: "health",
        description: "Grants the wishes of children with critical illnesses between the ages of 2 and 18 years old.",
        mission_statement: "To create life-changing wishes for children with critical illnesses.",
        website: "https://www.make-a-wish.org",
        rating: 4.7,
        reviews_count: 689,
        location: { city: "Phoenix", state: "AZ", country: "USA" },
        volunteer_opportunities: [
          { title: "Wish Granter", description: "Help fulfill wishes for children with critical illnesses.", skills_required: ["Empathy", "Event Planning"], time_commitment: "Monthly" },
          { title: "Fundraising Volunteer", description: "Support fundraising events and donor relations.", skills_required: ["Communication", "Sales"], time_commitment: "Flexible hours" }
        ]
      },
      {
        name: "Big Brothers Big Sisters",
        category: "youth_development",
        description: "A mentoring program made up of affiliated local agencies in the United States and Canada.",
        mission_statement: "To create and support one-to-one mentoring relationships that ignite the power and promise of youth.",
        website: "https://www.bbbs.org",
        rating: 4.6,
        reviews_count: 578,
        location: { city: "Tampa", state: "FL", country: "USA" },
        volunteer_opportunities: [
          { title: "Youth Mentor", description: "Become a Big Brother or Big Sister to mentor a child.", skills_required: ["Mentoring", "Patience"], time_commitment: "Weekly" },
          { title: "Program Assistant", description: "Help coordinate mentoring activities and events.", skills_required: ["Organization", "Communication"], time_commitment: "Monthly" }
        ]
      },
      {
        name: "Goodwill Industries",
        category: "community_development",
        description: "A nonprofit organization that provides job training, employment placement services, and other community-based programs.",
        mission_statement: "To enhance the dignity and quality of life of individuals and families by strengthening communities.",
        website: "https://www.goodwill.org",
        rating: 4.1,
        reviews_count: 1234,
        location: { city: "Rockville", state: "MD", country: "USA" },
        volunteer_opportunities: [
          { title: "Job Training Assistant", description: "Help with job training programs and skill development.", skills_required: ["Teaching", "Patience"], time_commitment: "Weekly" },
          { title: "Store Volunteer", description: "Assist customers and organize merchandise in retail stores.", skills_required: ["Retail", "Customer Service"], time_commitment: "Flexible hours" }
        ]
      },
      {
        name: "American Cancer Society",
        category: "health",
        description: "A nationwide voluntary health organization dedicated to eliminating cancer as a major health problem.",
        mission_statement: "To eliminate cancer as a major health problem by preventing cancer, saving lives, and diminishing suffering from cancer.",
        website: "https://www.cancer.org",
        rating: 4.4,
        reviews_count: 867,
        location: { city: "Atlanta", state: "GA", country: "USA" },
        volunteer_opportunities: [
          { title: "Patient Navigator", description: "Provide support and guidance to cancer patients and families.", skills_required: ["Empathy", "Communication"], time_commitment: "Monthly" },
          { title: "Relay for Life Organizer", description: "Help organize fundraising events like Relay for Life.", skills_required: ["Event Planning", "Leadership"], time_commitment: "Seasonal" }
        ]
      },
      {
        name: "Rotary International",
        category: "community_development",
        description: "An international service organization whose stated purpose is to bring together business and professional leaders.",
        mission_statement: "To provide service to others, promote integrity, and advance world understanding, goodwill, and peace.",
        website: "https://www.rotary.org",
        rating: 4.3,
        reviews_count: 445,
        location: { city: "Evanston", state: "IL", country: "USA" },
        volunteer_opportunities: [
          { title: "Community Service Leader", description: "Lead local community service projects and initiatives.", skills_required: ["Leadership", "Project Management"], time_commitment: "Monthly" },
          { title: "International Projects Volunteer", description: "Support international humanitarian projects.", skills_required: ["Cross-cultural Communication", "Organization"], time_commitment: "Flexible hours" }
        ]
      },
      {
        name: "Humane Society",
        category: "animals",
        description: "The nation's most effective animal protection organization working to reduce suffering of all animals.",
        mission_statement: "To create a humane and sustainable world for all animals.",
        website: "https://www.humanesociety.org",
        rating: 4.5,
        reviews_count: 723,
        location: { city: "Washington", state: "DC", country: "USA" },
        volunteer_opportunities: [
          { title: "Animal Care Volunteer", description: "Help care for animals at shelters and rescue centers.", skills_required: ["Animal Care", "Compassion"], time_commitment: "Weekly" },
          { title: "Adoption Counselor", description: "Help match families with the right pets for adoption.", skills_required: ["Communication", "Animal Knowledge"], time_commitment: "Weekends" }
        ]
      },
      {
        name: "Boys & Girls Clubs of America",
        category: "youth_development",
        description: "A national organization of local chapters which provide after-school programs for young people.",
        mission_statement: "To enable all young people, especially those who need us most, to reach their full potential as productive, caring, responsible citizens.",
        website: "https://www.bgca.org",
        rating: 4.4,
        reviews_count: 612,
        location: { city: "Atlanta", state: "GA", country: "USA" },
        volunteer_opportunities: [
          { title: "Youth Mentor", description: "Mentor young people in after-school programs.", skills_required: ["Mentoring", "Youth Development"], time_commitment: "Weekly" },
          { title: "Program Assistant", description: "Help with educational and recreational activities.", skills_required: ["Teaching", "Recreation"], time_commitment: "Flexible hours" }
        ]
      },
      {
        name: "St. Jude Children's Research Hospital",
        category: "health",
        description: "A pediatric treatment and research facility focused on children's catastrophic diseases, particularly leukemia and other cancers.",
        mission_statement: "To advance cures, and means of prevention, for pediatric catastrophic diseases through research and treatment.",
        website: "https://www.stjude.org",
        rating: 4.8,
        reviews_count: 543,
        location: { city: "Memphis", state: "TN", country: "USA" },
        volunteer_opportunities: [
          { title: "Family Support Volunteer", description: "Provide emotional support to families of patients.", skills_required: ["Empathy", "Communication"], time_commitment: "Monthly" },
          { title: "Fundraising Event Helper", description: "Assist with fundraising events and awareness campaigns.", skills_required: ["Event Planning", "Customer Service"], time_commitment: "Seasonal" }
        ]
      },
      {
        name: "Teach for America",
        category: "education",
        description: "A nonprofit organization that recruits college graduates and professionals to teach for two years in high-need schools.",
        mission_statement: "To enlist, develop, and mobilize as many as possible of our nation's most promising future leaders to grow and strengthen the movement for educational equity and justice.",
        website: "https://www.teachforamerica.org",
        rating: 4.2,
        reviews_count: 789,
        location: { city: "New York", state: "NY", country: "USA" },
        volunteer_opportunities: [
          { title: "Reading Tutor", description: "Help students improve their reading and literacy skills.", skills_required: ["Education", "Patience"], time_commitment: "Weekly" },
          { title: "Mentorship Coordinator", description: "Support teachers and coordinate mentorship programs.", skills_required: ["Leadership", "Organization"], time_commitment: "Monthly" }
        ]
      },
      {
        name: "Wounded Warrior Project",
        category: "community_development",
        description: "A charity and veterans service organization that offers a variety of programs, services and events for wounded veterans.",
        mission_statement: "To honor and empower wounded warriors by connecting, serving, and empowering wounded warriors.",
        website: "https://www.woundedwarriorproject.org",
        rating: 4.1,
        reviews_count: 467,
        location: { city: "Jacksonville", state: "FL", country: "USA" },
        volunteer_opportunities: [
          { title: "Veteran Support Volunteer", description: "Provide support and companionship to wounded veterans.", skills_required: ["Empathy", "Communication"], time_commitment: "Monthly" },
          { title: "Event Coordinator", description: "Help organize events and activities for veterans.", skills_required: ["Event Planning", "Organization"], time_commitment: "Flexible hours" }
        ]
      },
      {
        name: "Special Olympics",
        category: "community_development",
        description: "The world's largest sports organization for people with intellectual disabilities, providing year-round training and competition.",
        mission_statement: "To provide sports training and athletic competition in a variety of Olympic-type sports for children and adults with intellectual disabilities.",
        website: "https://www.specialolympics.org",
        rating: 4.6,
        reviews_count: 598,
        location: { city: "Washington", state: "DC", country: "USA" },
        volunteer_opportunities: [
          { title: "Sports Coach", description: "Coach athletes with intellectual disabilities in various sports.", skills_required: ["Sports Knowledge", "Patience"], time_commitment: "Weekly" },
          { title: "Event Volunteer", description: "Help with Special Olympics competitions and events.", skills_required: ["Organization", "Teamwork"], time_commitment: "Seasonal" }
        ]
      },
      {
        name: "Meals on Wheels",
        category: "elderly_care",
        description: "A program that delivers meals to individuals at home who are unable to purchase or prepare their own meals.",
        mission_statement: "To address social isolation and hunger in America by empowering communities to keep older adults fed and connected.",
        website: "https://www.mealsonwheelsamerica.org",
        rating: 4.7,
        reviews_count: 834,
        location: { city: "Arlington", state: "VA", country: "USA" },
        volunteer_opportunities: [
          { title: "Meal Delivery Volunteer", description: "Deliver nutritious meals to homebound seniors.", skills_required: ["Driving", "Compassion"], time_commitment: "Weekly" },
          { title: "Kitchen Assistant", description: "Help prepare meals in community kitchens.", skills_required: ["Food Preparation", "Teamwork"], time_commitment: "Flexible hours" }
        ]
      },
      {
        name: "Ronald McDonald House Charities",
        category: "health",
        description: "A nonprofit organization whose mission is to create, find and support programs that directly improve the health and well-being of children.",
        mission_statement: "To create, find and support programs that directly improve the health and well-being of children and families.",
        website: "https://www.rmhc.org",
        rating: 4.5,
        reviews_count: 456,
        location: { city: "Oak Brook", state: "IL", country: "USA" },
        volunteer_opportunities: [
          { title: "House Volunteer", description: "Provide support to families staying at Ronald McDonald Houses.", skills_required: ["Hospitality", "Empathy"], time_commitment: "Monthly" },
          { title: "Meal Coordinator", description: "Help coordinate and serve meals to families.", skills_required: ["Cooking", "Organization"], time_commitment: "Weekly" }
        ]
      }
    ];
    setNonprofits(fallbackData);
    setFilteredNonprofits(fallbackData);
    setLoading(false);
  };

  useEffect(() => {
    let filtered = [...nonprofits];

    if (searchQuery) {
      filtered = filtered.filter(org =>
        org.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        org.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        org.mission_statement.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (selectedCategory !== "all") {
      filtered = filtered.filter(org => org.category === selectedCategory);
    }

    // Apply distance filtering based on the 'simulated' city/country in userLocation
    // A more advanced implementation would use actual lat/lon and a distance calculation function.
    if (distanceFilter !== "any" && userLocation && userLocation.city && userLocation.country) {
      if (distanceFilter === "local") {
        filtered = filtered.filter(org =>
          org.location && org.location.city &&
          org.location.city.toLowerCase() === userLocation.city.toLowerCase() &&
          org.location.country.toLowerCase() === userLocation.country.toLowerCase()
        );
      } else if (distanceFilter === "national") {
        filtered = filtered.filter(org =>
          org.location && org.location.country &&
          org.location.country.toLowerCase() === userLocation.country.toLowerCase()
        );
      }
    }

    // Sort by category, then by name, then by rating (descending)
    filtered.sort((a, b) => {
      if (a.category !== b.category) {
        return a.category.localeCompare(b.category);
      }
      if (a.name !== b.name) {
        return a.name.localeCompare(b.name);
      }
      // Then sort by rating (descending)
      return (b.rating || 0) - (a.rating || 0);
    });

    setFilteredNonprofits(filtered);
  }, [nonprofits, searchQuery, selectedCategory, distanceFilter, userLocation]);

  const categoryColors = {
    education: "bg-blue-100 text-blue-800 border-blue-200",
    environment: "bg-green-100 text-green-800 border-green-200",
    health: "bg-red-100 text-red-800 border-red-200",
    poverty: "bg-yellow-100 text-yellow-800 border-yellow-200",
    animals: "bg-purple-100 text-purple-800 border-purple-200",
    arts_culture: "bg-pink-100 text-pink-800 border-pink-200",
    community_development: "bg-indigo-100 text-indigo-800 border-indigo-200",
    human_rights: "bg-orange-100 text-orange-800 border-orange-200",
    disaster_relief: "bg-red-100 text-red-800 border-red-200",
    elderly_care: "bg-cyan-100 text-cyan-800 border-cyan-200",
    youth_development: "bg-lime-100 text-lime-800 border-lime-200",
    other: "bg-gray-100 text-gray-800 border-gray-200"
  };

  // Group nonprofits by category for better organization
  const nonprofitsByCategory = selectedCategory === "all" ? filteredNonprofits.reduce((acc, org) => {
    if (!acc[org.category]) {
      acc[org.category] = [];
    }
    acc[org.category].push(org);
    return acc;
  }, {}) : {};

  const handleVolunteerClick = (nonprofit) => {
    setSelectedNonprofitForVolunteer(nonprofit);
    setShowVolunteerModal(true);
  };

  const handleSignUpForOpportunity = (opportunityTitle) => {
    // In a real application, this would typically involve a form submission,
    // API call, or more complex state management.
    console.log(`Signed up for opportunity: "${opportunityTitle}" at "${selectedNonprofitForVolunteer.name}"`);
    alert(`You've successfully expressed interest in "${opportunityTitle}" at ${selectedNonprofitForVolunteer.name}! An email has been sent with next steps.`);
    setShowVolunteerModal(false);
  };

  const handleShare = async (nonprofit) => {
    const shareData = {
      title: nonprofit.name,
      text: nonprofit.description,
      url: nonprofit.website || window.location.href, // Fallback to current page if no website
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
        console.log('Nonprofit shared successfully');
      } else {
        // Fallback for browsers that don't support Web Share API
        const urlToShare = nonprofit.website || window.location.href;
        alert(`Share this nonprofit:\n${nonprofit.name}\n${urlToShare}`);
        // Optionally, use a prompt or copy to clipboard for better UX
        // prompt(`Share this nonprofit: ${nonprofit.name}`, urlToShare);
        // navigator.clipboard.writeText(urlToShare);
      }
    } catch (err) {
      console.error('Error sharing:', err);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <div className="p-4 md:p-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-4">
              Nonprofits & Organizations Directory
            </h1>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Discover established nonprofits and charitable organizations from around the world.
              {locationError ? (
                <span className="block mt-1 font-semibold text-red-600">{locationError}</span>
              ) : userLocation.latitude && userLocation.longitude ? (
                <span className="block mt-1 font-semibold text-blue-600">
                  Showing results relevant to {userLocation.city}, {userLocation.country}.
                </span>
              ) : (
                <span className="block mt-1 font-semibold text-gray-500">
                  Determining your location...
                </span>
              )}
            </p>
          </div>

          {/* Search and Filters */}
          <Card className="mb-8 bg-white/80 backdrop-blur-sm border-blue-100 shadow-xl">
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Search organizations..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 border-blue-200 focus:border-blue-500"
                  />
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

                {/* New Distance Filter */}
                <Select value={distanceFilter} onValueChange={setDistanceFilter}>
                  <SelectTrigger className="border-blue-200 focus:border-blue-500">
                    <SelectValue placeholder="Distance" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="any">Any Distance</SelectItem>
                    <SelectItem value="national">National (Same Country)</SelectItem>
                    <SelectItem value="local">Local (Same City)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Results */}
          {loading ? (
            <div className="space-y-8">
              <div className="animate-pulse">
                <div className="h-6 bg-blue-200 rounded w-1/4 mb-4"></div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[...Array(6)].map((_, i) => (
                    <div key={i} className="h-64 bg-blue-100 rounded-xl"></div>
                  ))}
                </div>
              </div>
              <div className="animate-pulse">
                <div className="h-6 bg-green-200 rounded w-1/4 mb-4"></div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="h-64 bg-green-100 rounded-xl"></div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <>
              <div className="flex justify-between items-center mb-6">
                <p className="text-gray-600">
                  Found {filteredNonprofits.length} organization{filteredNonprofits.length !== 1 ? 's' : ''} {selectedCategory === "all" ? "(sorted by category and rating)" : "(sorted by rating)"}
                </p>
              </div>

              {selectedCategory === "all" ? (
                // Show grouped by category only if "All Categories" is selected
                Object.keys(nonprofitsByCategory).sort().map((category) => (
                  <div key={category} className="mb-8">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                      <Badge className={`${categoryColors[category]} text-lg px-3 py-1`}>
                        {category.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      </Badge>
                      <span className="text-gray-500 text-base">({nonprofitsByCategory[category].length})</span>
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {nonprofitsByCategory[category].map((nonprofit, index) => (
                        <Card key={index} className="bg-white/80 backdrop-blur-sm border-blue-100 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02]">
                          <CardHeader className="pb-3">
                            <div className="flex justify-between items-start">
                              <div className="flex-1 min-w-0">
                                <h3 className="font-bold text-lg text-gray-900 mb-2 line-clamp-1">
                                  {nonprofit.name}
                                </h3>
                                <div className="flex items-center gap-2 mb-2">
                                  <Badge className={`${categoryColors[nonprofit.category]} border text-xs font-medium`}>
                                    {nonprofit.category?.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                                  </Badge>
                                  {nonprofit.rating && (
                                    <div className="flex items-center gap-1 text-yellow-500">
                                      <Star className="w-3 h-3 fill-current" />
                                      <span className="text-xs font-bold text-gray-800">{nonprofit.rating.toFixed(1)}</span>
                                      <span className="text-xs text-gray-500">({nonprofit.reviews_count || 0})</span>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          </CardHeader>
                          <CardContent className="space-y-4">
                            <p className="text-gray-600 text-sm line-clamp-3 leading-relaxed">
                              {nonprofit.description}
                            </p>
                            <div className="space-y-2">
                              {nonprofit.location && (
                                <div className="flex items-center gap-2 text-sm text-gray-500">
                                  <MapPin className="w-3 h-3" />
                                  {nonprofit.location.city}{nonprofit.location.state ? `, ${nonprofit.location.state}` : ''}, {nonprofit.location.country}
                                </div>
                              )}
                            </div>
                            <div className="pt-2 flex flex-wrap gap-2">
                              {nonprofit.website && (
                                <Button
                                  onClick={() => window.open(nonprofit.website, '_blank')}
                                  className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white border-none shadow-md hover:shadow-lg transition-all duration-300"
                                >
                                  <Globe className="w-4 h-4 mr-2" />
                                  Website
                                  <ExternalLink className="w-3 h-3 ml-2" />
                                </Button>
                              )}
                              {nonprofit.volunteer_opportunities && nonprofit.volunteer_opportunities.length > 0 && (
                                <Button
                                  onClick={() => handleVolunteerClick(nonprofit)}
                                  variant="outline"
                                  className="flex-1 border-green-400 text-green-700 hover:bg-green-50 shadow-md hover:shadow-lg transition-all duration-300"
                                >
                                  Volunteer Now
                                </Button>
                              )}
                              <Button
                                onClick={() => handleShare(nonprofit)}
                                variant="outline"
                                className="flex-1 border-gray-300 text-gray-700 hover:bg-gray-50 shadow-md hover:shadow-lg transition-all duration-300"
                              >
                                <Share2 className="w-4 h-4 mr-2" />
                                Share
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                ))
              ) : (
                // Show flat list when a specific category is selected
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredNonprofits.map((nonprofit, index) => (
                    <Card key={index} className="bg-white/80 backdrop-blur-sm border-blue-100 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02]">
                      <CardHeader className="pb-3">
                        <div className="flex justify-between items-start">
                          <div className="flex-1 min-w-0">
                            <h3 className="font-bold text-lg text-gray-900 mb-2 line-clamp-1">
                              {nonprofit.name}
                            </h3>
                            <div className="flex items-center gap-2 mb-2">
                              <Badge className={`${categoryColors[nonprofit.category]} border text-xs font-medium`}>
                                {nonprofit.category?.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                              </Badge>
                              {nonprofit.rating && (
                                <div className="flex items-center gap-1 text-yellow-500">
                                  <Star className="w-3 h-3 fill-current" />
                                  <span className="text-xs font-bold text-gray-800">{nonprofit.rating.toFixed(1)}</span>
                                  <span className="text-xs text-gray-500">({nonprofit.reviews_count || 0})</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <p className="text-gray-600 text-sm line-clamp-3 leading-relaxed">
                          {nonprofit.description}
                        </p>
                        <div className="space-y-2">
                          {nonprofit.location && (
                            <div className="flex items-center gap-2 text-sm text-gray-500">
                              <MapPin className="w-3 h-3" />
                              {nonprofit.location.city}{nonprofit.location.state ? `, ${nonprofit.location.state}` : ''}, {nonprofit.location.country}
                            </div>
                          )}
                        </div>
                        <div className="pt-2 flex flex-wrap gap-2">
                          {nonprofit.website && (
                            <Button
                              onClick={() => window.open(nonprofit.website, '_blank')}
                              className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white border-none shadow-md hover:shadow-lg transition-all duration-300"
                            >
                              <Globe className="w-4 h-4 mr-2" />
                              Website
                              <ExternalLink className="w-3 h-3 ml-2" />
                            </Button>
                          )}
                          {nonprofit.volunteer_opportunities && nonprofit.volunteer_opportunities.length > 0 && (
                            <Button
                              onClick={() => handleVolunteerClick(nonprofit)}
                              variant="outline"
                              className="flex-1 border-green-400 text-green-700 hover:bg-green-50 shadow-md hover:shadow-lg transition-all duration-300"
                            >
                              Volunteer Now
                            </Button>
                          )}
                          <Button
                            onClick={() => handleShare(nonprofit)}
                            variant="outline"
                            className="flex-1 border-gray-300 text-gray-700 hover:bg-gray-50 shadow-md hover:shadow-lg transition-all duration-300"
                          >
                            <Share2 className="w-4 h-4 mr-2" />
                            Share
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}

              {filteredNonprofits.length === 0 && !loading && (
                <div className="text-center py-12">
                  <Building2 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No organizations found</h3>
                  <p className="text-gray-600 mb-4">
                    Try adjusting your search criteria or browse all categories
                  </p>
                  <Button onClick={() => {
                    setSearchQuery("");
                    setSelectedCategory("all");
                    setDistanceFilter("any");
                  }} className="bg-blue-600 hover:bg-blue-700">
                    Clear Filters
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Volunteer Opportunities Modal */}
      <Dialog open={showVolunteerModal} onOpenChange={setShowVolunteerModal}>
        <DialogContent className="sm:max-w-[600px] p-6">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold mb-1">Volunteer with {selectedNonprofitForVolunteer?.name}</DialogTitle>
            <DialogDescription className="text-gray-600">
              Explore available volunteer opportunities.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-4 max-h-[70vh] overflow-y-auto">
            {selectedNonprofitForVolunteer?.volunteer_opportunities?.length > 0 ? (
              selectedNonprofitForVolunteer.volunteer_opportunities.map((opportunity, idx) => (
                <Card key={idx} className="border border-gray-200 shadow-sm p-4">
                  <h4 className="font-semibold text-lg text-gray-900 mb-1">{opportunity.title}</h4>
                  <p className="text-sm text-gray-700 mb-2">{opportunity.description}</p>
                  <div className="flex flex-wrap items-center gap-2 text-sm text-gray-500 mb-2">
                    {opportunity.skills_required.length > 0 && (
                      <span className="font-medium">Skills:</span>
                    )}
                    {opportunity.skills_required.map((skill, sIdx) => (
                      <Badge key={sIdx} variant="secondary" className="bg-gray-100 text-gray-700 border-gray-300">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                  <p className="text-sm text-gray-600 mb-3">
                    <span className="font-medium">Time Commitment:</span> {opportunity.time_commitment}
                  </p>
                  <Button onClick={() => handleSignUpForOpportunity(opportunity.title)} className="w-full bg-green-600 hover:bg-green-700 text-white">
                    Sign Up for this Opportunity
                  </Button>
                </Card>
              ))
            ) : (
              <p className="text-center text-gray-500">No specific volunteer opportunities listed at this time. Please check their website.</p>
            )}
          </div>
          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setShowVolunteerModal(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

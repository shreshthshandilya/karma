
import React, { useState, useEffect } from "react";
import { User, Donation, Review } from "@/api/entities";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Award, Trophy, Star, Heart, Clock, Target, Share2, Twitter, Facebook, Linkedin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

export default function AchievementsPage() {
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState({
    totalDonated: 0,
    totalHours: 0,
    totalReviews: 0,
    consecutiveDays: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const currentUser = await User.me();
      setUser(currentUser);

      const donations = await Donation.filter({ donor_id: currentUser.id });
      const reviews = await Review.filter({ reviewer_id: currentUser.id });
      
      setStats({
        totalDonated: donations.reduce((sum, d) => sum + d.amount, 0),
        totalHours: currentUser.total_volunteer_hours || 0,
        totalReviews: reviews.length,
        consecutiveDays: 0 // Would need more complex logic
      });
    } catch (error) {
      console.error("Error loading data:", error);
    } finally {
      setLoading(false);
    }
  };

  const achievements = [
    {
      id: "first_donation",
      title: "First Step",
      description: "Made your first donation",
      icon: "💝",
      requirement: stats.totalDonated > 0,
      progress: Math.min(stats.totalDonated > 0 ? 100 : 0, 100)
    },
    {
      id: "generous_giver",
      title: "Generous Giver",
      description: "Donated $100 or more",
      icon: "💎",
      requirement: stats.totalDonated >= 100,
      progress: Math.min((stats.totalDonated / 100) * 100, 100)
    },
    {
      id: "philanthropist",
      title: "Philanthropist", 
      description: "Donated $1000 or more",
      icon: "🏆",
      requirement: stats.totalDonated >= 1000,
      progress: Math.min((stats.totalDonated / 1000) * 100, 100)
    },
    {
      id: "volunteer_starter",
      title: "Volunteer Starter",
      description: "Completed 5 hours of volunteering",
      icon: "⭐",
      requirement: stats.totalHours >= 5,
      progress: Math.min((stats.totalHours / 5) * 100, 100)
    },
    {
      id: "dedicated_volunteer",
      title: "Dedicated Volunteer",
      description: "Completed 25 hours of volunteering",
      icon: "🌟",
      requirement: stats.totalHours >= 25,
      progress: Math.min((stats.totalHours / 25) * 100, 100)
    },
    {
      id: "volunteer_champion",
      title: "Volunteer Champion",
      description: "Completed 100 hours of volunteering",
      icon: "🏅",
      requirement: stats.totalHours >= 100,
      progress: Math.min((stats.totalHours / 100) * 100, 100)
    },
    {
      id: "reviewer",
      title: "Community Reviewer",
      description: "Left 5 helpful reviews",
      icon: "📝",
      requirement: stats.totalReviews >= 5,
      progress: Math.min((stats.totalReviews / 5) * 100, 100)
    }
  ];

  const completedAchievements = achievements.filter(a => a.requirement);
  const progressAchievements = achievements.filter(a => !a.requirement && a.progress > 0);
  const lockedAchievements = achievements.filter(a => !a.requirement && a.progress === 0);

  const shareOnSocial = (platform, achievement) => {
    const text = `I just earned the "${achievement.title}" achievement on Karma! Join me in making a difference.`;
    const url = window.location.origin;
    let shareUrl = "";

    switch (platform) {
      case 'twitter':
        shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`;
        break;
      case 'facebook':
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
        break;
      case 'linkedin':
        shareUrl = `https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(url)}&title=${encodeURIComponent('I Earned a New Achievement!')}&summary=${encodeURIComponent(text)}`;
        break;
      default:
        return;
    }
    window.open(shareUrl, '_blank', 'noopener,noreferrer');
  };

  if (loading) {
    return (
      <div className="p-8">
        <div className="max-w-6xl mx-auto space-y-8">
          <div className="animate-pulse">
            <div className="h-8 bg-blue-200 rounded w-1/3 mb-4"></div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-32 bg-blue-100 rounded-xl"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <div className="p-4 md:p-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-4">
              Your Achievements
            </h1>
            <p className="text-gray-600">
              Track your progress and celebrate your impact in the community
            </p>
          </div>

          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-none shadow-xl">
              <CardContent className="p-6 text-center">
                <Trophy className="w-8 h-8 mx-auto mb-2" />
                <div className="text-2xl font-bold">{completedAchievements.length}</div>
                <p className="text-blue-100">Achievements Earned</p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white border-none shadow-xl">
              <CardContent className="p-6 text-center">
                <Heart className="w-8 h-8 mx-auto mb-2" />
                <div className="text-2xl font-bold">${stats.totalDonated}</div>
                <p className="text-green-100">Total Donated</p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white border-none shadow-xl">
              <CardContent className="p-6 text-center">
                <Clock className="w-8 h-8 mx-auto mb-2" />
                <div className="text-2xl font-bold">{stats.totalHours}</div>
                <p className="text-purple-100">Hours Volunteered</p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-orange-500 to-orange-600 text-white border-none shadow-xl">
              <CardContent className="p-6 text-center">
                <Star className="w-8 h-8 mx-auto mb-2" />
                <div className="text-2xl font-bold">{stats.totalReviews}</div>
                <p className="text-orange-100">Reviews Written</p>
              </CardContent>
            </Card>
          </div>

          {/* Completed Achievements */}
          {completedAchievements.length > 0 && (
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <Trophy className="w-6 h-6 text-yellow-500" />
                Completed Achievements
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {completedAchievements.map((achievement) => (
                  <Card key={achievement.id} className="bg-gradient-to-br from-yellow-50 to-orange-50 border-yellow-200 shadow-xl transform hover:scale-105 transition-all duration-300 flex flex-col">
                    <CardContent className="p-6 text-center flex-grow">
                      <div className="text-4xl mb-3">{achievement.icon}</div>
                      <h3 className="font-bold text-lg text-gray-900 mb-2">{achievement.title}</h3>
                      <p className="text-gray-600 text-sm mb-4">{achievement.description}</p>
                      <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">
                        ✓ Completed
                      </Badge>
                    </CardContent>
                    <CardFooter className="p-4 justify-center">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="outline" size="sm" className="bg-white/50">
                            <Share2 className="w-4 h-4 mr-2" />
                            Share
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="center">
                          <DropdownMenuItem onClick={() => shareOnSocial('twitter', achievement)}>
                            <Twitter className="w-4 h-4 mr-2" /> Twitter
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => shareOnSocial('facebook', achievement)}>
                            <Facebook className="w-4 h-4 mr-2" /> Facebook
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => shareOnSocial('linkedin', achievement)}>
                            <Linkedin className="w-4 h-4 mr-2" /> LinkedIn
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* In Progress */}
          {progressAchievements.length > 0 && (
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <Target className="w-6 h-6 text-blue-500" />
                In Progress
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {progressAchievements.map((achievement) => (
                  <Card key={achievement.id} className="bg-white/80 backdrop-blur-sm border-blue-100 shadow-xl">
                    <CardContent className="p-6">
                      <div className="text-center mb-4">
                        <div className="text-3xl mb-2">{achievement.icon}</div>
                        <h3 className="font-bold text-lg text-gray-900">{achievement.title}</h3>
                        <p className="text-gray-600 text-sm">{achievement.description}</p>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Progress</span>
                          <span className="font-medium">{Math.round(achievement.progress)}%</span>
                        </div>
                        <Progress value={achievement.progress} className="h-2" />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Locked Achievements */}
          {lockedAchievements.length > 0 && (
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <Award className="w-6 h-6 text-gray-400" />
                Locked Achievements
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {lockedAchievements.map((achievement) => (
                  <Card key={achievement.id} className="bg-gray-50 border-gray-200 shadow-lg opacity-75">
                    <CardContent className="p-6 text-center">
                      <div className="text-3xl mb-3 grayscale">{achievement.icon}</div>
                      <h3 className="font-bold text-lg text-gray-700 mb-2">{achievement.title}</h3>
                      <p className="text-gray-500 text-sm mb-4">{achievement.description}</p>
                      <Badge variant="outline" className="border-gray-300 text-gray-500">
                        🔒 Locked
                      </Badge>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* No achievements yet */}
          {completedAchievements.length === 0 && progressAchievements.length === 0 && (
            <div className="text-center py-12">
              <Award className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Start Your Journey</h3>
              <p className="text-gray-600 mb-4">
                Begin volunteering and donating to unlock your first achievements!
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

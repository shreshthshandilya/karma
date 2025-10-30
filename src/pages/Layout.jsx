
import React, { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { User } from "@/api/entities";
import { createPageUrl } from "@/utils";
import { Heart, Users, MessageCircle, User as UserIcon, Award, Home, Building2, DollarSign } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

const navigationItems = [
  {
    title: "Dashboard",
    url: createPageUrl("Dashboard"),
    icon: Home,
  },
  {
    title: "Nonprofits & Organizations",
    url: createPageUrl("NonprofitsDirectory"),
    icon: Building2,
  },
  {
    title: "Volunteering",
    url: createPageUrl("Volunteering"),
    icon: Users,
  },
  {
    title: "Donating",
    url: createPageUrl("Donating"),
    icon: DollarSign,
  },
  {
    title: "Messages",
    url: createPageUrl("Messages"),
    icon: MessageCircle,
  },
  {
    title: "Achievements",
    url: createPageUrl("Achievements"),
    icon: Award,
  },
  {
    title: "Profile",
    url: createPageUrl("Profile"),
    icon: UserIcon,
  }
];

export default function Layout({ children, currentPageName }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const checkUserOnboarding = async () => {
      // Public pages that don't require login or onboarding checks
      const publicPages = ['LandingPage', 'Onboarding', 'NonprofitsDirectory'];
      if (publicPages.includes(currentPageName)) {
        setLoading(false);
        return;
      }

      try {
        const currentUser = await User.me();
        setUser(currentUser);
        if (!currentUser.profile_completed) {
          // If profile is not complete, redirect to onboarding.
          // Pass their intended type if it's their first time.
          navigate(createPageUrl(`Onboarding?type=${currentUser.user_type || 'volunteer'}`));
        } else {
          setLoading(false);
        }
      } catch (error) {
        // User not logged in, redirect to the new landing page.
        console.log("User not logged in, redirecting to Landing Page.");
        navigate(createPageUrl("LandingPage"));
        setLoading(false);
      }
    };

    checkUserOnboarding();
  }, [currentPageName, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-indigo-50">
        <Loader2 className="w-12 h-12 text-blue-600 animate-spin" />
      </div>
    );
  }
  
  // Render pages without the main layout
  if (['LandingPage', 'Onboarding'].includes(currentPageName)) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <style>
        {`
          :root {
            --primary-blue: #2563eb;
            --primary-blue-light: #3b82f6;
            --primary-blue-dark: #1d4ed8;
            --secondary-blue: #dbeafe;
            --accent-blue: #60a5fa;
          }
        `}
      </style>
      
      <SidebarProvider>
        <div className="min-h-screen flex w-full">
          <Sidebar className="border-r border-blue-100 bg-white/80 backdrop-blur-sm">
            <SidebarHeader className="border-b border-blue-100 p-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                  <Heart className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                    Karma
                  </h2>
                  <p className="text-xs text-blue-500 font-medium">Building Better Communities</p>
                </div>
              </div>
            </SidebarHeader>
            
            <SidebarContent className="p-3">
              <SidebarGroup>
                <SidebarGroupContent>
                  <SidebarMenu className="space-y-1">
                    {navigationItems.map((item) => (
                      <SidebarMenuItem key={item.title}>
                        <SidebarMenuButton 
                          asChild 
                          className={`hover:bg-blue-50 hover:text-blue-700 transition-all duration-300 rounded-xl mb-1 group ${
                            location.pathname === item.url ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg transform scale-[1.02]' : ''
                          }`}
                        >
                          <Link to={item.url} className="flex items-center gap-3 px-4 py-3">
                            <item.icon className={`w-5 h-5 transition-transform duration-300 group-hover:scale-110 ${
                              location.pathname === item.url ? 'text-white' : ''
                            }`} />
                            <span className="font-semibold">{item.title}</span>
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    ))}
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>
            </SidebarContent>

            <SidebarFooter className="border-t border-blue-100 p-4">
              <div className="flex items-center gap-3 p-3 rounded-xl bg-gradient-to-r from-blue-50 to-indigo-50">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-400 to-indigo-500 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-sm">{user?.full_name?.charAt(0) || 'U'}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-900 text-sm truncate">{user?.full_name || 'Welcome!'}</p>
                  <p className="text-xs text-blue-600 truncate">Making a difference together</p>
                </div>
              </div>
            </SidebarFooter>
          </Sidebar>

          <main className="flex-1 flex flex-col">
            <header className="bg-white/80 backdrop-blur-sm border-b border-blue-100 px-6 py-4 md:hidden">
              <div className="flex items-center gap-4">
                <SidebarTrigger className="hover:bg-blue-50 p-2 rounded-xl transition-colors duration-200" />
                <div className="flex items-center gap-2">
                  <Heart className="w-6 h-6 text-blue-600" />
                  <h1 className="text-lg font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                    Karma
                  </h1>
                </div>
              </div>
            </header>

            <div className="flex-1 overflow-auto">
              {children}
            </div>
          </main>
        </div>
      </SidebarProvider>
    </div>
  );
}

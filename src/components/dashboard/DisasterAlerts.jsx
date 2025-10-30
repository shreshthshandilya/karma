
import React, { useState, useEffect } from "react";
import { Opportunity } from "@/api/entities";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertTriangle, MapPin, Clock } from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";

const calculateDistance = (lat1, lon1, lat2, lon2) => {
  if (!lat1 || !lon1 || !lat2 || !lon2) return Infinity;
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

export default function DisasterAlerts({ user }) {
  const [nearbyAlerts, setNearbyAlerts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.location) {
      const fetchAlerts = async () => {
        try {
          const disasterOpportunities = await Opportunity.filter({
            category: "disaster_relief",
            is_active: true
          });

          const alerts = disasterOpportunities
            .map(opp => ({
              ...opp,
              distance: calculateDistance(
                user.location.latitude,
                user.location.longitude,
                opp.location?.latitude,
                opp.location?.longitude
              ),
            }))
            .filter(opp => opp.distance <= 150) // Show alerts within 150 miles
            .sort((a, b) => a.distance - b.distance);

          setNearbyAlerts(alerts.slice(0, 2)); // Show max 2 alerts
        } catch (error) {
          // Silently handle error - alerts are optional
          setNearbyAlerts([]);
        } finally {
          setLoading(false);
        }
      };

      fetchAlerts();
    } else {
        setLoading(false);
    }
  }, [user]);

  if (loading || nearbyAlerts.length === 0) {
    return null; // Don't show the component if there are no alerts or still loading
  }

  return (
    <Card className="bg-gradient-to-r from-red-500 to-orange-500 text-white border-none shadow-2xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-3">
          <AlertTriangle className="w-6 h-6" />
          Urgent Needs Nearby
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {nearbyAlerts.map(alert => (
          <div key={alert.id} className="p-4 rounded-lg bg-white/20 backdrop-blur-sm border border-white/30">
            <h3 className="font-bold text-lg mb-2">{alert.title}</h3>
            <p className="text-sm text-red-100 mb-3 line-clamp-2">{alert.description}</p>
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4 text-sm">
                    <div className="flex items-center gap-1 font-semibold">
                        <MapPin className="w-4 h-4" />
                        {alert.location?.city ? `${alert.location.city}, ${alert.location.state}` : 'Location TBD'}
                        <span className="font-normal opacity-80">({alert.distance.toFixed(0)} mi away)</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {alert.time_commitment}
                    </div>
                </div>
                 <Link to={createPageUrl(`Opportunities`)}>
                    <Button variant="outline" size="sm" className="bg-white text-red-600 hover:bg-red-50 hover:text-red-700 border-red-200">
                        View & Help
                    </Button>
                 </Link>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

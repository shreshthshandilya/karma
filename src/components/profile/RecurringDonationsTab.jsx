import React, { useState, useEffect, useCallback } from 'react';
import { RecurringDonation, Nonprofit } from '@/api/entities';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Repeat, Pause, Play, X, DollarSign, Calendar } from 'lucide-react';
import { format } from 'date-fns';

export default function RecurringDonationsTab({ user }) {
  const [recurringDonations, setRecurringDonations] = useState([]);
  const [nonprofits, setNonprofits] = useState({});
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    if (!user?.id) {
      setRecurringDonations([]);
      setNonprofits({});
      setLoading(false);
      return;
    }
    
    setLoading(true);
    try {
      const donations = await RecurringDonation.filter({ donor_id: user.id });
      setRecurringDonations(donations.sort((a,b) => new Date(a.next_donation_date) - new Date(b.next_donation_date)));
      
      const nonprofitIds = [...new Set(donations.map(d => d.nonprofit_id))];
      if (nonprofitIds.length > 0) {
        const nonprofitData = await Nonprofit.list();
        const nonprofitMap = nonprofitData.reduce((acc, org) => {
          acc[org.id] = org;
          return acc;
        }, {});
        setNonprofits(nonprofitMap);
      } else {
        setNonprofits({});
      }
    } catch (error) {
      console.error("Error loading recurring donations:", error);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleStatusChange = async (donationId, newStatus) => {
    try {
      await RecurringDonation.update(donationId, { status: newStatus });
      loadData();
    } catch (error) {
      console.error("Error updating donation status:", error);
    }
  };
  
  const getStatusBadge = (status) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-100 text-green-800">Active</Badge>;
      case 'paused':
        return <Badge className="bg-yellow-100 text-yellow-800">Paused</Badge>;
      case 'cancelled':
        return <Badge className="bg-red-100 text-red-800">Cancelled</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (loading) {
    return (
      <Card className="bg-white/80 backdrop-blur-sm border-blue-100 shadow-xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Repeat className="w-5 h-5 text-blue-600" />
            Recurring Donations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="h-4 bg-blue-200 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-blue-100 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-white/80 backdrop-blur-sm border-blue-100 shadow-xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Repeat className="w-5 h-5 text-blue-600" />
          Recurring Donations
        </CardTitle>
        <p className="text-sm text-gray-600">Manage your automatic donations</p>
      </CardHeader>
      <CardContent>
        {recurringDonations.length === 0 ? (
          <div className="text-center py-8">
            <Repeat className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Recurring Donations</h3>
            <p className="text-gray-600">Set up recurring donations to provide ongoing support to your favorite causes.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {recurringDonations.map((donation) => (
              <Card key={donation.id} className="border border-blue-100">
                <CardContent className="p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900">
                        {nonprofits[donation.nonprofit_id]?.name || 'Unknown Organization'}
                      </h3>
                      <div className="flex items-center gap-2 text-sm text-gray-600 mt-1">
                        <DollarSign className="w-3 h-3" />
                        ${donation.amount} {donation.frequency}
                      </div>
                    </div>
                    {getStatusBadge(donation.status)}
                  </div>
                  
                  <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
                    <Calendar className="w-3 h-3" />
                    Next payment: {format(new Date(donation.next_donation_date), 'MMM d, yyyy')}
                  </div>

                  <div className="flex gap-2">
                    {donation.status === 'active' && (
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => handleStatusChange(donation.id, 'paused')}
                        className="flex-1"
                      >
                        <Pause className="w-3 h-3 mr-1" />
                        Pause
                      </Button>
                    )}
                    
                    {donation.status === 'paused' && (
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => handleStatusChange(donation.id, 'active')}
                        className="flex-1"
                      >
                        <Play className="w-3 h-3 mr-1" />
                        Resume
                      </Button>
                    )}
                    
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => handleStatusChange(donation.id, 'cancelled')}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <X className="w-3 h-3 mr-1" />
                      Cancel
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
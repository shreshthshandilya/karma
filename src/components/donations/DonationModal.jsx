
import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Heart, CreditCard, Shield, Lock, Repeat } from "lucide-react";
import { User, Nonprofit, Donation, RecurringDonation } from "@/api/entities";

export default function DonationModal({ nonprofit, children }) {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [donationData, setDonationData] = useState({
    amount: "",
    message: "",
    isAnonymous: false,
    isRecurring: false,
    frequency: "monthly",
    cardNumber: "",
    expiryDate: "",
    cvv: "",
    cardholderName: "",
    billingZip: ""
  });

  const handleInputChange = (field, value) => {
    setDonationData(prev => ({ ...prev, [field]: value }));
  };

  const formatCardNumber = (value) => {
    const cleaned = value.replace(/\D/g, '');
    const formatted = cleaned.replace(/(.{4})/g, '$1 ').trim();
    return formatted.substring(0, 19);
  };

  const formatExpiryDate = (value) => {
    const cleaned = value.replace(/\D/g, '');
    if (cleaned.length >= 2) {
      return cleaned.substring(0, 2) + '/' + cleaned.substring(2, 4);
    }
    return cleaned;
  };

  const calculateFees = () => {
    const amount = parseFloat(donationData.amount) || 0;
    const platformFee = amount * 0.01; // 1% platform fee
    const netAmount = amount - platformFee;
    return { amount, platformFee, netAmount };
  };

  const processDonation = async () => {
    setLoading(true);
    try {
      const user = await User.me();
      
      // Simulate payment processing (2-3 seconds)
      // NOTE: Real payment processing would require integration with Stripe, PayPal, etc.
      // which are not currently available in the base44 platform.
      await new Promise(resolve => setTimeout(resolve, 2500));
      
      // In a real implementation, this is where you would:
      // 1. Call Stripe/PayPal API to charge the card
      // 2. Verify the payment was successful
      // 3. Only then create the donation record
      
      // For demonstration purposes, we're simulating a successful payment
      console.log("DEMO MODE: Simulating payment processing...");
      console.log("Card Details (NOT PROCESSED):", {
        cardNumber: donationData.cardNumber,
        cardholder: donationData.cardholderName,
        amount: donationData.amount
      });
      
      if (donationData.isRecurring) {
        const nextDonationDate = new Date();
        if (donationData.frequency === 'weekly') {
          nextDonationDate.setDate(nextDonationDate.getDate() + 7);
        } else {
          nextDonationDate.setMonth(nextDonationDate.getMonth() + 1);
        }

        await RecurringDonation.create({
          donor_id: user.id,
          nonprofit_id: nonprofit.id,
          amount: parseFloat(donationData.amount),
          frequency: donationData.frequency,
          next_donation_date: nextDonationDate.toISOString(),
          card_last_four: donationData.cardNumber.slice(-4).replace(/\D/g, ''),
          status: 'active'
        });
        
      } else {
        const { amount, platformFee, netAmount } = calculateFees();
        await Donation.create({
          donor_id: user.id,
          nonprofit_id: nonprofit.id,
          amount: amount,
          platform_fee: platformFee,
          net_amount: netAmount,
          message: donationData.message,
          is_anonymous: donationData.isAnonymous,
          payment_method: "credit_card",
          card_last_four: donationData.cardNumber.slice(-4).replace(/\D/g, ''),
          status: "completed",
          transaction_id: `demo_txn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
        });

        const currentTotal = user.total_donated || 0;
        await User.updateMyUserData({ total_donated: currentTotal + amount });

        const currentNonprofitTotal = nonprofit.total_donations_received || 0;
        await Nonprofit.update(nonprofit.id, {
          total_donations_received: currentNonprofitTotal + netAmount
        });
      }

      setStep(3);
    } catch (error) {
      console.error("Error processing donation:", error);
      alert("There was an error processing your donation. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const renderStep = () => {
    const { amount, platformFee, netAmount } = calculateFees();
    
    switch (step) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h3 className="text-xl font-bold text-gray-900 mb-2">Support {nonprofit.name}</h3>
              <p className="text-gray-600">Every donation makes a difference</p>
            </div>

            <div className="grid grid-cols-3 gap-3">
              {[5, 25, 50, 100].map(amt => (
                <Button
                  key={amt}
                  variant={donationData.amount === amt.toString() ? "default" : "outline"}
                  onClick={() => handleInputChange('amount', amt.toString())}
                  className="h-12"
                >
                  ${amt}
                </Button>
              ))}
            </div>

            <div className="space-y-2">
              <Label>Custom Amount</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                <Input
                  type="number"
                  placeholder="0.00"
                  value={donationData.amount}
                  onChange={(e) => handleInputChange('amount', e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>

            <div className="space-y-4 p-4 bg-blue-50 rounded-lg">
              <div className="flex items-center space-x-2">
                <Switch
                  id="recurring"
                  checked={donationData.isRecurring}
                  onCheckedChange={(value) => handleInputChange('isRecurring', value)}
                />
                <Label htmlFor="recurring" className="flex items-center gap-2">
                  <Repeat className="w-4 h-4 text-blue-600" />
                  Make this a recurring donation
                </Label>
              </div>

              {donationData.isRecurring && (
                <Select
                  value={donationData.frequency}
                  onValueChange={(value) => handleInputChange('frequency', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="weekly">Every week</SelectItem>
                    <SelectItem value="monthly">Every month</SelectItem>
                  </SelectContent>
                </Select>
              )}
            </div>

            <div className="space-y-2">
              <Label>Optional Message</Label>
              <Textarea
                placeholder="Leave an encouraging message..."
                value={donationData.message}
                onChange={(e) => handleInputChange('message', e.target.value)}
              />
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="anonymous"
                checked={donationData.isAnonymous}
                onCheckedChange={(value) => handleInputChange('isAnonymous', value)}
              />
              <Label htmlFor="anonymous">Donate anonymously</Label>
            </div>

            {amount > 0 && (
              <div className="p-4 bg-gray-50 rounded-lg space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Donation Amount:</span>
                  <span>${amount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Platform Fee (1%):</span>
                  <span>-${platformFee.toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-bold border-t pt-2">
                  <span>Organization Receives:</span>
                  <span>${netAmount.toFixed(2)}</span>
                </div>
              </div>
            )}

            <Button
              onClick={() => setStep(2)}
              disabled={!donationData.amount || parseFloat(donationData.amount) <= 0}
              className="w-full bg-blue-600 hover:bg-blue-700"
            >
              Continue to Payment
            </Button>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <CreditCard className="w-12 h-12 mx-auto mb-3 text-blue-600" />
              <h3 className="text-xl font-bold text-gray-900 mb-2">Payment Information</h3>
              <div className="flex items-center justify-center gap-2 text-sm text-gray-600">
                <Lock className="w-4 h-4" />
                Demo Mode - No real charges will be made
              </div>
              <p className="text-xs text-amber-600 mt-2 font-medium">
                Note: Real payment processing requires integration with payment providers (Stripe, PayPal, etc.)
              </p>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Cardholder Name</Label>
                <Input
                  value={donationData.cardholderName}
                  onChange={(e) => handleInputChange('cardholderName', e.target.value)}
                  placeholder="John Smith"
                />
              </div>

              <div className="space-y-2">
                <Label>Card Number</Label>
                <Input
                  value={donationData.cardNumber}
                  onChange={(e) => handleInputChange('cardNumber', formatCardNumber(e.target.value))}
                  placeholder="1234 5678 9012 3456"
                  maxLength={19}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Expiry Date</Label>
                  <Input
                    value={donationData.expiryDate}
                    onChange={(e) => handleInputChange('expiryDate', formatExpiryDate(e.target.value))}
                    placeholder="MM/YY"
                    maxLength={5}
                  />
                </div>
                <div className="space-y-2">
                  <Label>CVV</Label>
                  <Input
                    value={donationData.cvv}
                    onChange={(e) => handleInputChange('cvv', e.target.value.replace(/\D/g, '').substring(0, 4))}
                    placeholder="123"
                    maxLength={4}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Billing ZIP Code</Label>
                <Input
                  value={donationData.billingZip}
                  onChange={(e) => handleInputChange('billingZip', e.target.value)}
                  placeholder="12345"
                />
              </div>
            </div>

            <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
              <p className="text-sm text-amber-800">
                <strong>Demo Mode:</strong> This is a simulated payment. In a production app, this would integrate with Stripe, PayPal, or another payment processor to securely process real transactions.
              </p>
            </div>

            <div className="p-4 bg-blue-50 rounded-lg">
              <h4 className="font-semibold text-gray-900 mb-2">Donation Summary</h4>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span>Amount:</span>
                  <span>${amount.toFixed(2)}</span>
                </div>
                {donationData.isRecurring && (
                  <div className="flex justify-between text-blue-600 font-medium">
                    <span>Frequency:</span>
                    <span>{donationData.frequency === 'weekly' ? 'Every week' : 'Every month'}</span>
                  </div>
                )}
                <div className="flex justify-between text-gray-600">
                  <span>Platform Fee:</span>
                  <span>${platformFee.toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-bold border-t pt-1">
                  <span>Organization Receives:</span>
                  <span>${netAmount.toFixed(2)}</span>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setStep(1)} className="flex-1">
                Back
              </Button>
              <Button
                onClick={processDonation}
                disabled={loading || !donationData.cardNumber || !donationData.expiryDate || !donationData.cvv || !donationData.cardholderName || !donationData.billingZip}
                className="flex-1 bg-green-600 hover:bg-green-700"
              >
                {loading ? "Processing..." : `${donationData.isRecurring ? 'Set Up Recurring' : 'Donate'} $${amount.toFixed(2)}`}
              </Button>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="text-center space-y-6">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
              <Heart className="w-8 h-8 text-green-600" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                {donationData.isRecurring ? 'Recurring Donation Set Up!' : 'Thank You for Your Donation!'}
              </h3>
              <p className="text-gray-600">
                {donationData.isRecurring 
                  ? `Your ${donationData.frequency} donation of $${donationData.amount} will help ${nonprofit.name} make a lasting impact.`
                  : `Your generous donation of $${donationData.amount} will help ${nonprofit.name} continue their important work.`
                }
              </p>
            </div>
            <Button onClick={() => setOpen(false)} className="bg-blue-600 hover:bg-blue-700">
              Close
            </Button>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Heart className="w-5 h-5 text-red-500" />
            Make a Donation
          </DialogTitle>
        </DialogHeader>
        {renderStep()}
      </DialogContent>
    </Dialog>
  );
}

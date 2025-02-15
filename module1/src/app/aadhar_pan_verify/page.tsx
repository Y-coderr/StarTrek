'use client'
import React, { useState } from 'react';
import { Check, AlertCircle, FileText, CreditCard, ChevronRight } from 'lucide-react';
import { Alert, AlertDescription } from '../components/ui/alert';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';

const AuthenticationPage = () => {
        const [step, setStep] = useState(1);
        const [formData, setFormData] = useState({
                aadhaar: '',
                pan: '',
        });
        const [errors, setErrors] = useState({});
        const [isSubmitting, setIsSubmitting] = useState(false);

        const validateAadhaar = (value) => {
                return /^\d{12}$/.test(value);
        };

        const validatePAN = (value) => {
                return /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(value);
        };

        const handleInputChange = (e) => {
                const { name, value } = e.target;
                setFormData(prev => ({
                        ...prev,
                        [name]: value.toUpperCase()
                }));

                // Clear errors when user types
                setErrors(prev => ({
                        ...prev,
                        [name]: ''
                }));
        };

        const handleSubmit = async (e) => {
                e.preventDefault();
                setIsSubmitting(true);

                const newErrors = {};
                if (!validateAadhaar(formData.aadhaar)) {
                        newErrors.aadhaar = 'Please enter a valid 12-digit Aadhaar number';
                }
                if (!validatePAN(formData.pan)) {
                        newErrors.pan = 'Please enter a valid PAN number';
                }

                setErrors(newErrors);

                if (Object.keys(newErrors).length === 0) {
                        // Simulate API call
                        await new Promise(resolve => setTimeout(resolve, 1500));
                        setStep(3);
                }

                setIsSubmitting(false);
        };

        const renderStep = () => {
                switch (step) {
                        case 1:
                                return (
                                        <div className="space-y-6">
                                                <div className="space-y-2">
                                                        <Label htmlFor="aadhaar">Aadhaar Number</Label>
                                                        <Input
                                                                id="aadhaar"
                                                                name="aadhaar"
                                                                value={formData.aadhaar}
                                                                onChange={handleInputChange}
                                                                placeholder="Enter 12-digit Aadhaar number"
                                                                className={errors.aadhaar ? 'border-red-500' : ''}
                                                        />
                                                        {errors.aadhaar && (
                                                                <p className="text-sm text-red-500">{errors.aadhaar}</p>
                                                        )}
                                                </div>
                                                <Button
                                                        onClick={() => !errors.aadhaar && formData.aadhaar && setStep(2)}
                                                        className="w-full"
                                                        disabled={!formData.aadhaar || errors.aadhaar}
                                                >
                                                        Next <ChevronRight className="ml-2 h-4 w-4" />
                                                </Button>
                                        </div>
                                );
                        case 2:
                                return (
                                        <div className="space-y-6">
                                                <div className="space-y-2">
                                                        <Label htmlFor="pan">PAN Number</Label>
                                                        <Input
                                                                id="pan"
                                                                name="pan"
                                                                value={formData.pan}
                                                                onChange={handleInputChange}
                                                                placeholder="Enter PAN number"
                                                                className={errors.pan ? 'border-red-500' : ''}
                                                        />
                                                        {errors.pan && (
                                                                <p className="text-sm text-red-500">{errors.pan}</p>
                                                        )}
                                                </div>
                                                <div className="flex space-x-4">
                                                        <Button
                                                                variant="outline"
                                                                onClick={() => setStep(1)}
                                                                className="w-full"
                                                        >
                                                                Back
                                                        </Button>
                                                        <Button
                                                                onClick={handleSubmit}
                                                                className="w-full"
                                                                disabled={isSubmitting || !formData.pan || errors.pan}
                                                        >
                                                                {isSubmitting ? 'Verifying...' : 'Verify'}
                                                        </Button>
                                                </div>
                                        </div>
                                );
                        case 3:
                                return (
                                        <div className="space-y-6 text-center">
                                                <div className="mx-auto w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                                                        <Check className="h-6 w-6 text-green-600" />
                                                </div>
                                                <div>
                                                        <h3 className="text-lg font-semibold">Verification Successful</h3>
                                                        <p className="text-gray-500 mt-2">Your documents have been verified successfully</p>
                                                </div>
                                                <Button
                                                        onClick={() => {
                                                                setStep(1);
                                                                setFormData({ aadhaar: '', pan: '' });
                                                        }}
                                                        variant="outline"
                                                >
                                                        Start Over
                                                </Button>
                                        </div>
                                );
                }
        };

        return (
                <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
                        <Card className="w-full max-w-md">
                                <CardHeader>
                                        <CardTitle>Document Verification</CardTitle>
                                        <CardDescription>Verify your Aadhaar and PAN details</CardDescription>
                                </CardHeader>
                                <CardContent>
                                        {/* Progress indicator */}
                                        <div className="mb-8">
                                                <div className="flex justify-between mb-2">
                                                        {[1, 2, 3].map((num) => (
                                                                <div
                                                                        key={num}
                                                                        className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= num ? 'bg-blue-600 text-white' : 'bg-gray-200'
                                                                                }`}
                                                                >
                                                                        {num}
                                                                </div>
                                                        ))}
                                                </div>
                                                <div className="relative h-2 bg-gray-200 rounded">
                                                        <div
                                                                className="absolute h-full bg-blue-600 rounded transition-all duration-300"
                                                                style={{ width: `${((step - 1) / 2) * 100}%` }}
                                                        />
                                                </div>
                                        </div>

                                        {/* Form content */}
                                        {renderStep()}
                                </CardContent>
                                <CardFooter className="flex justify-center border-t">
                                        <div className="flex items-center space-x-2 text-sm text-gray-600">
                                                <FileText className="h-4 w-4" />
                                                <span>Your data is encrypted and secure</span>
                                        </div>
                                </CardFooter>
                        </Card>
                </div>
        );
};

export default AuthenticationPage;
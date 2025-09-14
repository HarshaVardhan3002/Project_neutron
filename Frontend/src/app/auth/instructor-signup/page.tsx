'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
    Eye,
    EyeOff,
    Loader2,
    Mail,
    Lock,
    User,
    ArrowLeft,
    BookOpen,
    GraduationCap,
    Users,
    Award,
    DollarSign,
    Calendar,
    Star
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext.context';
import { toast } from 'sonner';

export default function InstructorSignUpPage() {
    const router = useRouter();
    const { signUp } = useAuth();

    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState({
        // Personal Info
        email: '',
        password: '',
        confirmPassword: '',
        firstName: '',
        lastName: '',
        phone: '',

        // Professional Info
        title: '',
        bio: '',
        expertise: [] as string[],
        experience: '',
        education: '',
        certifications: '',

        // Teaching Info
        subjects: [] as string[],
        teachingExperience: '',
        preferredSchedule: '',
        hourlyRate: '',

        // Agreement
        agreeToTerms: false,
        agreeToInstructorTerms: false
    });
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const expertiseOptions = [
        'Mathematics', 'Science', 'English', 'History', 'Computer Science',
        'Business', 'Art & Design', 'Music', 'Languages', 'Test Preparation',
        'Programming', 'Data Science', 'Marketing', 'Finance', 'Psychology'
    ];

    const subjectOptions = [
        'IELTS Preparation', 'TOEFL Preparation', 'SAT Preparation', 'GRE Preparation',
        'Academic Writing', 'Business English', 'Conversational English', 'Grammar',
        'Pronunciation', 'Vocabulary Building', 'Reading Comprehension', 'Listening Skills'
    ];

    const handleNext = () => {
        if (step === 1) {
            // Validate step 1
            if (!formData.email || !formData.password || !formData.firstName || !formData.lastName) {
                setError('Please fill in all required fields');
                return;
            }
            if (formData.password !== formData.confirmPassword) {
                setError('Passwords do not match');
                return;
            }
            if (formData.password.length < 6) {
                setError('Password must be at least 6 characters long');
                return;
            }
        }

        setError('');
        setStep(step + 1);
    };

    const handleBack = () => {
        setStep(step - 1);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (!formData.agreeToTerms || !formData.agreeToInstructorTerms) {
            setError('Please agree to all terms and conditions');
            return;
        }

        setLoading(true);

        try {
            const { error } = await signUp(
                formData.email,
                formData.password,
                {
                    display_name: `${formData.firstName} ${formData.lastName}`,
                    first_name: formData.firstName,
                    last_name: formData.lastName,
                    role: 'instructor',
                    instructor_profile: {
                        title: formData.title,
                        bio: formData.bio,
                        expertise: formData.expertise,
                        experience: formData.experience,
                        education: formData.education,
                        certifications: formData.certifications,
                        subjects: formData.subjects,
                        teaching_experience: formData.teachingExperience,
                        preferred_schedule: formData.preferredSchedule,
                        hourly_rate: parseFloat(formData.hourlyRate) || 0,
                        phone: formData.phone
                    }
                }
            );

            if (error) {
                setError(error.message);
            } else {
                toast.success('Instructor application submitted successfully! Please check your email and wait for approval.');
                router.push('/auth/signin');
            }
        } catch (err) {
            setError('An unexpected error occurred');
        } finally {
            setLoading(false);
        }
    };

    const toggleExpertise = (expertise: string) => {
        setFormData(prev => ({
            ...prev,
            expertise: prev.expertise.includes(expertise)
                ? prev.expertise.filter(e => e !== expertise)
                : [...prev.expertise, expertise]
        }));
    };

    const toggleSubject = (subject: string) => {
        setFormData(prev => ({
            ...prev,
            subjects: prev.subjects.includes(subject)
                ? prev.subjects.filter(s => s !== subject)
                : [...prev.subjects, subject]
        }));
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50">
            <div className="container mx-auto px-4 py-8">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <Link href="/" className="flex items-center gap-2 text-xl font-bold">
                        <BookOpen className="h-6 w-6 text-blue-600" />
                        Project Neutron LMS
                    </Link>
                    <Button variant="ghost" asChild>
                        <Link href="/">
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back to Home
                        </Link>
                    </Button>
                </div>

                <div className="max-w-4xl mx-auto">
                    {/* Progress Indicator */}
                    <div className="mb-8">
                        <div className="flex items-center justify-center space-x-4">
                            {[1, 2, 3].map((stepNumber) => (
                                <div key={stepNumber} className="flex items-center">
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${step >= stepNumber
                                            ? 'bg-blue-600 text-white'
                                            : 'bg-gray-200 text-gray-600'
                                        }`}>
                                        {stepNumber}
                                    </div>
                                    {stepNumber < 3 && (
                                        <div className={`w-16 h-1 mx-2 ${step > stepNumber ? 'bg-blue-600' : 'bg-gray-200'
                                            }`} />
                                    )}
                                </div>
                            ))}
                        </div>
                        <div className="flex justify-center mt-4">
                            <div className="text-center">
                                <p className="text-sm text-muted-foreground">
                                    Step {step} of 3: {
                                        step === 1 ? 'Personal Information' :
                                            step === 2 ? 'Professional Background' :
                                                'Teaching Details'
                                    }
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Left Side - Benefits */}
                        <div className="space-y-6">
                            <div>
                                <h1 className="text-3xl font-bold mb-4">
                                    Join Our Teaching Community
                                </h1>
                                <p className="text-muted-foreground">
                                    Share your expertise and help students achieve their learning goals while earning competitive income.
                                </p>
                            </div>

                            <div className="space-y-4">
                                <div className="flex items-start gap-3">
                                    <div className="bg-blue-100 p-2 rounded-lg">
                                        <Users className="h-5 w-5 text-blue-600" />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-sm">Reach Global Students</h3>
                                        <p className="text-xs text-muted-foreground">
                                            Connect with learners worldwide and build your teaching reputation.
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-3">
                                    <div className="bg-green-100 p-2 rounded-lg">
                                        <DollarSign className="h-5 w-5 text-green-600" />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-sm">Competitive Earnings</h3>
                                        <p className="text-xs text-muted-foreground">
                                            Set your own rates and earn up to $50+ per hour.
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-3">
                                    <div className="bg-purple-100 p-2 rounded-lg">
                                        <Calendar className="h-5 w-5 text-purple-600" />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-sm">Flexible Schedule</h3>
                                        <p className="text-xs text-muted-foreground">
                                            Teach when it works for you with our flexible scheduling system.
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-3">
                                    <div className="bg-orange-100 p-2 rounded-lg">
                                        <Award className="h-5 w-5 text-orange-600" />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-sm">Professional Growth</h3>
                                        <p className="text-xs text-muted-foreground">
                                            Access teaching resources and professional development opportunities.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white p-4 rounded-xl">
                                <div className="flex items-center gap-2 mb-2">
                                    <Star className="h-5 w-5" />
                                    <span className="font-semibold text-sm">Top Instructor Benefits</span>
                                </div>
                                <p className="text-purple-100 text-xs">
                                    High-performing instructors earn featured placement, bonus payments, and exclusive opportunities.
                                </p>
                            </div>
                        </div>

                        {/* Right Side - Form */}
                        <div className="lg:col-span-2">
                            <Card className="shadow-xl">
                                <CardHeader>
                                    <CardTitle>Instructor Application</CardTitle>
                                    <CardDescription>
                                        Complete your application to start teaching on our platform
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    {error && (
                                        <Alert variant="destructive" className="mb-6">
                                            <AlertDescription>{error}</AlertDescription>
                                        </Alert>
                                    )}

                                    <form onSubmit={handleSubmit}>
                                        {/* Step 1: Personal Information */}
                                        {step === 1 && (
                                            <div className="space-y-4">
                                                <div className="grid grid-cols-2 gap-4">
                                                    <div className="space-y-2">
                                                        <Label htmlFor="firstName">First Name *</Label>
                                                        <Input
                                                            id="firstName"
                                                            value={formData.firstName}
                                                            onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                                                            required
                                                        />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <Label htmlFor="lastName">Last Name *</Label>
                                                        <Input
                                                            id="lastName"
                                                            value={formData.lastName}
                                                            onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                                                            required
                                                        />
                                                    </div>
                                                </div>

                                                <div className="space-y-2">
                                                    <Label htmlFor="email">Email Address *</Label>
                                                    <Input
                                                        id="email"
                                                        type="email"
                                                        value={formData.email}
                                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                                        required
                                                    />
                                                </div>

                                                <div className="space-y-2">
                                                    <Label htmlFor="phone">Phone Number</Label>
                                                    <Input
                                                        id="phone"
                                                        type="tel"
                                                        value={formData.phone}
                                                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                                    />
                                                </div>

                                                <div className="space-y-2">
                                                    <Label htmlFor="password">Password *</Label>
                                                    <div className="relative">
                                                        <Input
                                                            id="password"
                                                            type={showPassword ? 'text' : 'password'}
                                                            value={formData.password}
                                                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                                            className="pr-10"
                                                            required
                                                        />
                                                        <Button
                                                            type="button"
                                                            variant="ghost"
                                                            size="sm"
                                                            className="absolute right-0 top-0 h-full px-3"
                                                            onClick={() => setShowPassword(!showPassword)}
                                                        >
                                                            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                                        </Button>
                                                    </div>
                                                </div>

                                                <div className="space-y-2">
                                                    <Label htmlFor="confirmPassword">Confirm Password *</Label>
                                                    <div className="relative">
                                                        <Input
                                                            id="confirmPassword"
                                                            type={showConfirmPassword ? 'text' : 'password'}
                                                            value={formData.confirmPassword}
                                                            onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                                                            className="pr-10"
                                                            required
                                                        />
                                                        <Button
                                                            type="button"
                                                            variant="ghost"
                                                            size="sm"
                                                            className="absolute right-0 top-0 h-full px-3"
                                                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                                        >
                                                            {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                                        </Button>
                                                    </div>
                                                </div>

                                                <div className="flex justify-end">
                                                    <Button type="button" onClick={handleNext}>
                                                        Next Step
                                                    </Button>
                                                </div>
                                            </div>
                                        )}

                                        {/* Step 2: Professional Background */}
                                        {step === 2 && (
                                            <div className="space-y-4">
                                                <div className="space-y-2">
                                                    <Label htmlFor="title">Professional Title</Label>
                                                    <Input
                                                        id="title"
                                                        placeholder="e.g., English Language Specialist, IELTS Expert"
                                                        value={formData.title}
                                                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                                    />
                                                </div>

                                                <div className="space-y-2">
                                                    <Label htmlFor="bio">Professional Bio</Label>
                                                    <Textarea
                                                        id="bio"
                                                        placeholder="Tell us about your background, experience, and teaching philosophy..."
                                                        value={formData.bio}
                                                        onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                                                        rows={4}
                                                    />
                                                </div>

                                                <div className="space-y-2">
                                                    <Label>Areas of Expertise</Label>
                                                    <div className="grid grid-cols-2 gap-2">
                                                        {expertiseOptions.map((expertise) => (
                                                            <div key={expertise} className="flex items-center space-x-2">
                                                                <Checkbox
                                                                    id={expertise}
                                                                    checked={formData.expertise.includes(expertise)}
                                                                    onCheckedChange={() => toggleExpertise(expertise)}
                                                                />
                                                                <Label htmlFor={expertise} className="text-sm">{expertise}</Label>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>

                                                <div className="space-y-2">
                                                    <Label htmlFor="education">Education Background</Label>
                                                    <Textarea
                                                        id="education"
                                                        placeholder="Your educational qualifications, degrees, institutions..."
                                                        value={formData.education}
                                                        onChange={(e) => setFormData({ ...formData, education: e.target.value })}
                                                        rows={3}
                                                    />
                                                </div>

                                                <div className="space-y-2">
                                                    <Label htmlFor="certifications">Certifications</Label>
                                                    <Textarea
                                                        id="certifications"
                                                        placeholder="Teaching certifications, professional licenses, etc."
                                                        value={formData.certifications}
                                                        onChange={(e) => setFormData({ ...formData, certifications: e.target.value })}
                                                        rows={2}
                                                    />
                                                </div>

                                                <div className="flex justify-between">
                                                    <Button type="button" variant="outline" onClick={handleBack}>
                                                        Previous
                                                    </Button>
                                                    <Button type="button" onClick={handleNext}>
                                                        Next Step
                                                    </Button>
                                                </div>
                                            </div>
                                        )}

                                        {/* Step 3: Teaching Details */}
                                        {step === 3 && (
                                            <div className="space-y-4">
                                                <div className="space-y-2">
                                                    <Label>Subjects You Can Teach</Label>
                                                    <div className="grid grid-cols-2 gap-2">
                                                        {subjectOptions.map((subject) => (
                                                            <div key={subject} className="flex items-center space-x-2">
                                                                <Checkbox
                                                                    id={subject}
                                                                    checked={formData.subjects.includes(subject)}
                                                                    onCheckedChange={() => toggleSubject(subject)}
                                                                />
                                                                <Label htmlFor={subject} className="text-sm">{subject}</Label>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>

                                                <div className="space-y-2">
                                                    <Label htmlFor="teachingExperience">Teaching Experience</Label>
                                                    <Textarea
                                                        id="teachingExperience"
                                                        placeholder="Describe your teaching experience, methodologies, and achievements..."
                                                        value={formData.teachingExperience}
                                                        onChange={(e) => setFormData({ ...formData, teachingExperience: e.target.value })}
                                                        rows={3}
                                                    />
                                                </div>

                                                <div className="space-y-2">
                                                    <Label htmlFor="hourlyRate">Preferred Hourly Rate (USD)</Label>
                                                    <Input
                                                        id="hourlyRate"
                                                        type="number"
                                                        placeholder="25"
                                                        value={formData.hourlyRate}
                                                        onChange={(e) => setFormData({ ...formData, hourlyRate: e.target.value })}
                                                    />
                                                </div>

                                                <div className="space-y-2">
                                                    <Label htmlFor="preferredSchedule">Preferred Teaching Schedule</Label>
                                                    <Textarea
                                                        id="preferredSchedule"
                                                        placeholder="When are you typically available to teach? (e.g., weekdays 9 AM - 5 PM EST)"
                                                        value={formData.preferredSchedule}
                                                        onChange={(e) => setFormData({ ...formData, preferredSchedule: e.target.value })}
                                                        rows={2}
                                                    />
                                                </div>

                                                <div className="space-y-4">
                                                    <div className="flex items-center space-x-2">
                                                        <Checkbox
                                                            id="terms"
                                                            checked={formData.agreeToTerms}
                                                            onCheckedChange={(checked) =>
                                                                setFormData({ ...formData, agreeToTerms: checked as boolean })
                                                            }
                                                        />
                                                        <Label htmlFor="terms" className="text-sm">
                                                            I agree to the{' '}
                                                            <Link href="/terms" className="text-blue-600 hover:underline">
                                                                Terms of Service
                                                            </Link>{' '}
                                                            and{' '}
                                                            <Link href="/privacy" className="text-blue-600 hover:underline">
                                                                Privacy Policy
                                                            </Link>
                                                        </Label>
                                                    </div>

                                                    <div className="flex items-center space-x-2">
                                                        <Checkbox
                                                            id="instructorTerms"
                                                            checked={formData.agreeToInstructorTerms}
                                                            onCheckedChange={(checked) =>
                                                                setFormData({ ...formData, agreeToInstructorTerms: checked as boolean })
                                                            }
                                                        />
                                                        <Label htmlFor="instructorTerms" className="text-sm">
                                                            I agree to the{' '}
                                                            <Link href="/instructor-terms" className="text-blue-600 hover:underline">
                                                                Instructor Agreement
                                                            </Link>{' '}
                                                            and understand the platform policies
                                                        </Label>
                                                    </div>
                                                </div>

                                                <div className="flex justify-between">
                                                    <Button type="button" variant="outline" onClick={handleBack}>
                                                        Previous
                                                    </Button>
                                                    <Button type="submit" disabled={loading}>
                                                        {loading ? (
                                                            <>
                                                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                                Submitting Application...
                                                            </>
                                                        ) : (
                                                            'Submit Application'
                                                        )}
                                                    </Button>
                                                </div>
                                            </div>
                                        )}
                                    </form>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
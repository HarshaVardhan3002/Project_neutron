'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    Calendar,
    Clock,
    Video,
    User,
    ChevronLeft,
    ChevronRight,
    Plus,
    Filter,
    CalendarDays,
    MapPin
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext.context';
import ProtectedRoute from '@/components/auth/ProtectedRoute';

interface ScheduledClass {
    id: string;
    title: string;
    instructor: string;
    instructorAvatar?: string;
    date: string;
    time: string;
    duration: number;
    type: 'video' | 'audio' | 'in-person';
    status: 'upcoming' | 'completed' | 'cancelled';
    subject: string;
    meetingLink?: string;
    location?: string;
}

function StudentScheduleContent() {
    const { user, profile } = useAuth();
    const [currentDate, setCurrentDate] = useState(new Date());
    const [viewMode, setViewMode] = useState<'month' | 'week' | 'day'>('month');
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);

    // Mock data - replace with actual API calls
    const scheduledClasses: ScheduledClass[] = [
        {
            id: '1',
            title: 'IELTS Speaking Practice',
            instructor: 'Sarah Johnson',
            date: '2024-01-20',
            time: '10:00',
            duration: 60,
            type: 'video',
            status: 'upcoming',
            subject: 'IELTS Speaking',
            meetingLink: 'https://meet.google.com/abc-def-ghi'
        },
        {
            id: '2',
            title: 'Grammar Fundamentals',
            instructor: 'Mike Chen',
            date: '2024-01-22',
            time: '14:00',
            duration: 45,
            type: 'video',
            status: 'upcoming',
            subject: 'Grammar',
            meetingLink: 'https://meet.google.com/xyz-123-456'
        },
        {
            id: '3',
            title: 'Writing Task Review',
            instructor: 'Emma Wilson',
            date: '2024-01-18',
            time: '16:30',
            duration: 30,
            type: 'video',
            status: 'completed',
            subject: 'IELTS Writing'
        },
        {
            id: '4',
            title: 'Pronunciation Workshop',
            instructor: 'David Brown',
            date: '2024-01-25',
            time: '11:00',
            duration: 90,
            type: 'video',
            status: 'upcoming',
            subject: 'Pronunciation'
        }
    ];

    const getDaysInMonth = (date: Date) => {
        const year = date.getFullYear();
        const month = date.getMonth();
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const daysInMonth = lastDay.getDate();
        const startingDayOfWeek = firstDay.getDay();

        const days = [];

        // Add empty cells for days before the first day of the month
        for (let i = 0; i < startingDayOfWeek; i++) {
            days.push(null);
        }

        // Add all days of the month
        for (let day = 1; day <= daysInMonth; day++) {
            days.push(new Date(year, month, day));
        }

        return days;
    };

    const getClassesForDate = (date: Date) => {
        const dateString = date.toISOString().split('T')[0];
        return scheduledClasses.filter(class_ => class_.date === dateString);
    };

    const getUpcomingClasses = () => {
        const now = new Date();
        return scheduledClasses
            .filter(class_ => {
                const classDate = new Date(`${class_.date}T${class_.time}`);
                return classDate > now && class_.status === 'upcoming';
            })
            .sort((a, b) => {
                const dateA = new Date(`${a.date}T${a.time}`);
                const dateB = new Date(`${b.date}T${b.time}`);
                return dateA.getTime() - dateB.getTime();
            })
            .slice(0, 5);
    };

    const navigateMonth = (direction: 'prev' | 'next') => {
        setCurrentDate(prev => {
            const newDate = new Date(prev);
            if (direction === 'prev') {
                newDate.setMonth(prev.getMonth() - 1);
            } else {
                newDate.setMonth(prev.getMonth() + 1);
            }
            return newDate;
        });
    };

    const formatTime = (time: string) => {
        const [hours, minutes] = time.split(':');
        const hour = parseInt(hours);
        const ampm = hour >= 12 ? 'PM' : 'AM';
        const displayHour = hour % 12 || 12;
        return `${displayHour}:${minutes} ${ampm}`;
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'upcoming': return 'bg-blue-100 text-blue-800';
            case 'completed': return 'bg-green-100 text-green-800';
            case 'cancelled': return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const getTypeIcon = (type: string) => {
        switch (type) {
            case 'video': return Video;
            case 'audio': return Clock;
            case 'in-person': return MapPin;
            default: return Video;
        }
    };

    const days = getDaysInMonth(currentDate);
    const upcomingClasses = getUpcomingClasses();

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold">My Schedule</h1>
                    <p className="text-muted-foreground">
                        View and manage your upcoming classes and sessions
                    </p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline">
                        <Filter className="mr-2 h-4 w-4" />
                        Filter
                    </Button>
                    <Button>
                        <Plus className="mr-2 h-4 w-4" />
                        Book Class
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Calendar */}
                <div className="lg:col-span-2">
                    <Card>
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <CardTitle className="flex items-center gap-2">
                                    <CalendarDays className="h-5 w-5" />
                                    {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                                </CardTitle>
                                <div className="flex items-center gap-2">
                                    <Button variant="outline" size="sm" onClick={() => navigateMonth('prev')}>
                                        <ChevronLeft className="h-4 w-4" />
                                    </Button>
                                    <Button variant="outline" size="sm" onClick={() => setCurrentDate(new Date())}>
                                        Today
                                    </Button>
                                    <Button variant="outline" size="sm" onClick={() => navigateMonth('next')}>
                                        <ChevronRight className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent>
                            {/* Calendar Grid */}
                            <div className="grid grid-cols-7 gap-1 mb-4">
                                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                                    <div key={day} className="p-2 text-center text-sm font-medium text-muted-foreground">
                                        {day}
                                    </div>
                                ))}
                            </div>

                            <div className="grid grid-cols-7 gap-1">
                                {days.map((day, index) => {
                                    if (!day) {
                                        return <div key={index} className="p-2 h-20"></div>;
                                    }

                                    const classes = getClassesForDate(day);
                                    const isToday = day.toDateString() === new Date().toDateString();
                                    const isSelected = selectedDate?.toDateString() === day.toDateString();

                                    return (
                                        <div
                                            key={index}
                                            className={`p-2 h-20 border rounded-lg cursor-pointer hover:bg-muted/50 transition-colors ${isToday ? 'bg-blue-50 border-blue-200' : ''
                                                } ${isSelected ? 'bg-blue-100 border-blue-300' : ''}`}
                                            onClick={() => setSelectedDate(day)}
                                        >
                                            <div className={`text-sm font-medium ${isToday ? 'text-blue-600' : ''}`}>
                                                {day.getDate()}
                                            </div>
                                            <div className="space-y-1 mt-1">
                                                {classes.slice(0, 2).map((class_, classIndex) => (
                                                    <div
                                                        key={classIndex}
                                                        className={`text-xs px-1 py-0.5 rounded truncate ${getStatusColor(class_.status)}`}
                                                    >
                                                        {formatTime(class_.time)}
                                                    </div>
                                                ))}
                                                {classes.length > 2 && (
                                                    <div className="text-xs text-muted-foreground">
                                                        +{classes.length - 2} more
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Upcoming Classes Sidebar */}
                <div className="space-y-6">
                    {/* Upcoming Classes */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Clock className="h-5 w-5" />
                                Upcoming Classes
                            </CardTitle>
                            <CardDescription>
                                Your next {upcomingClasses.length} scheduled sessions
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {upcomingClasses.length === 0 ? (
                                <div className="text-center py-8">
                                    <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                                    <p className="text-muted-foreground">No upcoming classes</p>
                                    <Button className="mt-4" size="sm">
                                        <Plus className="mr-2 h-4 w-4" />
                                        Book a Class
                                    </Button>
                                </div>
                            ) : (
                                upcomingClasses.map((class_) => {
                                    const TypeIcon = getTypeIcon(class_.type);
                                    return (
                                        <div key={class_.id} className="p-4 border rounded-lg space-y-3">
                                            <div className="flex items-start justify-between">
                                                <div className="flex-1">
                                                    <h4 className="font-medium">{class_.title}</h4>
                                                    <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                                                        <User className="h-3 w-3" />
                                                        {class_.instructor}
                                                    </div>
                                                </div>
                                                <Badge variant="outline" className={getStatusColor(class_.status)}>
                                                    {class_.status}
                                                </Badge>
                                            </div>

                                            <div className="flex items-center gap-4 text-sm">
                                                <div className="flex items-center gap-1">
                                                    <Calendar className="h-3 w-3" />
                                                    {new Date(class_.date).toLocaleDateString()}
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    <Clock className="h-3 w-3" />
                                                    {formatTime(class_.time)}
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    <TypeIcon className="h-3 w-3" />
                                                    {class_.duration}m
                                                </div>
                                            </div>

                                            <div className="flex gap-2">
                                                {class_.meetingLink && (
                                                    <Button size="sm" className="flex-1">
                                                        <Video className="mr-2 h-3 w-3" />
                                                        Join
                                                    </Button>
                                                )}
                                                <Button variant="outline" size="sm">
                                                    Details
                                                </Button>
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </CardContent>
                    </Card>

                    {/* Quick Stats */}
                    <Card>
                        <CardHeader>
                            <CardTitle>This Month</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-muted-foreground">Total Classes</span>
                                <span className="font-medium">8</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-muted-foreground">Completed</span>
                                <span className="font-medium text-green-600">5</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-muted-foreground">Upcoming</span>
                                <span className="font-medium text-blue-600">3</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-muted-foreground">Hours Learned</span>
                                <span className="font-medium">12.5</span>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Selected Date Details */}
            {selectedDate && (
                <Card>
                    <CardHeader>
                        <CardTitle>
                            Classes on {selectedDate.toLocaleDateString('en-US', {
                                weekday: 'long',
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                            })}
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {(() => {
                            const classes = getClassesForDate(selectedDate);
                            if (classes.length === 0) {
                                return (
                                    <div className="text-center py-8">
                                        <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                                        <p className="text-muted-foreground">No classes scheduled for this date</p>
                                    </div>
                                );
                            }

                            return (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {classes.map((class_) => {
                                        const TypeIcon = getTypeIcon(class_.type);
                                        return (
                                            <div key={class_.id} className="p-4 border rounded-lg">
                                                <div className="flex items-start justify-between mb-3">
                                                    <h4 className="font-medium">{class_.title}</h4>
                                                    <Badge variant="outline" className={getStatusColor(class_.status)}>
                                                        {class_.status}
                                                    </Badge>
                                                </div>

                                                <div className="space-y-2 text-sm text-muted-foreground">
                                                    <div className="flex items-center gap-2">
                                                        <User className="h-3 w-3" />
                                                        {class_.instructor}
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <Clock className="h-3 w-3" />
                                                        {formatTime(class_.time)} ({class_.duration} minutes)
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <TypeIcon className="h-3 w-3" />
                                                        {class_.type} session
                                                    </div>
                                                </div>

                                                <div className="flex gap-2 mt-4">
                                                    {class_.meetingLink && class_.status === 'upcoming' && (
                                                        <Button size="sm" className="flex-1">
                                                            <Video className="mr-2 h-3 w-3" />
                                                            Join
                                                        </Button>
                                                    )}
                                                    <Button variant="outline" size="sm">
                                                        Details
                                                    </Button>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            );
                        })()}
                    </CardContent>
                </Card>
            )}
        </div>
    );
}

export default function StudentSchedulePage() {
    return (
        <ProtectedRoute>
            <StudentScheduleContent />
        </ProtectedRoute>
    );
}
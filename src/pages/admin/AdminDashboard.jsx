import { useState } from 'react';
import { Users, Calendar, Trophy, DollarSign, TrendingUp, CheckCircle, XCircle, Clock } from 'lucide-react';
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';
import Modal from '../../components/common/Modal';

export default function AdminDashboard() {
    const [showApprovalModal, setShowApprovalModal] = useState(false);
    const [selectedRegistration, setSelectedRegistration] = useState(null);

    // Mock dashboard data
    const stats = [
        { label: 'Total Users', value: '10,234', change: '+12%', icon: Users, color: 'blue' },
        { label: 'Active Events', value: '48', change: '+5%', icon: Calendar, color: 'green' },
        { label: 'Total Revenue', value: '$45,678', change: '+18%', icon: DollarSign, color: 'purple' },
        { label: 'Tournaments', value: '23', change: '+8%', icon: Trophy, color: 'orange' },
    ];

    const pendingRegistrations = [
        { id: 1, event: 'Summer Tennis Championship', user: 'Sameer Khan', date: '2025-01-10', status: 'pending' },
        { id: 2, event: 'Basketball League Finals', user: 'Sarah Smith', date: '2025-01-11', status: 'pending' },
        { id: 3, event: 'Badminton Doubles Tournament', user: 'Mike Johnson', date: '2025-01-12', status: 'pending' },
    ];

    const recentActivity = [
        { action: 'New user registration', user: 'Alice Brown', time: '5 min ago', type: 'user' },
        { action: 'Event created', user: 'Admin', time: '1 hour ago', type: 'event' },
        { action: 'Payment received', user: 'Bob Wilson', time: '2 hours ago', type: 'payment' },
        { action: 'Match completed', user: 'Team Alpha', time: '3 hours ago', type: 'match' },
    ];

    const handleApproval = (registration, approved) => {
        alert(`Registration ${approved ? 'approved' : 'rejected'} for ${registration.user}`);
        setShowApprovalModal(false);
        setSelectedRegistration(null);
    };

    return (
        <div className="container-custom py-8 space-y-8">
            {/* Header */}
            <div>
                <h1 className="text-3xl sm:text-4xl font-display font-bold text-gray-900 mb-2">
                    Admin Dashboard
                </h1>
                <p className="text-gray-600">Manage your sports platform</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat, idx) => (
                    <Card key={idx} className="p-6 hover:shadow-xl transition-all">
                        <div className="flex items-start justify-between mb-4">
                            <div className={`w-12 h-12 bg-${stat.color}-100 rounded-xl flex items-center justify-center`}>
                                <stat.icon className={`w-6 h-6 text-${stat.color}-600`} />
                            </div>
                            <div className="flex items-center gap-1 text-green-600 text-sm font-semibold">
                                <TrendingUp className="w-4 h-4" />
                                {stat.change}
                            </div>
                        </div>
                        <div className="text-3xl font-bold text-gray-900 mb-1">{stat.value}</div>
                        <div className="text-sm text-gray-600">{stat.label}</div>
                    </Card>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Pending Registrations */}
                <Card className="p-6">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-xl font-bold text-gray-900">Pending Registrations</h2>
                        <span className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-sm font-semibold">
                            {pendingRegistrations.length} pending
                        </span>
                    </div>
                    <div className="space-y-3">
                        {pendingRegistrations.map((registration) => (
                            <div key={registration.id} className="p-4 bg-gray-50 rounded-lg">
                                <div className="flex items-start justify-between mb-2">
                                    <div>
                                        <div className="font-semibold text-gray-900">{registration.event}</div>
                                        <div className="text-sm text-gray-600">{registration.user}</div>
                                    </div>
                                    <span className="px-2 py-1 bg-orange-100 text-orange-700 rounded text-xs font-semibold">
                                        Pending
                                    </span>
                                </div>
                                <div className="text-xs text-gray-500 mb-3">
                                    Submitted: {new Date(registration.date).toLocaleDateString()}
                                </div>
                                <div className="flex gap-2">
                                    <Button
                                        variant="primary"
                                        size="sm"
                                        className="flex-1"
                                        onClick={() => {
                                            setSelectedRegistration(registration);
                                            setShowApprovalModal(true);
                                        }}
                                    >
                                        <CheckCircle className="w-4 h-4 mr-1" />
                                        Approve
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="flex-1"
                                        onClick={() => handleApproval(registration, false)}
                                    >
                                        <XCircle className="w-4 h-4 mr-1" />
                                        Reject
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>
                </Card>

                {/* Recent Activity */}
                <Card className="p-6">
                    <h2 className="text-xl font-bold text-gray-900 mb-6">Recent Activity</h2>
                    <div className="space-y-4">
                        {recentActivity.map((activity, idx) => (
                            <div key={idx} className="flex items-start gap-3 pb-4 border-b border-gray-100 last:border-0">
                                <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${activity.type === 'user' ? 'bg-blue-100' :
                                    activity.type === 'event' ? 'bg-green-100' :
                                        activity.type === 'payment' ? 'bg-purple-100' :
                                            'bg-orange-100'
                                    }`}>
                                    {activity.type === 'user' && <Users className="w-5 h-5 text-blue-600" />}
                                    {activity.type === 'event' && <Calendar className="w-5 h-5 text-green-600" />}
                                    {activity.type === 'payment' && <DollarSign className="w-5 h-5 text-purple-600" />}
                                    {activity.type === 'match' && <Trophy className="w-5 h-5 text-orange-600" />}
                                </div>
                                <div className="flex-1">
                                    <div className="font-semibold text-gray-900">{activity.action}</div>
                                    <div className="text-sm text-gray-600">{activity.user}</div>
                                    <div className="flex items-center gap-1 text-xs text-gray-500 mt-1">
                                        <Clock className="w-3 h-3" />
                                        {activity.time}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </Card>
            </div>

            {/* Quick Actions */}
            <Card className="p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-6">Quick Actions</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <Button variant="primary" className="justify-center">
                        <Calendar className="w-5 h-5 mr-2" />
                        Create Event
                    </Button>
                    <Button variant="outline" className="justify-center">
                        <Users className="w-5 h-5 mr-2" />
                        Manage Users
                    </Button>
                    <Button variant="outline" className="justify-center">
                        <Trophy className="w-5 h-5 mr-2" />
                        View Reports
                    </Button>
                    <Button variant="outline" className="justify-center">
                        <DollarSign className="w-5 h-5 mr-2" />
                        Financial Overview
                    </Button>
                </div>
            </Card>

            {/* Approval Modal */}
            {showApprovalModal && selectedRegistration && (
                <Modal
                    isOpen={showApprovalModal}
                    onClose={() => setShowApprovalModal(false)}
                    title="Approve Registration"
                >
                    <div className="space-y-4">
                        <div className="bg-gray-50 rounded-lg p-4">
                            <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Event:</span>
                                    <span className="font-medium">{selectedRegistration.event}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Participant:</span>
                                    <span className="font-medium">{selectedRegistration.user}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Date:</span>
                                    <span className="font-medium">{new Date(selectedRegistration.date).toLocaleDateString()}</span>
                                </div>
                            </div>
                        </div>

                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                            <p className="text-sm text-blue-800">
                                <strong>Note:</strong> Approving this registration will send a confirmation email to the participant.
                            </p>
                        </div>

                        <div className="flex gap-3">
                            <Button
                                variant="ghost"
                                className="flex-1"
                                onClick={() => setShowApprovalModal(false)}
                            >
                                Cancel
                            </Button>
                            <Button
                                variant="primary"
                                className="flex-1"
                                onClick={() => handleApproval(selectedRegistration, true)}
                            >
                                Confirm Approval
                            </Button>
                        </div>
                    </div>
                </Modal>
            )}
        </div>
    );
}

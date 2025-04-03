import React, { useState, useEffect } from 'react';
import { Users, UserPlus, Mail, Trash, Edit } from 'lucide-react';
import { Card, CardHeader, CardContent } from '../components/ui/Card';
import Button from '../components/ui/Button';
import Avatar from '../components/ui/Avatar';
import Modal from '../components/ui/Modal';
import Input from '../components/ui/Input';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../lib/supabase';
import { User } from '../types';
import { toast } from 'react-hot-toast';

const TeamPage: React.FC = () => {
  const { user } = useAuth();
  const [teamMembers, setTeamMembers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchTeamMembers = async () => {
      if (!user) return;
      
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*');

        if (error) throw error;
        setTeamMembers(data || []);
      } catch (error) {
        console.error('Error fetching team members:', error);
        toast.error('Failed to load team members');
      } finally {
        setLoading(false);
      }
    };

    fetchTeamMembers();
  }, [user]);

  const handleInviteUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail.trim()) return;
    
    setIsSubmitting(true);
    try {
      // In a real app, this would send an invitation email
      // For this demo, we'll just show a success message
      toast.success(`Invitation sent to ${inviteEmail}`);
      setInviteEmail('');
      setIsInviteModalOpen(false);
    } catch (error) {
      toast.error('Failed to send invitation');
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Team</h1>
        <Button
          variant="primary"
          onClick={() => setIsInviteModalOpen(true)}
          icon={<UserPlus className="h-4 w-4" />}
        >
          Invite User
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium text-gray-900">Team Members</h3>
            <span className="text-sm text-gray-500">{teamMembers.length} members</span>
          </div>
        </CardHeader>
        <CardContent>
          <ul className="divide-y divide-gray-200">
            {teamMembers.map(member => (
              <li key={member.id} className="py-4 flex items-center justify-between">
                <div className="flex items-center">
                  <Avatar
                    src={member.avatar_url}
                    name={member.full_name || member.email}
                    size="md"
                  />
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-900">
                      {member.full_name || 'Unnamed User'}
                      {member.id === user?.id && (
                        <span className="ml-2 text-xs text-blue-600">(You)</span>
                      )}
                    </p>
                    <p className="text-sm text-gray-500">{member.email}</p>
                    <p className="text-xs text-gray-500">
                      Role: {member.role.charAt(0).toUpperCase() + member.role.slice(1)}
                    </p>
                  </div>
                </div>
                {user?.role === 'admin' && member.id !== user.id && (
                  <div className="flex space-x-2">
                    <button
                      type="button"
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <Edit className="h-5 w-5" />
                    </button>
                    <button
                      type="button"
                      className="text-gray-400 hover:text-red-600"
                    >
                      <Trash className="h-5 w-5" />
                    </button>
                  </div>
                )}
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      <Modal
        isOpen={isInviteModalOpen}
        onClose={() => setIsInviteModalOpen(false)}
        title="Invite Team Member"
        size="sm"
      >
        <form onSubmit={handleInviteUser} className="space-y-4">
          <Input
            label="Email Address"
            type="email"
            value={inviteEmail}
            onChange={(e) => setInviteEmail(e.target.value)}
            placeholder="colleague@example.com"
            icon={<Mail className="h-5 w-5 text-gray-400" />}
            required
          />
          <div className="flex justify-end space-x-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsInviteModalOpen(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              isLoading={isSubmitting}
              disabled={isSubmitting}
            >
              Send Invitation
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default TeamPage;

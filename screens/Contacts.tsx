import React, { useState } from 'react';
import { Plus, Trash2, Phone, ShieldAlert, ChevronRight, X, User, Users, Loader2 } from 'lucide-react';
import { useContacts } from '../hooks/useSupabase';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { contactSchema, ContactFormData } from '../lib/validation';

export const Contacts: React.FC = () => {
  const { contacts, loading, addContact, deleteContact } = useContacts();
  const { userData, updateSettings } = useAuth();
  const [showAddModal, setShowAddModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [shareLocation, setShareLocation] = useState(userData?.settings?.shareLocationLive ?? true);

  const handleToggleShare = async () => {
    const newValue = !shareLocation;
    setShareLocation(newValue);
    await updateSettings({ shareLocationLive: newValue });
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Sei sicura di voler eliminare questo contatto?')) return;
    
    setIsDeleting(id);
    try {
      await deleteContact(id);
    } catch (err) {
      console.error('Error deleting contact:', err);
    } finally {
      setIsDeleting(null);
    }
  };

  const handleCall = (phone: string) => {
    window.open(`tel:${phone.replace(/\s/g, '')}`, '_self');
  };

  return (
    <div className="h-full flex flex-col bg-slate-50 pt-12">
      <div className="px-6 mb-6">
        <h1 className="text-2xl font-bold text-indigo-900">Cerchia di Sicurezza</h1>
        <p className="text-gray-500 text-sm">Persone che riceveranno notifiche in caso di emergenza.</p>
      </div>

      <div className="flex-1 px-4 overflow-y-auto pb-24 space-y-3">
        {/* Add New Button */}
        <button 
          onClick={() => setShowAddModal(true)}
          className="w-full bg-white border-2 border-dashed border-indigo-200 rounded-2xl p-4 flex items-center justify-center gap-2 text-indigo-600 font-medium hover:bg-indigo-50 transition-colors"
        >
          <Plus size={20} /> Aggiungi Contatto
        </button>

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="animate-spin text-indigo-600" size={32} />
          </div>
        )}

        {/* Empty State */}
        {!loading && contacts.length === 0 && (
          <div className="text-center py-12">
            <Users size={48} className="mx-auto text-gray-300 mb-4" />
            <p className="text-gray-500">Nessun contatto ancora.</p>
            <p className="text-gray-400 text-sm">Aggiungi persone fidate alla tua cerchia di sicurezza.</p>
          </div>
        )}

        {/* Contact List */}
        {contacts.map((contact) => (
          <div key={contact.id} className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
            <div className="relative">
              <img 
                src={contact.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${contact.name}`} 
                alt={contact.name} 
                className="w-14 h-14 rounded-full object-cover border border-gray-200" 
              />
              {contact.isEmergency && (
                <div className="absolute -bottom-1 -right-1 bg-red-500 rounded-full p-1 border-2 border-white">
                  <ShieldAlert size={10} className="text-white" />
                </div>
              )}
            </div>
            
            <div className="flex-1">
              <h3 className="font-bold text-gray-900">{contact.name}</h3>
              <p className="text-xs text-indigo-500 font-medium bg-indigo-50 inline-block px-2 py-0.5 rounded-md mb-1">
                {contact.role}
              </p>
              <p className="text-sm text-gray-400">{contact.phone}</p>
            </div>

            <div className="flex gap-2">
              <button 
                onClick={() => handleDelete(contact.id)}
                disabled={isDeleting === contact.id}
                className="w-9 h-9 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors disabled:opacity-50"
              >
                {isDeleting === contact.id ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <Trash2 size={16} />
                )}
              </button>
              <button 
                onClick={() => handleCall(contact.phone)}
                className="w-9 h-9 rounded-full bg-green-50 flex items-center justify-center text-green-600 hover:bg-green-100 transition-colors"
              >
                <Phone size={16} />
              </button>
            </div>
          </div>
        ))}

        {/* Settings Section */}
        <div className="mt-8 px-2">
          <h2 className="text-sm font-bold text-gray-900 mb-3 uppercase tracking-wider">Funzionalità</h2>
          <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 divide-y divide-gray-50">
            <div 
              onClick={handleToggleShare}
              className="p-4 flex items-center justify-between hover:bg-gray-50 cursor-pointer"
            >
              <span className="text-sm font-medium text-gray-700">Condividi Posizione Live</span>
              <div className={`w-10 h-6 ${shareLocation ? 'bg-indigo-600' : 'bg-gray-300'} rounded-full relative transition-colors`}>
                <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${shareLocation ? 'right-1' : 'left-1'}`}></div>
              </div>
            </div>
            <div className="p-4 flex items-center justify-between hover:bg-gray-50 cursor-pointer">
              <span className="text-sm font-medium text-gray-700">Check-in Automatici</span>
              <ChevronRight size={18} className="text-gray-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Add Contact Modal */}
      {showAddModal && (
        <AddContactModal 
          onClose={() => setShowAddModal(false)} 
          onAdd={addContact}
        />
      )}
    </div>
  );
};

// Add Contact Modal Component
interface AddContactModalProps {
  onClose: () => void;
  onAdd: (contact: Omit<import('../types').Contact, 'id' | 'userId' | 'createdAt'>) => Promise<string>;
}

const AddContactModal: React.FC<AddContactModalProps> = ({ onClose, onAdd }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      isEmergency: true
    }
  });

  const onSubmit = async (data: ContactFormData) => {
    setIsSubmitting(true);
    try {
      await onAdd({
        name: data.name,
        role: data.role,
        phone: data.phone,
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${data.name}`,
        isEmergency: data.isEmergency
      });
      onClose();
    } catch (err) {
      console.error('Error adding contact:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const roles = ['Genitore', 'Sorella', 'Fratello', 'Compagno/a', 'Amica/o', 'Collega', 'Altro'];

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-end justify-center">
      <div className="bg-white w-full max-w-md rounded-t-3xl p-6 animate-in slide-in-from-bottom duration-300">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-indigo-900">Nuovo Contatto</h2>
          <button 
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-gray-200"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input
            label="Nome"
            icon={<User size={18} />}
            placeholder="Es. Mamma"
            error={errors.name?.message}
            {...register('name')}
          />

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-gray-700 ml-1">Relazione</label>
            <select
              {...register('role')}
              className="w-full bg-white border border-gray-200 rounded-2xl py-3.5 px-4 text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            >
              {roles.map(role => (
                <option key={role} value={role}>{role}</option>
              ))}
            </select>
            {errors.role && (
              <p className="text-xs text-red-500 ml-1">{errors.role.message}</p>
            )}
          </div>

          <Input
            label="Telefono"
            type="tel"
            icon={<Phone size={18} />}
            placeholder="+39 333 1234567"
            error={errors.phone?.message}
            {...register('phone')}
          />

          <label className="flex items-center gap-3 p-4 bg-red-50 rounded-xl cursor-pointer">
            <input
              type="checkbox"
              {...register('isEmergency')}
              className="w-5 h-5 rounded border-gray-300 text-red-600 focus:ring-red-500"
            />
            <div>
              <p className="font-medium text-red-700">Contatto di Emergenza</p>
              <p className="text-xs text-red-500">Riceverà notifiche in caso di SOS</p>
            </div>
          </label>

          <Button 
            type="submit" 
            fullWidth 
            isLoading={isSubmitting}
            className="mt-6"
          >
            Aggiungi Contatto
          </Button>
        </form>
      </div>
    </div>
  );
};

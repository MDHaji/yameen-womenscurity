import React, { useState } from 'react';
import {
  UserPlus,
  Phone,
  MessageSquare,
  Trash2,
  Star,
  X,
  Check,
  Shield,
  Send,
  CloudUpload,
  CloudDownload,
} from 'lucide-react';
import { Contact } from '../types';
import { backupContactsToFirebase, fetchContactsFromFirebase } from '../lib/firebase';

interface ContactsScreenProps {
  contacts: Contact[];
  onUpdateContacts: (contacts: Contact[]) => void;
  onSendSOSMessage: (contact: Contact) => void;
}

export const ContactsScreen: React.FC<ContactsScreenProps> = ({
  contacts,
  onUpdateContacts,
  onSendSOSMessage,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [relation, setRelation] = useState('Parent');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [syncStatus, setSyncStatus] = useState<string | null>(null);

  const handleBackupToFirebase = async () => {
    setSyncStatus('Backing up...');
    const ok = await backupContactsToFirebase(contacts);
    if (ok) {
      setSyncStatus('Backed up to Cloud!');
    } else {
      setSyncStatus('Backup failed (offline)');
    }
    setTimeout(() => setSyncStatus(null), 2500);
  };

  const handleRestoreFromFirebase = async () => {
    setSyncStatus('Restoring...');
    const fetched = await fetchContactsFromFirebase();
    if (fetched.length > 0) {
      onUpdateContacts(fetched);
      setSyncStatus(`Restored ${fetched.length} contacts!`);
    } else {
      setSyncStatus('No cloud backup found');
    }
    setTimeout(() => setSyncStatus(null), 2500);
  };

  const handleOpenAdd = () => {
    setEditingId(null);
    setName('');
    setPhone('');
    setRelation('Parent');
    setIsModalOpen(true);
  };

  const handleSaveContact = () => {
    if (!name.trim() || !phone.trim()) return;

    if (editingId) {
      const updated = contacts.map((c) =>
        c.id === editingId
          ? { ...c, name: name.trim(), phone: phone.trim(), relation }
          : c
      );
      onUpdateContacts(updated);
    } else {
      const newContact: Contact = {
        id: String(Date.now()),
        name: name.trim(),
        phone: phone.trim(),
        relation,
        isPrimary: contacts.length === 0,
      };
      onUpdateContacts([...contacts, newContact]);
    }
    setIsModalOpen(false);
  };

  const handleDelete = (id: string) => {
    const updated = contacts.filter((c) => c.id !== id);
    if (updated.length > 0 && !updated.some((c) => c.isPrimary)) {
      updated[0].isPrimary = true;
    }
    onUpdateContacts(updated);
  };

  const handleSetPrimary = (id: string) => {
    const updated = contacts.map((c) => ({
      ...c,
      isPrimary: c.id === id,
    }));
    onUpdateContacts(updated);
  };

  const handlePreloadDefaults = () => {
    const sample: Contact[] = [
      {
        id: '1',
        name: 'Mom / Family',
        phone: '+91 98765 43210',
        relation: 'Mother',
        isPrimary: true,
      },
      {
        id: '2',
        name: 'Police Control Room',
        phone: '112',
        relation: 'Emergency',
        isPrimary: false,
      },
      {
        id: '3',
        name: 'Best Friend / Roommate',
        phone: '+91 91234 56789',
        relation: 'Friend',
        isPrimary: false,
      },
    ];
    onUpdateContacts(sample);
  };

  return (
    <div className="space-y-4 pb-24 animate-in fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            Emergency Contacts
            <span className="text-xs px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 font-semibold">
              {contacts.length}
            </span>
          </h2>
          <p className="text-xs text-zinc-400">These people receive your live GPS in 1-tap SOS</p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="px-3 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-semibold text-xs flex items-center gap-1.5 shadow-lg shadow-rose-600/30 active:scale-95 transition"
        >
          <UserPlus className="w-4 h-4" /> Add
        </button>
      </div>

      {/* Cloud Sync Status Bar */}
      <div className="p-2.5 rounded-xl bg-white/5 border border-white/5 flex items-center justify-between text-xs">
        <div className="flex items-center gap-2 text-zinc-300">
          <span className="text-amber-400">🔥</span>
          <span className="text-[11px]">
            {syncStatus ? <span className="text-emerald-400 font-semibold">{syncStatus}</span> : 'Firebase Cloud Sync'}
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <button
            onClick={handleBackupToFirebase}
            className="px-2 py-1 rounded-lg bg-white/10 hover:bg-white/15 text-zinc-200 text-[11px] font-semibold flex items-center gap-1"
            title="Backup to Firebase"
          >
            <CloudUpload className="w-3 h-3 text-amber-400" /> Backup
          </button>
          <button
            onClick={handleRestoreFromFirebase}
            className="px-2 py-1 rounded-lg bg-white/10 hover:bg-white/15 text-zinc-200 text-[11px] font-semibold flex items-center gap-1"
            title="Restore from Firebase"
          >
            <CloudDownload className="w-3 h-3 text-emerald-400" /> Restore
          </button>
        </div>
      </div>

      {contacts.length === 0 ? (
        <div className="p-8 rounded-2xl bg-[#141528] border border-white/5 text-center">
          <div className="w-14 h-14 mx-auto rounded-full bg-rose-500/10 text-rose-400 flex items-center justify-center mb-3">
            <Shield className="w-7 h-7" />
          </div>
          <h3 className="text-sm font-bold text-white">No emergency contacts yet</h3>
          <p className="text-xs text-zinc-400 mt-1 max-w-xs mx-auto">
            Add close friends, family members, or local helpline numbers so they can be alerted instantly.
          </p>
          <div className="mt-4 flex flex-col sm:flex-row justify-center gap-2">
            <button
              onClick={handleOpenAdd}
              className="px-4 py-2 rounded-xl bg-rose-600 text-white text-xs font-semibold hover:bg-rose-500"
            >
              Add Your First Contact
            </button>
            <button
              onClick={handlePreloadDefaults}
              className="px-4 py-2 rounded-xl bg-white/10 text-zinc-300 text-xs font-semibold hover:bg-white/15"
            >
              Load Example Contacts
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-2.5">
          {contacts.map((c) => (
            <div
              key={c.id}
              className={`p-3.5 rounded-2xl border transition ${
                c.isPrimary
                  ? 'bg-rose-950/20 border-rose-500/30'
                  : 'bg-[#141528] border-white/5 hover:border-white/10'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-11 h-11 rounded-2xl flex items-center justify-center font-bold text-base ${
                      c.isPrimary
                        ? 'bg-gradient-to-tr from-rose-600 to-red-500 text-white shadow-md shadow-rose-600/30'
                        : 'bg-white/10 text-zinc-200'
                    }`}
                  >
                    {c.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-sm text-white">{c.name}</span>
                      {c.isPrimary && (
                        <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30 flex items-center gap-1">
                          <Star className="w-2.5 h-2.5 fill-current" /> Primary
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-zinc-400 font-mono mt-0.5">{c.phone}</div>
                    <span className="text-[10px] text-zinc-500">{c.relation}</span>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  {!c.isPrimary && (
                    <button
                      onClick={() => handleSetPrimary(c.id)}
                      className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-amber-400"
                      title="Set as primary"
                    >
                      <Star className="w-4 h-4" />
                    </button>
                  )}
                  <button
                    onClick={() => handleDelete(c.id)}
                    className="p-2 rounded-xl bg-white/5 hover:bg-red-500/20 text-zinc-400 hover:text-red-400"
                    title="Delete contact"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Direct action triggers */}
              <div className="mt-3 pt-3 border-t border-white/5 grid grid-cols-2 gap-2">
                <a
                  href={`tel:${c.phone.replace(/\s+/g, '')}`}
                  className="py-2 px-3 rounded-xl bg-white/5 hover:bg-white/10 text-zinc-200 text-xs font-semibold flex items-center justify-center gap-2 active:scale-98 transition"
                >
                  <Phone className="w-3.5 h-3.5 text-emerald-400" />
                  Call Directly
                </a>
                <button
                  onClick={() => onSendSOSMessage(c)}
                  className="py-2 px-3 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 text-xs font-semibold flex items-center justify-center gap-2 active:scale-98 transition"
                >
                  <Send className="w-3.5 h-3.5 text-emerald-400" />
                  Send WhatsApp SOS
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-sm rounded-2xl bg-[#181930] border border-white/10 p-5 shadow-2xl animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-4">
              <h3 className="font-bold text-white text-sm">Add Emergency Contact</h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-full text-zinc-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-xs text-zinc-400 block mb-1">Full Name</label>
                <input
                  type="text"
                  placeholder="e.g. Sister, Mom, Friend"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-white outline-none focus:border-rose-500"
                />
              </div>

              <div>
                <label className="text-xs text-zinc-400 block mb-1">Phone Number (with country code)</label>
                <input
                  type="tel"
                  placeholder="e.g. +91 98765 43210"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-white outline-none focus:border-rose-500 font-mono"
                />
              </div>

              <div>
                <label className="text-xs text-zinc-400 block mb-1">Relationship</label>
                <select
                  value={relation}
                  onChange={(e) => setRelation(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-[#141528] border border-white/10 text-sm text-white outline-none focus:border-rose-500"
                >
                  <option value="Parent">Parent</option>
                  <option value="Mother">Mother</option>
                  <option value="Father">Father</option>
                  <option value="Sister">Sister</option>
                  <option value="Brother">Brother</option>
                  <option value="Spouse">Spouse / Partner</option>
                  <option value="Friend">Friend</option>
                  <option value="Colleague">Colleague / Roommate</option>
                  <option value="Emergency Authority">Emergency Authority / Police</option>
                </select>
              </div>
            </div>

            <div className="flex gap-2 mt-5">
              <button
                onClick={() => setIsModalOpen(false)}
                className="flex-1 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-zinc-300 font-semibold text-xs"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveContact}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-semibold text-xs flex items-center justify-center gap-1.5 shadow-lg shadow-rose-600/30"
              >
                <Check className="w-4 h-4" /> Save Contact
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

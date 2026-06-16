import { useState, useCallback } from 'react';
import type { DeviceContact } from '../../../models/mobileDevice';

/**
 * 管理联系人列表、从 NPC 同步
 */
export function useDeviceContacts() {
    const [contacts, setContacts] = useState<DeviceContact[]>([]);
    const loading = false;

    const setContactsList = useCallback((list: DeviceContact[]) => {
        setContacts(list);
    }, []);

    const addContact = useCallback((contact: DeviceContact) => {
        setContacts((prev) => [...prev, contact]);
    }, []);

    const removeContact = useCallback((id: string) => {
        setContacts((prev) => prev.filter((c) => c.id !== id));
    }, []);

    return { contacts, setContactsList, addContact, removeContact, loading };
}

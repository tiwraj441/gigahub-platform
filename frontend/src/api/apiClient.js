/**const BASE = import.meta.env.VITE_API_BASE || 'http://localhost:5000/api';

export async function fetchProducts() {
  const res = await fetch(`${BASE}/products`);
  if (!res.ok) throw new Error('Failed to fetch');
  return res.json();
}

export async function submitLead(data) {
  const res = await fetch(`${BASE}/leads`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  return res.json();
}**/
import axios from 'axios';
const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:5000';

export const sendContact = (payload) => axios.post(`${API_BASE}/api/contact`, payload);
export const submitLead = (payload) => axios.post(`${API_BASE}/api/contact`, payload);
export const LoginSignup = (payload) => axios.post(`${API_BASE}/api/auth/LoginSignup`, payload);
export const getContacts = (token) => axios.get(`${API_BASE}/api/admin/contacts`, { headers: { Authorization: `Bearer ${token}` } });
export const getUsers = (token) => axios.get(`${API_BASE}/api/admin/users`, { headers: { Authorization: `Bearer ${token}` } });


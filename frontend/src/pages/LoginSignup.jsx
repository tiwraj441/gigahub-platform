import React, {useState} from 'react';
import { LoginSignup } from '../api/apiClient';
import { useNavigate } from 'react-router-dom';

export default function Login(){
  const [form,setForm]=useState({email:'',password:''});
  const [err,setErr]=useState(null);
  const nav = useNavigate();
  const handle = e => setForm({...form,[e.target.name]: e.target.value});
  const submit = async e => {
    e.preventDefault(); setErr(null);
    try{
      const res = await LoginSignup(form);
      localStorage.setItem("token", res.data.token);
      nav('/admin');
    }catch(err){ setErr(err.response?.data?.error || 'Login failed'); }
  }
  return (
    <section className="container mx-auto px-6 py-12">
      <h2 className="text-2xl font-bold">Admin Login</h2>
      <form onSubmit={submit} className="mt-6 max-w-md">
        <input name="email" value={form.email} onChange={handle} placeholder="Email" className="w-full p-2 border mb-2" required />
        <input name="password" value={form.password} onChange={handle} placeholder="Password" type="password" className="w-full p-2 border mb-2" required />
        <button className="px-4 py-2 bg-blue-600 text-white">Login</button>
        {err && <div className="mt-2 text-red-600">{err}</div>}
      </form>
    </section>
  )
}

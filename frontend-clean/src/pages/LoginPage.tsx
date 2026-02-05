import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Input, Card, CardHeader, CardTitle, CardDescription, CardContent, Label, RadioGroup, RadioGroupItem } from '@/ui';
import apiService from '../services/api.service';
import { toast } from 'sonner';
import { useAuth } from '../context/AuthContext';

export function LoginPage(): React.ReactElement {
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [name, setName] = useState('');
  const [mobile, setMobile] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'farmer' | 'distributor'>('farmer');
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const { login } = useAuth();

  const isSignup = mode === 'signup';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!mobile || !password) {
      toast.error('Fill all fields');
      return;
    }

    if (isSignup && !name) {
      toast.error('Enter your name');
      return;
    }

    setLoading(true);

    try {
      let response;

      if (isSignup) {
        response = await apiService.register({
          name,
          mobile,
          password,
          role,
        });
        toast.success('Account created successfully!');
      } else {
        response = await apiService.login({
          mobile,
          password,
        });
        toast.success('Logged in successfully!');
      }

      const { token, user } = response.data;
      login(token, user);
      navigate('/dashboard');

    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-green-50 to-blue-50 p-8 flex items-center justify-center">
      <div className="w-full max-w-xl">
        <Card>
          <CardHeader className="text-center">
            <div className="flex justify-center gap-2 mb-4">
              <button onClick={() => setMode('signin')} className={mode === 'signin' ? 'font-bold' : ''}>Sign In</button>
              <button onClick={() => setMode('signup')} className={mode === 'signup' ? 'font-bold' : ''}>Sign Up</button>
            </div>
            <CardTitle>{isSignup ? 'Create Account' : 'Welcome Back'}</CardTitle>
            <CardDescription>
              {isSignup ? 'Register to start using the platform' : 'Login to continue'}
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">

              {isSignup && (
                <div>
                  <Label>Name</Label>
                  <Input value={name} onChange={(e) => setName(e.target.value)} />
                </div>
              )}

              <div>
                <Label>Mobile</Label>
                <Input value={mobile} onChange={(e) => setMobile(e.target.value)} />
              </div>

              <div>
                <Label>Password</Label>
                <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
              </div>

              {isSignup && (
                <div>
                  <Label>Role</Label>
                  <RadioGroup value={role} onValueChange={(v) => setRole(v as any)}>
                    <div className="flex gap-3">
                      <RadioGroupItem value="farmer" id="farmer" />
                      <Label htmlFor="farmer">Farmer</Label>

                      <RadioGroupItem value="distributor" id="distributor" />
                      <Label htmlFor="distributor">Distributor</Label>
                    </div>
                  </RadioGroup>
                </div>
              )}

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Please wait...' : isSignup ? 'Create Account' : 'Login'}
              </Button>

            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
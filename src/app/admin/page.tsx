"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { LogOut, Package, ShoppingBag, DollarSign, TrendingUp, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';

interface Stats {
  totalProducts: number;
  totalOrders: number;
  totalRevenue: number;
  recentOrders: any[];
}

export default function AdminDashboard() {
  const router = useRouter();
  const [authenticated, setAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<Stats>({
    totalProducts: 0,
    totalOrders: 0,
    totalRevenue: 0,
    recentOrders: [],
  });

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      // Get token from localStorage
      const token = localStorage.getItem('admin_token');
      
      if (!token) {
        console.log('No token found, redirecting to login');
        window.location.href = '/admin/login';
        return;
      }

      // Verify token with backend
      const response = await fetch('/api/auth/verify', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        console.log('Auth verified successfully');
        setAuthenticated(true);
        setLoading(false);
        loadStats();
      } else {
        console.log('Auth verification failed, clearing token');
        localStorage.removeItem('admin_token');
        window.location.href = '/admin/login';
      }
    } catch (error) {
      console.error('Auth check error:', error);
      localStorage.removeItem('admin_token');
      window.location.href = '/admin/login';
    }
  };

  const loadStats = async () => {
    try {
      const [productsRes, ordersRes] = await Promise.all([
        fetch('/api/products?limit=100'),
        fetch('/api/orders?limit=100'),
      ]);

      const products = await productsRes.json();
      const orders = await ordersRes.json();

      // Filter out any null/undefined orders and ensure total exists
      const validOrders = orders.filter((o: any) => o && typeof o === 'object');

      const totalRevenue = validOrders
        .filter((o: any) => o.paymentStatus === 'completed' && typeof o.total === 'number')
        .reduce((sum: number, o: any) => sum + o.total, 0);

      setStats({
        totalProducts: products.length,
        totalOrders: validOrders.length,
        totalRevenue,
        recentOrders: validOrders.slice(0, 5),
      });
    } catch (error) {
      console.error('Failed to load stats:', error);
    }
  };

  const handleLogout = async () => {
    try {
      localStorage.removeItem('admin_token');
      await fetch('/api/auth/logout', { method: 'POST' });
      toast.success('Logged out successfully');
      window.location.href = '/admin/login';
    } catch (error) {
      toast.error('Failed to logout');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-lg">Verifying authentication...</div>
      </div>
    );
  }

  if (!authenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-lg">Redirecting to login...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold">Admin Dashboard</h1>
          <Button variant="outline" onClick={handleLogout}>
            <LogOut className="mr-2 h-4 w-4" />
            Logout
          </Button>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Products</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalProducts}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
              <ShoppingBag className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalOrders}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${(stats.totalRevenue || 0).toFixed(2)}</div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
          <Button
            className="h-24 admin-button"
            onClick={() => router.push('/admin/bulk-upload')}
          >
            <div className="text-center">
              <Upload className="h-8 w-8 mx-auto mb-2" />
              <div className="font-semibold">Bulk Upload</div>
              <div className="text-xs opacity-90">Upload 100 pics</div>
            </div>
          </Button>

          <Button
            className="h-24 admin-button"
            onClick={() => router.push('/admin/upload')}
          >
            <div className="text-center">
              <TrendingUp className="h-8 w-8 mx-auto mb-2" />
              <div>Single Upload</div>
            </div>
          </Button>

          <Button
            className="h-24 admin-button"
            onClick={() => router.push('/admin/products')}
          >
            <div className="text-center">
              <Package className="h-8 w-8 mx-auto mb-2" />
              <div>Manage Products</div>
            </div>
          </Button>

          <Button
            className="h-24 admin-button"
            onClick={() => router.push('/admin/orders')}
          >
            <div className="text-center">
              <ShoppingBag className="h-8 w-8 mx-auto mb-2" />
              <div>View Orders</div>
            </div>
          </Button>

          <Button
            className="h-24 admin-button"
            onClick={() => router.push('/admin/settings')}
          >
            <div className="text-center">
              <DollarSign className="h-8 w-8 mx-auto mb-2" />
              <div>Settings</div>
            </div>
          </Button>
        </div>

        {/* Recent Orders */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Orders</CardTitle>
          </CardHeader>
          <CardContent>
            {stats.recentOrders.length === 0 ? (
              <p className="text-muted-foreground">No orders yet</p>
            ) : (
              <div className="space-y-4">
                {stats.recentOrders.map((order) => (
                  <div key={order.id} className="flex items-center justify-between border-b border-border pb-4">
                    <div>
                      <p className="font-semibold">{order.orderNumber || 'N/A'}</p>
                      <p className="text-sm text-muted-foreground">{order.customerName || 'Unknown'}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-primary">${(order.total || 0).toFixed(2)}</p>
                      <p className="text-sm text-muted-foreground">{order.status || 'pending'}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
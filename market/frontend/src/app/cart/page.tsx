'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { mockShrimps } from '@/data/mock';
import { 
  ShoppingCart, 
  Trash2, 
  Plus, 
  Minus, 
  ArrowLeft,
  CreditCard,
  Wallet,
  Truck
} from 'lucide-react';

export default function CartPage() {
  const [cartItems, setCartItems] = useState([
    { shrimp: mockShrimps[0], quantity: 1 },
    { shrimp: mockShrimps[2], quantity: 1 },
  ]);

  const updateQuantity = (id: string, delta: number) => {
    setCartItems(items =>
      items.map(item => {
        if (item.shrimp.id === id) {
          const newQuantity = Math.max(1, item.quantity + delta);
          return { ...item, quantity: newQuantity };
        }
        return item;
      })
    );
  };

  const removeItem = (id: string) => {
    setCartItems(items => items.filter(item => item.shrimp.id !== id));
  };

  const subtotal = cartItems.reduce((sum, item) => sum + item.shrimp.price * item.quantity, 0);
  const fee = Math.floor(subtotal * 0.02);
  const total = subtotal + fee;

  return (
    <div className="min-h-screen bg-slate-900 py-8 px-4 sm:px-6 lg:px-8 relative">
      {/* Scanline effect */}
      <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(transparent_1px,transparent_1px),linear-gradient(90deg,rgba(0,255,255,0.03)_1px,transparent_1px),linear-gradient(rgba(0,255,255,0.03)_1px,transparent_1px)] bg-[size:4px_4px,30px_30px,30px_30px] z-0" />
      <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-transparent via-cyan-500/5 to-transparent z-0" />
      
      <div className="max-w-6xl mx-auto relative z-10">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link href="/">
            <Button variant="ghost" size="icon" className="text-cyan-400 hover:text-cyan-300 hover:bg-cyan-500/10">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <h1 className="text-2xl font-bold neon-text">购物车</h1>
          <Badge variant="secondary" className="bg-cyan-500/20 text-cyan-300 border-cyan-500/30">{cartItems.length}</Badge>
        </div>

        {cartItems.length === 0 ? (
          <Card className="glass-effect p-12">
            <div className="text-center">
              <ShoppingCart className="w-16 h-16 mx-auto mb-4 text-cyan-400/50" />
              <h2 className="text-xl font-semibold mb-2 text-cyan-100">购物车是空的</h2>
              <p className="text-gray-400 mb-6">快去挑选心仪的虾群吧！</p>
              <Link href="/">
                <Button className="cyber-button bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-400 hover:to-purple-400">
                  去逛逛
                </Button>
              </Link>
            </div>
          </Card>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              {cartItems.map((item) => (
                <Card key={item.shrimp.id} className="glass-effect hover:border-cyan-500/30 transition-all duration-300 hover:shadow-[0_0_20px_rgba(0,255,255,0.1)]">
                  <CardContent className="p-4">
                    <div className="flex gap-4">
                      <div className="w-24 h-24 rounded-lg bg-gradient-to-br from-purple-900/50 to-cyan-900/50 flex items-center justify-center text-4xl flex-shrink-0 border border-cyan-500/20">
                        {item.shrimp.image}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h3 className="font-semibold text-lg text-cyan-100">{item.shrimp.name}</h3>
                            <p className="text-sm text-gray-400">{item.shrimp.description}</p>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-gray-500 hover:text-red-400 hover:bg-red-500/10"
                            onClick={() => removeItem(item.shrimp.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-8 w-8 border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/20"
                              onClick={() => updateQuantity(item.shrimp.id, -1)}
                            >
                              <Minus className="w-3 h-3" />
                            </Button>
                            <span className="w-8 text-center font-semibold text-cyan-100">{item.quantity}</span>
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-8 w-8 border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/20"
                              onClick={() => updateQuantity(item.shrimp.id, 1)}
                            >
                              <Plus className="w-3 h-3" />
                            </Button>
                          </div>
                          <div className="text-right">
                            <p className="text-xl font-bold text-pink-400">
                              ¥{item.shrimp.price * item.quantity}
                            </p>
                            <p className="text-sm text-gray-400">
                              ¥{item.shrimp.price} × {item.quantity}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Order Summary */}
            <div className="space-y-4">
              <Card className="glass-effect">
                <CardHeader>
                  <CardTitle className="text-lg text-cyan-100">订单摘要</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-gray-400">商品小计</span>
                    <span className="text-cyan-100">¥{subtotal}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">交易手续费 (2%)</span>
                    <span className="text-cyan-100">¥{fee}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">运费</span>
                    <Badge variant="secondary" className="bg-purple-500/20 text-purple-300 border-purple-500/30">免运费</Badge>
                  </div>
                  <Separator className="bg-cyan-500/20" />
                  <div className="flex justify-between text-lg font-bold">
                    <span className="text-cyan-100">总计</span>
                    <span className="text-pink-400">¥{total}</span>
                  </div>
                </CardContent>
              </Card>

              {/* Payment Methods */}
              <Card className="glass-effect">
                <CardHeader>
                  <CardTitle className="text-lg text-cyan-100">支付方式</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button variant="outline" className="w-full justify-start gap-3 h-auto py-3 border-cyan-500/30 text-cyan-100 hover:bg-cyan-500/20">
                    <div className="w-10 h-10 rounded-full bg-blue-900/50 flex items-center justify-center">
                      <Wallet className="w-5 h-5 text-blue-400" />
                    </div>
                    <div className="text-left">
                      <p className="font-medium">钱包余额</p>
                      <p className="text-sm text-gray-400">¥5,000 可用</p>
                    </div>
                  </Button>
                  <Button variant="outline" className="w-full justify-start gap-3 h-auto py-3 border-cyan-500/30 text-cyan-100 hover:bg-cyan-500/20">
                    <div className="w-10 h-10 rounded-full bg-green-900/50 flex items-center justify-center">
                      <CreditCard className="w-5 h-5 text-green-400" />
                    </div>
                    <div className="text-left">
                      <p className="font-medium">银行卡</p>
                      <p className="text-sm text-gray-400">添加银行卡支付</p>
                    </div>
                  </Button>
                </CardContent>
              </Card>

              {/* Address */}
              <Card className="glass-effect">
                <CardHeader>
                  <CardTitle className="text-lg text-cyan-100">收货地址</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center flex-shrink-0 border border-cyan-500/20">
                      <Truck className="w-5 h-5 text-cyan-400" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-cyan-100">虾大师</p>
                      <p className="text-sm text-gray-400">138****8888</p>
                      <p className="text-sm text-gray-400">
                        北京市朝阳区虾群大厦 1001 室
                      </p>
                    </div>
                    <Button variant="ghost" size="sm" className="text-cyan-400 hover:text-cyan-300 hover:bg-cyan-500/10">
                      修改
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Button className="w-full h-12 cyber-button bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-400 hover:to-purple-400 text-lg">
                确认支付 ¥{total}
              </Button>

              <p className="text-xs text-center text-gray-500">
                点击支付即表示您同意我们的服务条款和隐私政策
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

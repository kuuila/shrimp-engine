'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { mockUser, mockShrimps, mockLeaderboard } from '@/data/mock';
import { 
  User, 
  Wallet, 
  Trophy, 
  Sword, 
  Settings, 
  Bell,
  CreditCard,
  LogOut,
  ChevronRight,
  Shield,
  Mail,
  Phone,
  Shell,
  Star,
  TrendingUp
} from 'lucide-react';

export default function UserPage() {
  const userShrimps = mockShrimps.filter(s => mockUser.shrimps.includes(s.id));
  const userRank = mockLeaderboard.find(l => l.userId === 'current-user');

  return (
    <div className="min-h-screen bg-slate-900 py-8 px-4 sm:px-6 lg:px-8 relative">
      {/* Scanline effect */}
      <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(transparent_1px,transparent_1px),linear-gradient(90deg,rgba(0,255,255,0.03)_1px,transparent_1px),linear-gradient(rgba(0,255,255,0.03)_1px,transparent_1px)] bg-[size:4px_4px,30px_30px,30px_30px] z-0" />
      <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-transparent via-pink-500/5 to-transparent z-0" />
      
      <div className="max-w-6xl mx-auto space-y-6 relative z-10">
        {/* Profile Card */}
        <Card className="glass-effect overflow-hidden">
          <div className="h-32 bg-gradient-to-r from-pink-500 via-purple-500 to-cyan-500" />
          <CardContent className="relative pb-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-end gap-4 -mt-12">
              <Avatar className="w-24 h-24 border-4 border-slate-900 shadow-[0_0_20px_rgba(0,255,255,0.3)]">
                <AvatarFallback className="text-4xl bg-gradient-to-br from-pink-400 to-purple-500">
                  {mockUser.avatar}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-1">
                  <h1 className="text-2xl font-bold text-cyan-100">{mockUser.name}</h1>
                  <Badge className="bg-gradient-to-r from-pink-500 to-purple-500 shadow-[0_0_10px_rgba(236,72,153,0.5)]">Lv.{mockUser.level}</Badge>
                </div>
                <p className="text-gray-400">虾群大师 · 加入于 2024年1月</p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="icon" className="border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/20">
                  <Bell className="w-4 h-4" />
                </Button>
                <Button variant="outline" size="icon" className="border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/20">
                  <Settings className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6">
              <div className="p-4 rounded-xl bg-slate-800/50 text-center border border-cyan-500/20 hover:border-cyan-500/40 transition-all">
                <p className="text-2xl font-bold text-pink-400">{mockUser.coins.toLocaleString()}</p>
                <p className="text-sm text-gray-400">金币</p>
              </div>
              <div className="p-4 rounded-xl bg-slate-800/50 text-center border border-cyan-500/20 hover:border-cyan-500/40 transition-all">
                <p className="text-2xl font-bold text-cyan-400">{userShrimps.length}</p>
                <p className="text-sm text-gray-400">虾群</p>
              </div>
              <div className="p-4 rounded-xl bg-slate-800/50 text-center border border-cyan-500/20 hover:border-cyan-500/40 transition-all">
                <p className="text-2xl font-bold text-green-400">{mockUser.wins}</p>
                <p className="text-sm text-gray-400">胜利</p>
              </div>
              <div className="p-4 rounded-xl bg-slate-800/50 text-center border border-cyan-500/20 hover:border-cyan-500/40 transition-all">
                <p className="text-2xl font-bold text-purple-400">#{userRank?.rank || '-'}</p>
                <p className="text-sm text-gray-400">排名</p>
              </div>
            </div>

            {/* Level Progress */}
            <div className="mt-6 p-4 rounded-xl bg-slate-800/50 border border-cyan-500/20">
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-400">升级进度</span>
                <span className="text-cyan-100">{mockUser.level} → {mockUser.level + 1}</span>
              </div>
              <Progress value={65} className="h-2 bg-slate-700 [&>div]:bg-gradient-to-r [&>div]:from-cyan-500 [&>div]:to-purple-500" />
              <p className="text-xs text-gray-500 mt-2">再获得 3500 经验值即可升级</p>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <Button variant="outline" className="h-auto py-4 flex-col gap-2 border-cyan-500/30 text-cyan-100 hover:bg-cyan-500/20 hover:border-cyan-500/50">
            <Wallet className="w-6 h-6 text-green-400" />
            <span>充值</span>
          </Button>
          <Button variant="outline" className="h-auto py-4 flex-col gap-2 border-cyan-500/30 text-cyan-100 hover:bg-cyan-500/20 hover:border-cyan-500/50">
            <CreditCard className="w-6 h-6 text-blue-400" />
            <span>提现</span>
          </Button>
          <Button variant="outline" className="h-auto py-4 flex-col gap-2 border-cyan-500/30 text-cyan-100 hover:bg-cyan-500/20 hover:border-cyan-500/50">
            <Trophy className="w-6 h-6 text-yellow-400" />
            <span>排行榜</span>
          </Button>
          <Button variant="outline" className="h-auto py-4 flex-col gap-2 border-cyan-500/30 text-cyan-100 hover:bg-cyan-500/20 hover:border-cyan-500/50">
            <Sword className="w-6 h-6 text-pink-400" />
            <span>对战</span>
          </Button>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="shrimps" className="w-full">
          <TabsList className="w-full bg-slate-800/50 border border-cyan-500/20">
            <TabsTrigger value="shrimps" className="flex-1 data-[state=active]:bg-cyan-500/20 data-[state=active]:text-cyan-400">我的虾群 ({userShrimps.length})</TabsTrigger>
            <TabsTrigger value="orders" className="flex-1 data-[state=active]:bg-cyan-500/20 data-[state=active]:text-cyan-400">订单记录</TabsTrigger>
            <TabsTrigger value="settings" className="flex-1 data-[state=active]:bg-cyan-500/20 data-[state=active]:text-cyan-400">设置</TabsTrigger>
          </TabsList>

          <TabsContent value="shrimps" className="mt-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {userShrimps.map((shrimp) => (
                <Card key={shrimp.id} className="glass-effect overflow-hidden hover:border-cyan-500/30 transition-all duration-300 hover:shadow-[0_0_20px_rgba(0,255,255,0.1)]">
                  <CardContent className="p-4">
                    <div className="flex gap-4">
                      <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-purple-900/50 to-cyan-900/50 flex items-center justify-center text-3xl border border-cyan-500/20">
                        {shrimp.image}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-cyan-100">{shrimp.name}</h3>
                        <Badge variant="secondary" className="mt-1 bg-purple-500/20 text-purple-300 border-purple-500/30">{shrimp.rarity}</Badge>
                        <div className="flex gap-3 mt-2 text-sm text-gray-400">
                          <span>⚔️ {shrimp.power}</span>
                          <span>⚡ {shrimp.speed}</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="orders" className="mt-6">
            <Card className="glass-effect">
              <CardContent className="p-6 text-center text-gray-400">
                <Shell className="w-12 h-12 mx-auto mb-3 opacity-50 text-cyan-400" />
                <p>暂无订单记录</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings" className="mt-6">
            <Card className="glass-effect">
              <CardContent className="p-0">
                <div className="divide-y divide-cyan-500/20">
                  <Button variant="ghost" className="w-full justify-between h-auto py-4 px-6 rounded-none text-cyan-100 hover:bg-cyan-500/10">
                    <div className="flex items-center gap-3">
                      <User className="w-5 h-5 text-cyan-400" />
                      <span>个人信息</span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-gray-500" />
                  </Button>
                  <Button variant="ghost" className="w-full justify-between h-auto py-4 px-6 rounded-none text-cyan-100 hover:bg-cyan-500/10">
                    <div className="flex items-center gap-3">
                      <Mail className="w-5 h-5 text-cyan-400" />
                      <span>邮箱设置</span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-gray-500" />
                  </Button>
                  <Button variant="ghost" className="w-full justify-between h-auto py-4 px-6 rounded-none text-cyan-100 hover:bg-cyan-500/10">
                    <div className="flex items-center gap-3">
                      <Phone className="w-5 h-5 text-cyan-400" />
                      <span>手机绑定</span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-gray-500" />
                  </Button>
                  <Button variant="ghost" className="w-full justify-between h-auto py-4 px-6 rounded-none text-cyan-100 hover:bg-cyan-500/10">
                    <div className="flex items-center gap-3">
                      <Shield className="w-5 h-5 text-cyan-400" />
                      <span>安全设置</span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-gray-500" />
                  </Button>
                  <Button variant="ghost" className="w-full justify-between h-auto py-4 px-6 rounded-none text-red-400 hover:bg-red-500/10">
                    <div className="flex items-center gap-3">
                      <LogOut className="w-5 h-5" />
                      <span>退出登录</span>
                    </div>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

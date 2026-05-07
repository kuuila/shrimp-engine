import { notFound } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { mockShrimps, mockUser } from '@/data/mock';
import { 
  ShoppingCart, 
  Heart, 
  Share2, 
  Sword, 
  Zap, 
  Shield, 
  Clock,
  User,
  Trophy
} from 'lucide-react';

interface ShrimpDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function ShrimpDetailPage({ params }: ShrimpDetailPageProps) {
  const { id } = await params;
  const shrimp = mockShrimps.find((s) => s.id === id);
  
  if (!shrimp) {
    notFound();
  }

  const rarityConfig = {
    common: { label: '普通', className: 'bg-slate-500/50 text-slate-200 border border-slate-500/30' },
    rare: { label: '稀有', className: 'bg-blue-500/50 text-blue-200 border border-blue-500/30' },
    epic: { label: '史诗', className: 'bg-purple-500/50 text-purple-200 border border-purple-500/30' },
    legendary: { label: '传奇', className: 'bg-gradient-to-r from-yellow-400 to-orange-500 text-white border border-yellow-400/50 shadow-[0_0_20px_rgba(250,204,21,0.3)]' },
  };

  const config = rarityConfig[shrimp.rarity];

  return (
    <div className="min-h-screen bg-slate-900 py-8 px-4 sm:px-6 lg:px-8 relative">
      {/* Scanline effect */}
      <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(transparent_1px,transparent_1px),linear-gradient(90deg,rgba(0,255,255,0.03)_1px,transparent_1px),linear-gradient(rgba(0,255,255,0.03)_1px,transparent_1px)] bg-[size:4px_4px,30px_30px,30px_30px] z-0" />
      <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-transparent via-purple-500/5 to-transparent z-0" />
      
      <div className="max-w-6xl mx-auto relative z-10">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-gray-500 mb-6">
          <span className="hover:text-cyan-400 cursor-pointer">首页</span>
          <span>/</span>
          <span>虾群</span>
          <span>/</span>
          <span className="font-medium text-cyan-300">{shrimp.name}</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left - Image */}
          <Card className="glass-effect">
            <CardContent className="p-8">
              <div className="aspect-square rounded-2xl bg-gradient-to-br from-purple-900/50 via-pink-900/30 to-cyan-900/50 flex items-center justify-center text-[12rem] border border-cyan-500/20 shadow-[0_0_50px_rgba(0,255,255,0.1)]">
                {shrimp.image}
              </div>
            </CardContent>
          </Card>

          {/* Right - Info */}
          <div className="space-y-6">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl font-bold neon-text">{shrimp.name}</h1>
                <Badge className={config.className}>{config.label}</Badge>
              </div>
              <p className="text-gray-400">{shrimp.description}</p>
            </div>

            {/* Price & Actions */}
            <Card className="glass-effect">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <p className="text-sm text-gray-400">当前价格</p>
                    <p className="text-3xl font-bold text-pink-400">¥{shrimp.price}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-400">拥有者</p>
                    <div className="flex items-center gap-2 text-cyan-100">
                      <User className="w-4 h-4 text-cyan-400" />
                      <span>{shrimp.owner || '未知'}</span>
                    </div>
                  </div>
                </div>
                <div className="flex gap-3">
                  <Button className="flex-1 cyber-button bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-400 hover:to-purple-400 h-12 gap-2">
                    <ShoppingCart className="w-5 h-5" />
                    立即购买
                  </Button>
                  <Button variant="outline" size="icon" className="h-12 w-12 border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/20">
                    <Heart className="w-5 h-5" />
                  </Button>
                  <Button variant="outline" size="icon" className="h-12 w-12 border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/20">
                    <Share2 className="w-5 h-5" />
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Stats */}
            <Card className="glass-effect">
              <CardHeader>
                <CardTitle className="text-lg text-cyan-100">属性详情</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Sword className="w-4 h-4 text-pink-400" />
                      <span className="text-sm text-cyan-100">战斗力</span>
                    </div>
                    <span className="font-semibold text-cyan-100">{shrimp.power}/100</span>
                  </div>
                  <Progress value={shrimp.power} className="h-2 bg-slate-800 [&>div]:bg-gradient-to-r [&>div]:from-pink-500 [&>div]:to-rose-500" />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Zap className="w-4 h-4 text-yellow-400" />
                      <span className="text-sm text-cyan-100">速度</span>
                    </div>
                    <span className="font-semibold text-cyan-100">{shrimp.speed}/100</span>
                  </div>
                  <Progress value={shrimp.speed} className="h-2 bg-slate-800 [&>div]:bg-gradient-to-r [&>div]:from-yellow-500 [&>div]:to-orange-500" />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Shield className="w-4 h-4 text-green-400" />
                      <span className="text-sm text-cyan-100">生命值</span>
                    </div>
                    <span className="font-semibold text-cyan-100">{shrimp.health}/100</span>
                  </div>
                  <Progress value={shrimp.health} className="h-2 bg-slate-800 [&>div]:bg-gradient-to-r [&>div]:from-green-500 [&>div]:to-cyan-500" />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Tabs Section */}
        <Card className="glass-effect mt-8">
          <Tabs defaultValue="history" className="w-full">
            <TabsList className="w-full justify-start rounded-b-none border-b border-cyan-500/20 bg-slate-800/50">
              <TabsTrigger value="history" className="data-[state=active]:bg-cyan-500/20 data-[state=active]:text-cyan-400 text-gray-400">交易记录</TabsTrigger>
              <TabsTrigger value="battles" className="data-[state=active]:bg-cyan-500/20 data-[state=active]:text-cyan-400 text-gray-400">战斗记录</TabsTrigger>
              <TabsTrigger value="similar" className="data-[state=active]:bg-cyan-500/20 data-[state=active]:text-cyan-400 text-gray-400">相似虾群</TabsTrigger>
            </TabsList>
            <TabsContent value="history" className="p-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between py-3 border-b border-cyan-500/20">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center border border-cyan-500/20">
                      <Clock className="w-5 h-5 text-cyan-400" />
                    </div>
                    <div>
                      <p className="font-medium text-cyan-100">创建</p>
                      <p className="text-sm text-gray-500">{shrimp.createdAt.toLocaleDateString()}</p>
                    </div>
                  </div>
                  <span className="text-gray-500">-</span>
                </div>
                <div className="flex items-center justify-between py-3 border-b border-cyan-500/20">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center border border-cyan-500/20">
                      <User className="w-5 h-5 text-cyan-400" />
                    </div>
                    <div>
                      <p className="font-medium text-cyan-100">铸造</p>
                      <p className="text-sm text-gray-500">系统</p>
                    </div>
                  </div>
                  <span className="text-gray-500">铸造费: ¥0</span>
                </div>
              </div>
            </TabsContent>
            <TabsContent value="battles" className="p-6">
              <div className="text-center py-8 text-gray-400">
                <Trophy className="w-12 h-12 mx-auto mb-3 opacity-50 text-cyan-400" />
                <p>暂无战斗记录</p>
                <Button variant="outline" className="mt-4 border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/20">
                  发起挑战
                </Button>
              </div>
            </TabsContent>
            <TabsContent value="similar" className="p-6">
              <div className="text-center py-8 text-gray-400">
                <p>暂无相似虾群</p>
              </div>
            </TabsContent>
          </Tabs>
        </Card>
      </div>
    </div>
  );
}

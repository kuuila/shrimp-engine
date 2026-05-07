import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { mockLeaderboard, mockShrimps } from '@/data/mock';
import { 
  Trophy, 
  Medal, 
  Crown,
  TrendingUp,
  Sword,
  Shell,
  Star,
  Users,
  Zap
} from 'lucide-react';

const rankIcons: Record<number, React.ReactNode> = {
  1: <Crown className="w-6 h-6 text-yellow-500" />,
  2: <Medal className="w-6 h-6 text-slate-400" />,
  3: <Medal className="w-6 h-6 text-amber-600" />,
};

const rankBadges: Record<number, string> = {
  1: 'bg-gradient-to-r from-yellow-400 to-yellow-600',
  2: 'bg-gradient-to-r from-slate-300 to-slate-400',
  3: 'bg-gradient-to-r from-amber-400 to-amber-600',
};

export default function LeaderboardPage() {
  const topThree = mockLeaderboard.slice(0, 3);
  const rest = mockLeaderboard.slice(3);

  return (
    <div className="min-h-screen bg-slate-900 py-8 px-4 sm:px-6 lg:px-8 relative">
      {/* Scanline effect */}
      <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(transparent_1px,transparent_1px),linear-gradient(90deg,rgba(0,255,255,0.03)_1px,transparent_1px),linear-gradient(rgba(0,255,255,0.03)_1px,transparent_1px)] bg-[size:4px_4px,30px_30px,30px_30px] z-0" />
      <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-transparent via-purple-500/5 to-transparent z-0" />
      
      <div className="max-w-4xl mx-auto space-y-8 relative z-10">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex justify-center">
            <Trophy className="w-16 h-16 text-yellow-400 neon-text" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold neon-text">
            排行榜
          </h1>
          <p className="text-gray-400">最强虾王争夺战！</p>
        </div>

        {/* Top 3 Podium */}
        <Card className="glass-effect overflow-hidden">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end">
              {/* 2nd Place */}
              <div className="order-2 sm:order-1">
                <div className="text-center">
                  <Avatar className="w-16 h-16 mx-auto mb-2 border-2 border-gray-400">
                    <AvatarFallback className="bg-gradient-to-br from-gray-600 to-gray-700 text-2xl">
                      {topThree[1].avatar}
                    </AvatarFallback>
                  </Avatar>
                  <Badge className="bg-gradient-to-r from-gray-400 to-gray-500">🥈</Badge>
                  <h3 className="font-semibold mt-2 text-cyan-100">{topThree[1].userName}</h3>
                  <p className="text-sm text-gray-400">Score: {topThree[1].score.toLocaleString()}</p>
                </div>
                <div className="mt-4 h-24 bg-gradient-to-t from-gray-600 to-gray-800 rounded-t-lg flex items-end justify-center pb-2 border border-gray-500/30">
                  <div className="text-center">
                    <Sword className="w-4 h-4 mx-auto text-gray-400" />
                    <span className="text-xs text-gray-400">{topThree[1].wins}胜</span>
                  </div>
                </div>
              </div>

              {/* 1st Place */}
              <div className="order-1 sm:order-2">
                <div className="text-center">
                  <div className="relative inline-block">
                    <Avatar className="w-20 h-20 mx-auto mb-2 border-2 border-yellow-400 shadow-[0_0_20px_rgba(250,204,21,0.5)]">
                      <AvatarFallback className="bg-gradient-to-br from-yellow-400 to-yellow-600 text-3xl">
                        {topThree[0].avatar}
                      </AvatarFallback>
                    </Avatar>
                    <Crown className="w-6 h-6 absolute -top-2 -right-2 text-yellow-400" />
                  </div>
                  <Badge className="bg-gradient-to-r from-yellow-400 to-orange-500 shadow-[0_0_10px_rgba(250,204,21,0.5)]">🥇</Badge>
                  <h3 className="font-bold text-lg mt-2 text-cyan-100">{topThree[0].userName}</h3>
                  <p className="text-sm text-pink-400 font-semibold">Score: {topThree[0].score.toLocaleString()}</p>
                </div>
                <div className="mt-4 h-32 bg-gradient-to-t from-yellow-500 to-yellow-700 rounded-t-lg flex items-end justify-center pb-2 border border-yellow-400/30 shadow-[0_0_20px_rgba(250,204,21,0.3)]">
                  <div className="text-center">
                    <Sword className="w-5 h-5 mx-auto text-yellow-300" />
                    <span className="text-xs text-yellow-200">{topThree[0].wins}胜</span>
                  </div>
                </div>
              </div>

              {/* 3rd Place */}
              <div className="order-3">
                <div className="text-center">
                  <Avatar className="w-16 h-16 mx-auto mb-2 border-2 border-amber-500">
                    <AvatarFallback className="bg-gradient-to-br from-amber-600 to-amber-700 text-2xl">
                      {topThree[2].avatar}
                    </AvatarFallback>
                  </Avatar>
                  <Badge className="bg-gradient-to-r from-amber-500 to-amber-600">🥉</Badge>
                  <h3 className="font-semibold mt-2 text-cyan-100">{topThree[2].userName}</h3>
                  <p className="text-sm text-gray-400">Score: {topThree[2].score.toLocaleString()}</p>
                </div>
                <div className="mt-4 h-16 bg-gradient-to-t from-amber-600 to-amber-800 rounded-t-lg flex items-end justify-center pb-2 border border-amber-500/30">
                  <div className="text-center">
                    <Sword className="w-4 h-4 mx-auto text-amber-400" />
                    <span className="text-xs text-amber-300">{topThree[2].wins}胜</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Filters */}
        <div className="flex flex-wrap gap-2 justify-center">
          <Button variant="secondary" className="bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-400 hover:to-purple-400 text-white">
            综合榜
          </Button>
          <Button variant="outline" className="border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/20">胜率榜</Button>
          <Button variant="outline" className="border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/20">财富榜</Button>
          <Button variant="outline" className="border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/20">虾群榜</Button>
        </div>

        {/* Full Leaderboard */}
        <Card className="glass-effect">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-cyan-100">
              <Users className="w-5 h-5 text-cyan-400" />
              完整排行榜
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="divide-y divide-cyan-500/20">
              {mockLeaderboard.map((item, index) => (
                <div
                  key={item.userId}
                  className={`flex items-center gap-4 py-4 ${
                    item.userId === 'current-user' ? 'bg-cyan-500/10 -mx-6 px-6 rounded-lg border border-cyan-500/30' : ''
                  }`}
                >
                  <div className="w-8 text-center">
                    {item.rank <= 3 ? (
                      rankIcons[item.rank]
                    ) : (
                      <span className="text-lg font-bold text-gray-500">#{item.rank}</span>
                    )}
                  </div>
                  <Avatar className="border border-cyan-500/30">
                    <AvatarFallback className="bg-gradient-to-br from-purple-600 to-cyan-600">
                      {item.avatar}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-cyan-100">{item.userName}</span>
                      {item.userId === 'current-user' && (
                        <Badge variant="secondary" className="text-xs bg-cyan-500/20 text-cyan-300 border-cyan-500/30">你</Badge>
                      )}
                    </div>
                    <div className="flex gap-4 text-sm text-gray-400">
                      <span className="flex items-center gap-1">
                        <Sword className="w-3 h-3 text-pink-400" /> {item.wins}胜
                      </span>
                      <span className="flex items-center gap-1">
                        <Shell className="w-3 h-3 text-cyan-400" /> {item.shrimps}虾
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-lg text-cyan-100">{item.score.toLocaleString()}</p>
                    <p className="text-xs text-gray-500">积分</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card className="glass-effect hover:border-yellow-500/30 transition-all duration-300">
            <CardContent className="p-6 text-center">
              <Zap className="w-8 h-8 mx-auto mb-2 text-yellow-400" />
              <p className="text-2xl font-bold text-cyan-100">9,850</p>
              <p className="text-sm text-gray-400">最高积分</p>
            </CardContent>
          </Card>
          <Card className="glass-effect hover:border-green-500/30 transition-all duration-300">
            <CardContent className="p-6 text-center">
              <TrendingUp className="w-8 h-8 mx-auto mb-2 text-green-400" />
              <p className="text-2xl font-bold text-cyan-100">+12</p>
              <p className="text-sm text-gray-400">本周排名变化</p>
            </CardContent>
          </Card>
          <Card className="glass-effect hover:border-purple-500/30 transition-all duration-300">
            <CardContent className="p-6 text-center">
              <Star className="w-8 h-8 mx-auto mb-2 text-purple-400" />
              <p className="text-2xl font-bold text-cyan-100">42</p>
              <p className="text-sm text-gray-400">本周胜场</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

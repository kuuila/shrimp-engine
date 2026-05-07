import { ShrimpCard } from '@/components/ShrimpCard';
import { mockShrimps } from '@/data/mock';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Shell, TrendingUp, Zap, Shield, Cpu, Globe, Database } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="min-h-screen pb-20 md:pb-0">
      {/* Hero Section - 赛博朋克城市背景 */}
      <section className="relative cyber-bg-city text-white py-24 px-4 sm:px-6 lg:px-8 overflow-hidden">
        {/* 背景城市轮廓 */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {/* 城市建筑剪影 */}
          <svg className="absolute bottom-0 left-0 w-full h-48" viewBox="0 0 1440 200" preserveAspectRatio="none">
            <defs>
              <linearGradient id="buildingGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" style={{ stopColor: '#1a0a2e', stopOpacity: 0.8 }} />
                <stop offset="100%" style={{ stopColor: '#1a0a2e', stopOpacity: 0 }} />
              </linearGradient>
            </defs>
            <path 
              fill="url(#buildingGrad)" 
              d="M0,200 L0,150 L100,150 L100,120 L150,120 L150,100 L200,100 L200,140 L250,140 L250,80 L320,80 L320,130 L380,130 L380,90 L450,90 L450,150 L520,150 L520,60 L600,60 L600,140 L670,140 L670,110 L750,110 L750,70 L820,70 L820,130 L900,130 L900,100 L980,100 L980,150 L1050,150 L1050,80 L1120,80 L1120,140 L1190,140 L1190,120 L1250,120 L1250,90 L1320,90 L1320,150 L1380,150 L1380,130 L1440,130 L1440,200 Z" 
            />
          </svg>
          
          {/* 霓虹灯效果 - 垂直光束 */}
          <div className="absolute top-0 left-1/4 w-px h-full bg-gradient-to-b from-cyan-500/0 via-cyan-500/30 to-cyan-500/0" />
          <div className="absolute top-0 left-1/2 w-px h-full bg-gradient-to-b from-purple-500/0 via-purple-500/30 to-purple-500/0" />
          <div className="absolute top-0 left-3/4 w-px h-full bg-gradient-to-b from-pink-500/0 via-pink-500/30 to-pink-500/0" />
          
          {/* 扫描线效果 */}
          <div className="absolute inset-0 scanlines opacity-30" />
        </div>

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center space-y-8">
            {/* Logo + 主标题 - 赛博朋克风格 */}
            <div className="flex justify-center items-center gap-4 mb-8">
              <div className="relative group">
                {/* 虾周围的动态光环 */}
                <div className="absolute inset-0 blur-2xl bg-cyan-500/30 animate-pulse" />
                <div className="absolute inset-0 blur-xl bg-purple-500/20 animate-pulse" style={{ animationDelay: '0.5s' }} />
                <Shell className="w-24 h-24 text-cyan-400 group-hover:rotate-12 transition-transform relative z-10" />
              </div>
            </div>
            
            {/* 霓虹标题 */}
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black relative">
              <span className="neon-text">虾群市场</span>
              <span className="block text-2xl sm:text-3xl lg:text-4xl font-light text-purple-300 mt-2 tracking-widest">
                FUTURE SHRIMP TRADING
              </span>
            </h1>
            
            {/* 副标题 - 霓虹文字 */}
            <p className="text-lg sm:text-xl text-cyan-100/80 max-w-2xl mx-auto leading-relaxed">
              <span className="text-cyan-400 neon-text-pink">2077年</span>，
              人类不带几只<span className="text-cyan-400">虾</span>就没法上街
            </p>
            
            {/* 标签 */}
            <div className="flex flex-wrap justify-center gap-3 pt-4">
              <span className="px-4 py-2 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-sm flex items-center gap-2">
                <Cpu className="w-4 h-4" />
                区块链确权
              </span>
              <span className="px-4 py-2 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-300 text-sm flex items-center gap-2">
                <Database className="w-4 h-4" />
                AI 对战
              </span>
              <span className="px-4 py-2 rounded-full bg-pink-500/10 border border-pink-500/30 text-pink-300 text-sm flex items-center gap-2">
                <Globe className="w-4 h-4" />
                元宇宙交易
              </span>
            </div>
            
            {/* 按钮组 - 赛博朋克风格 */}
            <div className="flex flex-wrap justify-center gap-6 pt-8">
              <Button 
                size="lg" 
                className="cyber-button gap-2 px-8 py-6 text-lg"
              >
                <TrendingUp className="w-5 h-5" />
                开始交易
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                className="gap-2 px-8 py-6 text-lg border-purple-500/50 text-purple-300 hover:bg-purple-500/20 hover:border-purple-400 hover:text-purple-200"
              >
                <Zap className="w-5 h-5" />
                虾群对战
              </Button>
            </div>
          </div>
        </div>
        
        {/* 底部渐变 */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-slate-900 to-transparent" />
      </section>

      {/* Stats Section - 赛博朋克风格 */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 relative">
        {/* 背景装饰 */}
        <div className="absolute inset-0 bg-gradient-to-br from-purple-950/30 via-slate-900 to-cyan-950/20" />
        
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {/* 统计卡片 1 */}
            <div className="glass-effect-purple p-6 rounded-xl border border-purple-500/30 group hover:border-cyan-400/50 transition-all duration-300 hover:shadow-[0_0_20px_rgba(0,255,255,0.2)]">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <div className="w-14 h-14 rounded-full bg-cyan-500/20 flex items-center justify-center border border-cyan-500/40">
                    <Shell className="w-7 h-7 text-cyan-400" />
                  </div>
                  <div className="absolute inset-0 rounded-full border border-cyan-400/20 animate-pulse" />
                </div>
                <div>
                  <p className="text-3xl font-bold neon-text">1,234</p>
                  <p className="text-gray-400">在售虾群</p>
                </div>
              </div>
            </div>
            
            {/* 统计卡片 2 */}
            <div className="glass-effect-purple p-6 rounded-xl border border-purple-500/30 group hover:border-cyan-400/50 transition-all duration-300 hover:shadow-[0_0_20px_rgba(0,255,255,0.2)]">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <div className="w-14 h-14 rounded-full bg-purple-500/20 flex items-center justify-center border border-purple-500/40">
                    <TrendingUp className="w-7 h-7 text-purple-400" />
                  </div>
                  <div className="absolute inset-0 rounded-full border border-purple-400/20 animate-pulse" />
                </div>
                <div>
                  <p className="text-3xl font-bold text-purple-400">567</p>
                  <p className="text-gray-400">今日交易</p>
                </div>
              </div>
            </div>
            
            {/* 统计卡片 3 */}
            <div className="glass-effect-purple p-6 rounded-xl border border-purple-500/30 group hover:border-cyan-400/50 transition-all duration-300 hover:shadow-[0_0_20px_rgba(0,255,255,0.2)]">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <div className="w-14 h-14 rounded-full bg-green-500/20 flex items-center justify-center border border-green-500/40">
                    <Shield className="w-7 h-7 text-green-400" />
                  </div>
                  <div className="absolute inset-0 rounded-full border border-green-400/20 animate-pulse" />
                </div>
                <div>
                  <p className="text-3xl font-bold text-green-400">8.9K</p>
                  <p className="text-gray-400">注册用户</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Search Section - 赛博朋克风格 */}
      <section className="py-8 px-4 sm:px-6 lg:px-8 relative">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              {/* 输入框霓虹效果 */}
              <Input
                type="text"
                placeholder="搜索虾群..."
                className="flex-1 bg-slate-900/80 border border-purple-500/30 text-cyan-100 placeholder:text-gray-500 focus:border-cyan-400 focus:shadow-[0_0_15px_rgba(0,255,255,0.3)] transition-all duration-300"
              />
              {/* 输入框角标 */}
              <div className="absolute top-0 right-0 w-2 h-2 border-r border-t border-cyan-400/50" />
              <div className="absolute bottom-0 left-0 w-2 h-2 border-l border-b border-cyan-400/50" />
            </div>
            <Button className="cyber-button px-8">
              搜索
            </Button>
          </div>
        </div>
      </section>

      {/* Shrimp Grid - 赛博朋克风格 */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 relative">
        {/* 背景装饰 */}
        <div className="absolute inset-0 bg-gradient-to-b from-slate-900 via-purple-950/20 to-slate-900 pointer-events-none" />
        
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="flex items-center justify-between mb-8">
            {/* 标题带霓虹下划线 */}
            <h2 className="text-2xl sm:text-3xl font-bold text-cyan-100 relative">
              热门虾群
              <div className="absolute -bottom-2 left-0 w-24 h-0.5 bg-gradient-to-r from-cyan-400 to-transparent" />
            </h2>
            <Button 
              variant="outline" 
              className="border-purple-500/30 text-purple-300 hover:bg-purple-500/20 hover:border-purple-400"
            >
              查看更多
            </Button>
          </div>
          
          {/* 虾卡片网格 */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {mockShrimps.map((shrimp) => (
              <ShrimpCard key={shrimp.id} shrimp={shrimp} />
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

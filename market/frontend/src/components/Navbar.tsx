'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ShoppingCart, Trophy, User, Home, Shell } from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { href: '/', label: '首页', icon: Home },
  { href: '/cart', label: '购物车', icon: ShoppingCart },
  { href: '/leaderboard', label: '排行榜', icon: Trophy },
  { href: '/user', label: '用户中心', icon: User },
];

export function Navbar() {
  const pathname = usePathname();

  return (
    <header className="fixed top-0 left-0 right-0 z-50 glass-effect border-b border-cyan-500/30">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Logo - 霓虹效果 */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="relative">
            <Shell className="w-8 h-8 text-cyan-400 group-hover:rotate-12 transition-transform" />
            {/* 虾的周围发光效果 */}
            <div className="absolute inset-0 blur-md bg-cyan-400/30 group-hover:bg-cyan-400/50 transition-all" />
          </div>
          <span className="text-xl font-bold neon-text">
            虾群市场
          </span>
        </Link>

        {/* Desktop Navigation - 玻璃态 + 霓虹高亮 */}
        <div className="hidden md:flex items-center gap-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link key={item.href} href={item.href}>
                <Button
                  variant="ghost"
                  size="sm"
                  className={cn(
                    'gap-2 transition-all duration-300',
                    isActive 
                      ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/50 shadow-[0_0_10px_rgba(0,255,255,0.3)]' 
                      : 'text-gray-400 hover:text-cyan-400 hover:bg-cyan-500/10'
                  )}
                >
                  <Icon className={cn(
                    'w-4 h-4',
                    isActive && 'animate-pulse'
                  )} />
                  {item.label}
                </Button>
              </Link>
            );
          })}
        </div>

        {/* User Avatar - 全息边框 */}
        <Link href="/user">
          <div className="relative group">
            <Avatar className="cursor-pointer border-2 border-cyan-500/50 hover:border-cyan-400 hover:shadow-[0_0_15px_rgba(0,255,255,0.5)] transition-all">
              <AvatarFallback className="bg-gradient-to-br from-purple-600 to-cyan-600 text-white">
                虾
              </AvatarFallback>
            </Avatar>
            {/* 头像呼吸灯效果 */}
            <div className="absolute inset-0 rounded-full border border-cyan-400/30 animate-pulse" />
          </div>
        </Link>

        {/* Mobile Navigation - 玻璃态底部栏 */}
        <div className="fixed bottom-0 left-0 right-0 md:hidden mobile-nav-cyber px-4 py-2 flex justify-around items-center z-50">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link key={item.href} href={item.href}>
                <Button
                  variant="ghost"
                  size="sm"
                  className={cn(
                    'flex-col gap-1 h-14 px-4 transition-all duration-300',
                    isActive 
                      ? 'text-cyan-400 bg-cyan-500/20 border border-cyan-500/30' 
                      : 'text-gray-500 hover:text-cyan-400'
                  )}
                >
                  <Icon className={cn(
                    'w-5 h-5',
                    isActive && 'drop-shadow-[0_0_5px_rgba(0,255,255,0.8)]'
                  )} />
                  <span className="text-xs">{item.label}</span>
                </Button>
              </Link>
            );
          })}
        </div>
      </nav>
      
      {/* 顶部装饰线 - 霓虹扫描效果 */}
      <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-cyan-500 to-transparent opacity-50" />
    </header>
  );
}

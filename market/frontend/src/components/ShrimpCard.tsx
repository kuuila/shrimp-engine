'use client';

import Link from 'next/link';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Shrimp } from '@/types';
import { cn } from '@/lib/utils';

interface ShrimpCardProps {
  shrimp: Shrimp;
}

const rarityConfig = {
  common: {
    label: '普通',
    bgClass: 'bg-gray-600/80',
    textClass: 'text-gray-300',
    borderClass: 'border-gray-500/50',
    glowColor: 'rgba(102, 102, 136, 0.5)',
    particleColor: '#8888aa',
  },
  rare: {
    label: '稀有',
    bgClass: 'bg-cyan-600/80',
    textClass: 'text-cyan-300',
    borderClass: 'border-cyan-400/50',
    glowColor: 'rgba(0, 255, 255, 0.5)',
    particleColor: '#00ffff',
  },
  epic: {
    label: '史诗',
    bgClass: 'bg-purple-600/80',
    textClass: 'text-purple-300',
    borderClass: 'border-purple-400/50',
    glowColor: 'rgba(138, 43, 226, 0.5)',
    particleColor: '#8a2be2',
  },
  legendary: {
    label: '传奇',
    bgClass: 'bg-gradient-to-r from-orange-500 to-yellow-500',
    textClass: 'text-orange-300',
    borderClass: 'border-orange-400/50',
    glowColor: 'rgba(255, 102, 0, 0.6)',
    particleColor: '#ff6600',
  },
};

export function ShrimpCard({ shrimp }: ShrimpCardProps) {
  const config = rarityConfig[shrimp.rarity];

  return (
    <Link href={`/shrimp/${shrimp.id}`}>
      <Card 
        className={cn(
          'relative cursor-pointer transition-all duration-500 overflow-hidden',
          'bg-gradient-to-br from-slate-900/95 via-purple-950/80 to-slate-900/95',
          'border border-purple-500/30',
          'group hover:border-cyan-400/50',
          'hover:shadow-[0_0_30px_rgba(0,255,255,0.2),0_0_60px_rgba(138,43,226,0.15)]',
          shrimp.rarity === 'legendary' && 'hover:shadow-[0_0_30px_rgba(255,102,0,0.3),0_0_60px_rgba(255,102,0,0.2)]',
          shrimp.rarity === 'epic' && 'hover:shadow-[0_0_30px_rgba(138,43,226,0.3),0_0_60px_rgba(138,43,226,0.2)]',
          shrimp.rarity === 'rare' && 'hover:shadow-[0_0_30px_rgba(0,255,255,0.3),0_0_60px_rgba(0,255,255,0.2)]',
          'float-animation'
        )}
        style={{
          animationDelay: `${Math.random() * 2}s`,
          animationDuration: '4s',
        }}
      >
        {/* 扫描线效果 */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute w-full h-[2px] bg-gradient-to-r from-transparent via-cyan-400/30 to-transparent animate-[scan-line_3s_linear_infinite]" />
        </div>
        
        {/* 全息光泽层 */}
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 via-transparent to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        
        {/* 稀有度发光边框 */}
        <div 
          className="absolute inset-0 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-500"
          style={{
            boxShadow: `inset 0 0 20px ${config.glowColor}`,
          }}
        />

        <CardHeader className="pb-3 relative">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg text-cyan-100 group-hover:text-cyan-400 transition-colors">
              {shrimp.name}
            </CardTitle>
            {/* 稀有度标签 - 发光动态效果 */}
            <Badge 
              className={cn(
                'relative px-3 py-1 font-semibold transition-all duration-300',
                config.bgClass,
                'border',
                config.borderClass,
                'group-hover:animate-pulse'
              )}
              style={{
                boxShadow: `0 0 10px ${config.glowColor}, 0 0 20px ${config.glowColor}`,
              }}
            >
              {config.label}
            </Badge>
          </div>
        </CardHeader>
        
        <CardContent className="relative">
          {/* 全息投影展示区 */}
          <div className="relative aspect-square rounded-lg overflow-hidden mb-4">
            {/* 全息背景 */}
            <div 
              className="absolute inset-0"
              style={{
                background: `
                  radial-gradient(ellipse at center, ${config.glowColor} 0%, transparent 70%),
                  linear-gradient(135deg, rgba(0,255,255,0.1) 0%, rgba(138,43,226,0.1) 50%, rgba(255,0,255,0.1) 100%)
                `,
              }}
            />
            
            {/* 网格线效果 */}
            <div 
              className="absolute inset-0 opacity-20"
              style={{
                backgroundImage: `
                  linear-gradient(rgba(0,255,255,0.3) 1px, transparent 1px),
                  linear-gradient(90deg, rgba(0,255,255,0.3) 1px, transparent 1px)
                `,
                backgroundSize: '20px 20px',
              }}
            />
            
            {/* 虾的emoji - 全息效果 */}
            <div className="shrimp-hologram aspect-square flex items-center justify-center text-7xl group-hover:scale-110 transition-transform duration-500">
              <div className="relative">
                {/* 光晕层 */}
                <div 
                  className="absolute inset-0 blur-xl opacity-60 group-hover:opacity-100 transition-opacity"
                  style={{
                    textShadow: `0 0 20px ${config.particleColor}, 0 0 40px ${config.particleColor}`,
                  }}
                >
                  {shrimp.image}
                </div>
                {/* 主体 */}
                <span 
                  className="relative block group-hover:animate-[glitch_0.3s_ease-in-out_infinite]"
                  style={{
                    filter: `drop-shadow(0 0 10px ${config.particleColor})`,
                  }}
                >
                  {shrimp.image}
                </span>
              </div>
            </div>
            
            {/* 扫描效果 */}
            <div 
              className="absolute inset-x-0 h-1 bg-gradient-to-r from-transparent via-cyan-400/50 to-transparent opacity-50"
              style={{
                animation: 'scan-line 2s linear infinite',
              }}
            />
          </div>
          
          <p className="text-sm text-gray-400 line-clamp-2 group-hover:text-gray-300 transition-colors">
            {shrimp.description}
          </p>
          
          {/* 属性条 - 霓虹进度条 */}
          <div className="mt-4 space-y-3">
            <div className="space-y-1">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">战斗力</span>
                <span className="font-semibold text-cyan-400">{shrimp.power}</span>
              </div>
              <div className="h-1.5 bg-gray-800 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-cyan-500 to-cyan-400 rounded-full transition-all duration-500"
                  style={{ 
                    width: `${shrimp.power}%`,
                    boxShadow: '0 0 10px rgba(0,255,255,0.5)',
                  }}
                />
              </div>
            </div>
            
            <div className="space-y-1">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">速度</span>
                <span className="font-semibold text-purple-400">{shrimp.speed}</span>
              </div>
              <div className="h-1.5 bg-gray-800 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full transition-all duration-500"
                  style={{ 
                    width: `${shrimp.speed}%`,
                    boxShadow: '0 0 10px rgba(138,43,226,0.5)',
                  }}
                />
              </div>
            </div>
            
            <div className="space-y-1">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">生命值</span>
                <span className="font-semibold text-green-400">{shrimp.health}</span>
              </div>
              <div className="h-1.5 bg-gray-800 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-green-500 to-emerald-400 rounded-full transition-all duration-500"
                  style={{ 
                    width: `${shrimp.health}%`,
                    boxShadow: '0 0 10px rgba(0,255,102,0.5)',
                  }}
                />
              </div>
            </div>
          </div>
        </CardContent>
        
        <CardFooter className="flex items-center justify-between relative pt-4 border-t border-purple-500/20">
          {/* 霓虹价格效果 */}
          <div className="neon-price text-xl">
            ¥{shrimp.price.toLocaleString()}
          </div>
          
          {shrimp.forSale ? (
            <Button 
              size="sm" 
              className="cyber-button px-4"
            >
              购买
            </Button>
          ) : (
            <Button 
              size="sm" 
              variant="outline" 
              disabled
              className="border-gray-600 text-gray-500"
            >
              已售
            </Button>
          )}
        </CardFooter>
        
        {/* 角落装饰 - 霓虹三角形 */}
        <div className="absolute top-0 left-0 w-4 h-4 border-l-2 border-t-2 border-cyan-500/50" />
        <div className="absolute top-0 right-0 w-4 h-4 border-r-2 border-t-2 border-purple-500/50" />
        <div className="absolute bottom-0 left-0 w-4 h-4 border-l-2 border-b-2 border-purple-500/50" />
        <div className="absolute bottom-0 right-0 w-4 h-4 border-r-2 border-b-2 border-cyan-500/50" />
      </Card>
    </Link>
  );
}

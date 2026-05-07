// 虾群类型定义
export interface Shrimp {
  id: string;
  name: string;
  description: string;
  image: string;
  price: number;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  power: number;
  speed: number;
  health: number;
  owner?: string;
  forSale: boolean;
  createdAt: Date;
}

// 用户类型
export interface User {
  id: string;
  name: string;
  avatar: string;
  level: number;
  coins: number;
  shrimps: string[];
  wins: number;
  losses: number;
}

// 排行榜项
export interface LeaderboardItem {
  rank: number;
  userId: string;
  userName: string;
  avatar: string;
  score: number;
  wins: number;
  shrimps: number;
}

// 购物车项
export interface CartItem {
  shrimp: Shrimp;
  quantity: number;
}

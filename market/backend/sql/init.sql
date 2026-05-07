-- 虾市场数据库初始化脚本
-- 创建数据库
CREATE DATABASE IF NOT EXISTS shrimp_market CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE shrimp_market;

-- 用户表
CREATE TABLE IF NOT EXISTS users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    nickname VARCHAR(50),
    avatar VARCHAR(255),
    phone VARCHAR(20),
    email VARCHAR(100),
    balance DECIMAL(10, 2) DEFAULT 0.00,
    total_spent DECIMAL(10, 2) DEFAULT 0.00,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    status TINYINT DEFAULT 1 COMMENT '1=正常 0=禁用',
    INDEX idx_username (username),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 虾品种表
CREATE TABLE IF NOT EXISTS shrimp_species (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL COMMENT '品种名称',
    description TEXT COMMENT '品种描述',
    image_url VARCHAR(255),
    base_price DECIMAL(10, 2) NOT NULL COMMENT '基准价格',
    category VARCHAR(50) COMMENT '分类(观赏/食用/繁殖)',
    difficulty VARCHAR(20) COMMENT '饲养难度(简单/中等/困难)',
    lifespan INT COMMENT '预期寿命(月)',
    origin VARCHAR(100) COMMENT '产地',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    status TINYINT DEFAULT 1 COMMENT '1=上架 0=下架',
    INDEX idx_category (category),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 虾商品表 (目录包模式)
CREATE TABLE IF NOT EXISTS products (
    id INT PRIMARY KEY AUTO_INCREMENT,
    species_id INT NOT NULL,
    seller_id INT NOT NULL,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    price DECIMAL(10, 2) NOT NULL,
    original_price DECIMAL(10, 2) COMMENT '原价',
    stock INT DEFAULT 1 COMMENT '库存数量',
    size VARCHAR(20) COMMENT '尺寸(小/中/大)',
    age INT COMMENT '月龄',
    gender VARCHAR(10) COMMENT '性别(公/母/未知)',
    images JSON COMMENT '图片JSON数组',
    file_url VARCHAR(255) COMMENT '目录包文件链接',
    file_size VARCHAR(50) COMMENT '文件大小(MB)',
    province VARCHAR(50) COMMENT '省份',
    city VARCHAR(50) COMMENT '城市',
    view_count INT DEFAULT 0,
    sales_count INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    status TINYINT DEFAULT 1 COMMENT '1=上架 0=下架 2=已售',
    INDEX idx_species_id (species_id),
    INDEX idx_seller_id (seller_id),
    INDEX idx_status (status),
    INDEX idx_created_at (created_at),
    FOREIGN KEY (species_id) REFERENCES shrimp_species(id) ON DELETE CASCADE,
    FOREIGN KEY (seller_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 订单表 (目录包下载模式)
CREATE TABLE IF NOT EXISTS orders (
    id INT PRIMARY KEY AUTO_INCREMENT,
    order_no VARCHAR(64) NOT NULL UNIQUE COMMENT '订单号',
    buyer_id INT NOT NULL,
    product_id INT NOT NULL,
    seller_id INT NOT NULL,
    amount DECIMAL(10, 2) NOT NULL COMMENT '订单金额',
    quantity INT DEFAULT 1,
    status VARCHAR(20) DEFAULT 'pending' COMMENT 'pending=待付款 paid=已付款 completed=已完成 cancelled=已取消 refunded=已退款',
    payment_method VARCHAR(20) COMMENT '支付方式',
    payment_time DATETIME COMMENT '支付时间',
    download_url VARCHAR(255) COMMENT '下载链接',
    download_count INT DEFAULT 0 COMMENT '下载次数',
    remark TEXT COMMENT '备注',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_order_no (order_no),
    INDEX idx_buyer_id (buyer_id),
    INDEX idx_seller_id (seller_id),
    INDEX idx_status (status),
    INDEX idx_created_at (created_at),
    FOREIGN KEY (buyer_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    FOREIGN KEY (seller_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 支付回调记录表
CREATE TABLE IF NOT EXISTS payment_callbacks (
    id INT PRIMARY KEY AUTO_INCREMENT,
    order_no VARCHAR(64) NOT NULL,
    transaction_id VARCHAR(100) COMMENT '第三方交易号',
    amount DECIMAL(10, 2) NOT NULL,
    payment_status VARCHAR(20) COMMENT '支付状态',
    raw_data JSON COMMENT '原始回调数据',
    callback_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_order_no (order_no),
    INDEX idx_transaction_id (transaction_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 收藏表
CREATE TABLE IF NOT EXISTS favorites (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    product_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY uk_user_product (user_id, product_id),
    INDEX idx_user_id (user_id),
    INDEX idx_product_id (product_id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 评价表
CREATE TABLE IF NOT EXISTS reviews (
    id INT PRIMARY KEY AUTO_INCREMENT,
    order_id INT NOT NULL,
    product_id INT NOT NULL,
    user_id INT NOT NULL,
    rating TINYINT DEFAULT 5 COMMENT '评分1-5',
    content TEXT COMMENT '评价内容',
    images JSON COMMENT '评价图片',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_product_id (product_id),
    INDEX idx_user_id (user_id),
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 插入默认管理员用户 (密码: admin123)
INSERT INTO users (username, password, nickname, role) VALUES 
('admin', '$2a$10$xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx', '管理员', 'admin');

-- 插入示例虾品种数据
INSERT INTO shrimp_species (name, description, category, difficulty, lifespan, origin) VALUES
('樱花虾', '体型小巧，呈淡粉色，适合草缸饲养', '观赏', '简单', 24, '日本'),
('水晶虾', '白色透明体色，观赏价值高，饲养难度中等', '观赏', '中等', 18, '日本'),
('极火虾', '红色鲜艳，适合新手入门', '观赏', '简单', 24, '中国'),
('蓝丝绒虾', '蓝色体色优雅，温和易养', '观赏', '简单', 24, '台湾'),
('黄金米虾', '金黄色泽，价格亲民', '观赏', '简单', 18, '中国'),
('黑金刚虾', '通体黑色，体型较大', '观赏', '中等', 36, '东南亚'),
('苏虾', '体型迷你，红白相间', '观赏', '困难', 12, '苏拉威西'),
('蓝魔虾', '蓝色螯虾，观赏性强', '观赏', '中等', 36, '澳洲');

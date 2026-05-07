const express = require('express');
const { pool } = require('../config/database');
const router = express.Router();

// 获取排行榜数据
router.get('/', async (req, res, next) => {
    try {
        const { type = 'all', limit = 10 } = req.query;
        const limitNum = Math.min(parseInt(limit), 100);

        let result = {};

        // 销量排行榜 - 热销虾品
        if (type === 'all' || type === 'sales') {
            const [salesRanking] = await pool.query(
                `SELECT p.id, p.title, p.price, p.sales_count, p.view_count, p.images,
                        s.name as species_name,
                        u.nickname as seller_name
                 FROM products p
                 LEFT JOIN shrimp_species s ON p.species_id = s.id
                 LEFT JOIN users u ON p.seller_id = u.id
                 WHERE p.status = 1 AND p.sales_count > 0
                 ORDER BY p.sales_count DESC
                 LIMIT ?`,
                [limitNum]
            );
            result.sales = salesRanking.map(p => ({
                ...p,
                images: typeof p.images === 'string' ? JSON.parse(p.images || '[]') : p.images
            }));
        }

        // 新品排行榜 - 最新发布
        if (type === 'all' || type === 'new') {
            const [newRanking] = await pool.query(
                `SELECT p.id, p.title, p.price, p.created_at, p.images,
                        s.name as species_name,
                        u.nickname as seller_name,
                        TIMESTAMPDIFF(HOUR, p.created_at, NOW()) as hours_ago
                 FROM products p
                 LEFT JOIN shrimp_species s ON p.species_id = s.id
                 LEFT JOIN users u ON p.seller_id = u.id
                 WHERE p.status = 1
                 ORDER BY p.created_at DESC
                 LIMIT ?`,
                [limitNum]
            );
            result.new = newRanking.map(p => ({
                ...p,
                images: typeof p.images === 'string' ? JSON.parse(p.images || '[]') : p.images
            }));
        }

        // 人气排行榜 - 浏览量最高
        if (type === 'all' || type === 'popular') {
            const [popularRanking] = await pool.query(
                `SELECT p.id, p.title, p.price, p.view_count, p.images,
                        s.name as species_name,
                        u.nickname as seller_name
                 FROM products p
                 LEFT JOIN shrimp_species s ON p.species_id = s.id
                 LEFT JOIN users u ON p.seller_id = u.id
                 WHERE p.status = 1
                 ORDER BY p.view_count DESC
                 LIMIT ?`,
                [limitNum]
            );
            result.popular = popularRanking.map(p => ({
                ...p,
                images: typeof p.images === 'string' ? JSON.parse(p.images || '[]') : p.images
            }));
        }

        // 热销卖家排行榜
        if (type === 'all' || type === 'sellers') {
            const [sellerRanking] = await pool.query(
                `SELECT u.id, u.nickname, u.avatar, 
                        COUNT(DISTINCT p.id) as product_count,
                        COALESCE(SUM(p.sales_count), 0) as total_sales,
                        COALESCE(SUM(o.amount), 0) as total_revenue
                 FROM users u
                 LEFT JOIN products p ON u.id = p.seller_id AND p.status = 1
                 LEFT JOIN orders o ON o.seller_id = u.id AND o.status = 'completed'
                 WHERE u.status = 1
                 GROUP BY u.id
                 HAVING total_sales > 0
                 ORDER BY total_sales DESC
                 LIMIT ?`,
                [limitNum]
            );
            result.sellers = sellerRanking;
        }

        // 消费榜 - 购买最多的用户
        if (type === 'all' || type === 'buyers') {
            const [buyerRanking] = await pool.query(
                `SELECT u.id, u.nickname, u.avatar,
                        COUNT(o.id) as order_count,
                        COALESCE(SUM(o.amount), 0) as total_spent
                 FROM users u
                 LEFT JOIN orders o ON u.id = o.buyer_id AND o.status = 'completed'
                 WHERE u.status = 1
                 GROUP BY u.id
                 HAVING order_count > 0
                 ORDER BY total_spent DESC
                 LIMIT ?`,
                [limitNum]
            );
            result.buyers = buyerRanking;
        }

        // 分类排行榜
        if (type === 'all' || type === 'categories') {
            const [categoryRanking] = await pool.query(
                `SELECT s.category, 
                        COUNT(DISTINCT p.id) as product_count,
                        COALESCE(SUM(p.sales_count), 0) as total_sales
                 FROM shrimp_species s
                 LEFT JOIN products p ON s.id = p.species_id AND p.status = 1
                 WHERE s.category IS NOT NULL
                 GROUP BY s.category
                 ORDER BY total_sales DESC`
            );
            result.categories = categoryRanking;
        }

        res.json({
            code: 200,
            message: 'success',
            data: result
        });

    } catch (error) {
        next(error);
    }
});

// 获取每日/每周/每月榜单(可扩展)
router.get('/trending', async (req, res, next) => {
    try {
        const { period = 'day', limit = 10 } = req.query;
        const limitNum = Math.min(parseInt(limit), 50);

        let timeFilter;
        switch (period) {
            case 'week':
                timeFilter = '1 WEEK';
                break;
            case 'month':
                timeFilter = '1 MONTH';
                break;
            case 'day':
            default:
                timeFilter = '1 DAY';
        }

        // 获取时间段内的热销商品
        const [trendingProducts] = await pool.query(
            `SELECT p.id, p.title, p.price, p.images,
                    s.name as species_name,
                    u.nickname as seller_name,
                    COUNT(o.id) as recent_orders,
                    COALESCE(SUM(o.amount), 0) as recent_revenue
             FROM products p
             LEFT JOIN shrimp_species s ON p.species_id = s.id
             LEFT JOIN users u ON p.seller_id = u.id
             LEFT JOIN orders o ON p.id = o.product_id 
                 AND o.status = 'completed' 
                 AND o.created_at > DATE_SUB(NOW(), INTERVAL ${timeFilter})
             WHERE p.status = 1
             GROUP BY p.id
             HAVING recent_orders > 0
             ORDER BY recent_orders DESC
             LIMIT ?`,
            [limitNum]
        );

        const products = trendingProducts.map(p => ({
            ...p,
            images: typeof p.images === 'string' ? JSON.parse(p.images || '[]') : p.images
        }));

        res.json({
            code: 200,
            message: 'success',
            data: {
                period,
                products
            }
        });

    } catch (error) {
        next(error);
    }
});

// 获取统计数据
router.get('/stats', async (req, res, next) => {
    try {
        // 今日新增商品
        const [todayProducts] = await pool.query(
            'SELECT COUNT(*) as count FROM products WHERE DATE(created_at) = CURDATE()'
        );

        // 今日订单数
        const [todayOrders] = await pool.query(
            'SELECT COUNT(*) as count, COALESCE(SUM(amount), 0) as revenue FROM orders WHERE DATE(created_at) = CURDATE()'
        );

        // 注册用户数
        const [totalUsers] = await pool.query('SELECT COUNT(*) as count FROM users');

        // 在售商品数
        const [totalProducts] = await pool.query(
            'SELECT COUNT(*) as count FROM products WHERE status = 1'
        );

        // 平台总交易额
        const [totalRevenue] = await pool.query(
            'SELECT COALESCE(SUM(amount), 0) as revenue FROM orders WHERE status IN ("paid", "shipped", "completed")'
        );

        // 虾品种统计
        const [speciesStats] = await pool.query(
            `SELECT category, COUNT(*) as count 
             FROM shrimp_species 
             WHERE status = 1
             GROUP BY category`
        );

        res.json({
            code: 200,
            message: 'success',
            data: {
                today: {
                    new_products: todayProducts[0].count,
                    orders: todayOrders[0].count,
                    revenue: todayOrders[0].revenue
                },
                total: {
                    users: totalUsers[0].count,
                    products: totalProducts[0].count,
                    revenue: totalRevenue[0].revenue
                },
                species: speciesStats
            }
        });

    } catch (error) {
        next(error);
    }
});

module.exports = router;
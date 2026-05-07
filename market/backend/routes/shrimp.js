const express = require('express');
const { pool } = require('../config/database');
const { optionalAuth } = require('../middleware/auth');
const router = express.Router();

// 获取虾列表
router.get('/list', async (req, res, next) => {
    try {
        const {
            page = 1,
            limit = 20,
            category,
            minPrice,
            maxPrice,
            search,
            sortBy = 'created_at',
            sortOrder = 'desc',
            province,
            species_id
        } = req.query;

        const offset = (parseInt(page) - 1) * parseInt(limit);

        // 构建查询条件
        let whereConditions = ['p.status = 1'];
        let params = [];

        if (category) {
            whereConditions.push('s.category = ?');
            params.push(category);
        }

        if (species_id) {
            whereConditions.push('p.species_id = ?');
            params.push(species_id);
        }

        if (minPrice) {
            whereConditions.push('p.price >= ?');
            params.push(minPrice);
        }

        if (maxPrice) {
            whereConditions.push('p.price <= ?');
            params.push(maxPrice);
        }

        if (province) {
            whereConditions.push('p.province = ?');
            params.push(province);
        }

        if (search) {
            whereConditions.push('(p.title LIKE ? OR p.description LIKE ? OR s.name LIKE ?)');
            const searchPattern = `%${search}%`;
            params.push(searchPattern, searchPattern, searchPattern);
        }

        const whereClause = whereConditions.join(' AND ');

        // 验证排序字段
        const allowedSortFields = ['created_at', 'price', 'view_count', 'sales_count'];
        const orderField = allowedSortFields.includes(sortBy) ? sortBy : 'created_at';
        const orderDirection = sortOrder.toLowerCase() === 'asc' ? 'ASC' : 'DESC';

        // 获取总数
        const [countResult] = await pool.query(
            `SELECT COUNT(*) as total FROM products p 
             LEFT JOIN shrimp_species s ON p.species_id = s.id 
             WHERE ${whereClause}`,
            params
        );
        const total = countResult[0].total;

        // 获取列表
        const [rows] = await pool.query(
            `SELECT p.*, 
                    s.name as species_name, 
                    s.category, 
                    s.difficulty,
                    u.nickname as seller_name,
                    u.avatar as seller_avatar
             FROM products p
             LEFT JOIN shrimp_species s ON p.species_id = s.id
             LEFT JOIN users u ON p.seller_id = u.id
             WHERE ${whereClause}
             ORDER BY p.${orderField} ${orderDirection}
             LIMIT ? OFFSET ?`,
            [...params, parseInt(limit), offset]
        );

        // 处理图片JSON
        const products = rows.map(p => ({
            ...p,
            images: typeof p.images === 'string' ? JSON.parse(p.images || '[]') : p.images
        }));

        res.json({
            code: 200,
            message: 'success',
            data: {
                list: products,
                pagination: {
                    page: parseInt(page),
                    limit: parseInt(limit),
                    total,
                    totalPages: Math.ceil(total / parseInt(limit))
                }
            }
        });

    } catch (error) {
        next(error);
    }
});

// 获取虾详情
router.get('/detail/:id', async (req, res, next) => {
    try {
        const productId = req.params.id;

        // 更新浏览量
        await pool.query('UPDATE products SET view_count = view_count + 1 WHERE id = ?', [productId]);

        // 获取详情
        const [rows] = await pool.query(
            `SELECT p.*, 
                    s.name as species_name, 
                    s.description as species_description,
                    s.category, 
                    s.difficulty,
                    s.lifespan,
                    s.origin,
                    u.nickname as seller_name,
                    u.avatar as seller_avatar,
                    u.phone as seller_phone
             FROM products p
             LEFT JOIN shrimp_species s ON p.species_id = s.id
             LEFT JOIN users u ON p.seller_id = u.id
             WHERE p.id = ? AND p.status IN (1, 2)`,
            [productId]
        );

        if (rows.length === 0) {
            return res.status(404).json({
                code: 404,
                message: '商品不存在或已下架'
            });
        }

        const product = {
            ...rows[0],
            images: typeof rows[0].images === 'string' 
                ? JSON.parse(rows[0].images || '[]') 
                : rows[0].images
        };

        // 获取评价统计
        const [reviewStats] = await pool.query(
            `SELECT 
                COUNT(*) as total_reviews,
                AVG(rating) as avg_rating
             FROM reviews 
             WHERE product_id = ?`,
            [productId]
        );

        // 获取最新几条评价
        const [recentReviews] = await pool.query(
            `SELECT r.*, u.nickname, u.avatar
             FROM reviews r
             LEFT JOIN users u ON r.user_id = u.id
             WHERE r.product_id = ?
             ORDER BY r.created_at DESC
             LIMIT 5`,
            [productId]
        );

        res.json({
            code: 200,
            message: 'success',
            data: {
                ...product,
                review_stats: reviewStats[0],
                recent_reviews: recentReviews
            }
        });

    } catch (error) {
        next(error);
    }
});

// 获取虾品种列表
router.get('/species', async (req, res, next) => {
    try {
        const [rows] = await pool.query(
            'SELECT * FROM shrimp_species WHERE status = 1 ORDER BY name'
        );

        res.json({
            code: 200,
            message: 'success',
            data: rows
        });

    } catch (error) {
        next(error);
    }
});

// 发布虾商品(需要登录)
router.post('/publish', require('../middleware/auth').authenticateToken, async (req, res, next) => {
    try {
        const sellerId = req.user.id;
        const {
            species_id,
            title,
            description,
            price,
            original_price,
            stock,
            size,
            age,
            gender,
            images,
            province,
            city
        } = req.body;

        // 验证必填字段
        if (!species_id || !title || !price) {
            return res.status(400).json({
                code: 400,
                message: '缺少必填字段'
            });
        }

        const [result] = await pool.query(
            `INSERT INTO products 
             (species_id, seller_id, title, description, price, original_price, 
              stock, size, age, gender, images, province, city) 
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                species_id, sellerId, title, description, price, original_price || price,
                stock || 1, size, age, gender, 
                JSON.stringify(images || []), province, city
            ]
        );

        res.status(201).json({
            code: 201,
            message: '商品发布成功',
            data: { id: result.insertId }
        });

    } catch (error) {
        next(error);
    }
});

// 获取热门推荐
router.get('/hot', async (req, res, next) => {
    try {
        const { limit = 10 } = req.query;

        const [rows] = await pool.query(
            `SELECT p.*, 
                    s.name as species_name,
                    u.nickname as seller_name
             FROM products p
             LEFT JOIN shrimp_species s ON p.species_id = s.id
             LEFT JOIN users u ON p.seller_id = u.id
             WHERE p.status = 1
             ORDER BY p.sales_count DESC, p.view_count DESC
             LIMIT ?`,
            [parseInt(limit)]
        );

        const products = rows.map(p => ({
            ...p,
            images: typeof p.images === 'string' ? JSON.parse(p.images || '[]') : p.images
        }));

        res.json({
            code: 200,
            message: 'success',
            data: products
        });

    } catch (error) {
        next(error);
    }
});

// 获取最新发布
router.get('/new', async (req, res, next) => {
    try {
        const { limit = 10 } = req.query;

        const [rows] = await pool.query(
            `SELECT p.*, 
                    s.name as species_name,
                    u.nickname as seller_name
             FROM products p
             LEFT JOIN shrimp_species s ON p.species_id = s.id
             LEFT JOIN users u ON p.seller_id = u.id
             WHERE p.status = 1
             ORDER BY p.created_at DESC
             LIMIT ?`,
            [parseInt(limit)]
        );

        const products = rows.map(p => ({
            ...p,
            images: typeof p.images === 'string' ? JSON.parse(p.images || '[]') : p.images
        }));

        res.json({
            code: 200,
            message: 'success',
            data: products
        });

    } catch (error) {
        next(error);
    }
});

module.exports = router;
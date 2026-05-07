const express = require('express');
const { pool } = require('../config/database');
const { authenticateToken } = require('../middleware/auth');
const { v4: uuidv4 } = require('uuid');
const router = express.Router();

// 生成订单号
const generateOrderNo = () => {
    const date = new Date();
    const dateStr = date.toISOString().slice(0, 10).replace(/-/g, '');
    const random = Math.random().toString(36).substring(2, 8).toUpperCase();
    return `SHRIMP${dateStr}${random}`;
};

// 创建订单 (目录包下载模式)
router.post('/create', authenticateToken, async (req, res, next) => {
    try {
        const buyerId = req.user.id;
        const { product_id, quantity = 1, remark } = req.body;

        if (!product_id) {
            return res.status(400).json({
                code: 400,
                message: '商品ID不能为空'
            });
        }

        // 获取商品信息
        const [products] = await pool.query(
            'SELECT * FROM products WHERE id = ? AND status = 1',
            [product_id]
        );

        if (products.length === 0) {
            return res.status(404).json({
                code: 404,
                message: '商品不存在或已下架'
            });
        }

        const product = products[0];

        // 不能购买自己的商品
        if (product.seller_id === buyerId) {
            return res.status(400).json({
                code: 400,
                message: '不能购买自己的商品'
            });
        }

        // 检查库存
        if (product.stock < quantity) {
            return res.status(400).json({
                code: 400,
                message: '库存不足'
            });
        }

        // 计算订单金额
        const amount = parseFloat(product.price) * quantity;

        // 生成订单号
        const orderNo = generateOrderNo();

        // 创建订单 (目录包模式，无需收货地址)
        const [result] = await pool.query(
            `INSERT INTO orders 
             (order_no, buyer_id, product_id, seller_id, amount, quantity, remark) 
             VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [orderNo, buyerId, product_id, product.seller_id, amount, quantity, remark]
        );

        res.status(201).json({
            code: 201,
            message: '订单创建成功',
            data: {
                order_id: result.insertId,
                order_no: orderNo,
                amount,
                status: 'pending'
            }
        });

    } catch (error) {
        next(error);
    }
});

// 订单列表
router.get('/list', authenticateToken, async (req, res, next) => {
    try {
        const buyerId = req.user.id;
        const { page = 1, limit = 20, status } = req.query;
        const offset = (parseInt(page) - 1) * parseInt(limit);

        let whereConditions = ['buyer_id = ?'];
        let params = [buyerId];

        if (status) {
            whereConditions.push('status = ?');
            params.push(status);
        }

        const whereClause = whereConditions.join(' AND ');

        // 获取总数
        const [countResult] = await pool.query(
            `SELECT COUNT(*) as total FROM orders WHERE ${whereClause}`,
            params
        );
        const total = countResult[0].total;

        // 获取订单列表
        const [rows] = await pool.query(
            `SELECT o.*, 
                    p.title as product_title,
                    p.price as product_price,
                    p.images as product_images,
                    s.name as species_name,
                    u.nickname as seller_name
             FROM orders o
             LEFT JOIN products p ON o.product_id = p.id
             LEFT JOIN shrimp_species s ON p.species_id = s.id
             LEFT JOIN users u ON o.seller_id = u.id
             WHERE ${whereClause}
             ORDER BY o.created_at DESC
             LIMIT ? OFFSET ?`,
            [...params, parseInt(limit), offset]
        );

        const orders = rows.map(o => ({
            ...o,
            product_images: typeof o.product_images === 'string' 
                ? JSON.parse(o.product_images || '[]') 
                : o.product_images
        }));

        res.json({
            code: 200,
            message: 'success',
            data: {
                list: orders,
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

// 销售订单列表
router.get('/sold', authenticateToken, async (req, res, next) => {
    try {
        const sellerId = req.user.id;
        const { page = 1, limit = 20, status } = req.query;
        const offset = (parseInt(page) - 1) * parseInt(limit);

        let whereConditions = ['o.seller_id = ?'];
        let params = [sellerId];

        if (status) {
            whereConditions.push('o.status = ?');
            params.push(status);
        }

        const whereClause = whereConditions.join(' AND ');

        // 获取总数
        const [countResult] = await pool.query(
            `SELECT COUNT(*) as total FROM orders o WHERE ${whereClause}`,
            params
        );
        const total = countResult[0].total;

        // 获取订单列表
        const [rows] = await pool.query(
            `SELECT o.*, 
                    p.title as product_title,
                    p.price as product_price,
                    p.images as product_images,
                    s.name as species_name,
                    u.nickname as buyer_name
             FROM orders o
             LEFT JOIN products p ON o.product_id = p.id
             LEFT JOIN shrimp_species s ON p.species_id = s.id
             LEFT JOIN users u ON o.buyer_id = u.id
             WHERE ${whereClause}
             ORDER BY o.created_at DESC
             LIMIT ? OFFSET ?`,
            [...params, parseInt(limit), offset]
        );

        const orders = rows.map(o => ({
            ...o,
            product_images: typeof o.product_images === 'string' 
                ? JSON.parse(o.product_images || '[]') 
                : o.product_images
        }));

        res.json({
            code: 200,
            message: 'success',
            data: {
                list: orders,
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

// 订单详情
router.get('/detail/:id', authenticateToken, async (req, res, next) => {
    try {
        const orderId = req.params.id;
        const userId = req.user.id;

        // 获取订单详情
        const [rows] = await pool.query(
            `SELECT o.*, 
                    p.title as product_title,
                    p.price as product_price,
                    p.images as product_images,
                    p.description as product_description,
                    s.name as species_name,
                    seller.nickname as seller_name,
                    seller.phone as seller_phone,
                    buyer.nickname as buyer_name,
                    buyer.phone as buyer_phone
             FROM orders o
             LEFT JOIN products p ON o.product_id = p.id
             LEFT JOIN shrimp_species s ON p.species_id = s.id
             LEFT JOIN users seller ON o.seller_id = seller.id
             LEFT JOIN users buyer ON o.buyer_id = buyer.id
             WHERE o.id = ? AND (o.buyer_id = ? OR o.seller_id = ?)`,
            [orderId, userId, userId]
        );

        if (rows.length === 0) {
            return res.status(404).json({
                code: 404,
                message: '订单不存在'
            });
        }

        const order = {
            ...rows[0],
            product_images: typeof rows[0].product_images === 'string' 
                ? JSON.parse(rows[0].product_images || '[]') 
                : rows[0].product_images
        };

        res.json({
            code: 200,
            message: 'success',
            data: order
        });

    } catch (error) {
        next(error);
    }
});

// 取消订单
router.post('/cancel/:id', authenticateToken, async (req, res, next) => {
    try {
        const orderId = req.params.id;
        const userId = req.user.id;

        // 查询订单
        const [orders] = await pool.query(
            'SELECT * FROM orders WHERE id = ? AND buyer_id = ?',
            [orderId, userId]
        );

        if (orders.length === 0) {
            return res.status(404).json({
                code: 404,
                message: '订单不存在'
            });
        }

        const order = orders[0];

        // 只有待付款的订单可以取消
        if (order.status !== 'pending') {
            return res.status(400).json({
                code: 400,
                message: '当前状态无法取消订单'
            });
        }

        // 更新订单状态
        await pool.query(
            'UPDATE orders SET status = ? WHERE id = ?',
            ['cancelled', orderId]
        );

        // 恢复商品库存
        await pool.query(
            'UPDATE products SET stock = stock + ? WHERE id = ?',
            [order.quantity, order.product_id]
        );

        res.json({
            code: 200,
            message: '订单已取消'
        });

    } catch (error) {
        next(error);
    }
});

// 确认下载 (目录包模式：付款后自动生成下载链接)
router.post('/confirm/:id', authenticateToken, async (req, res, next) => {
    try {
        const orderId = req.params.id;
        const userId = req.user.id;

        // 查询订单
        const [orders] = await pool.query(
            'SELECT * FROM orders WHERE id = ? AND buyer_id = ?',
            [orderId, userId]
        );

        if (orders.length === 0) {
            return res.status(404).json({
                code: 404,
                message: '订单不存在'
            });
        }

        const order = orders[0];

        // 目录包模式：已付款订单可直接下载
        if (order.status !== 'paid') {
            return res.status(400).json({
                code: 400,
                message: '当前状态无法下载'
            });
        }

        // 获取商品信息以生成下载链接
        const [products] = await pool.query(
            'SELECT * FROM products WHERE id = ?',
            [order.product_id]
        );

        if (products.length === 0) {
            return res.status(404).json({
                code: 404,
                message: '商品不存在'
            });
        }

        const product = products[0];

        // 开启事务
        const connection = await pool.getConnection();
        try {
            await connection.beginTransaction();

            // 生成下载链接 (模拟：实际应该存储在云存储)
            const downloadUrl = `/downloads/${order.order_no}/${product.id}`;

            // 更新订单状态为已完成，同时保存下载链接
            await connection.query(
                'UPDATE orders SET status = ?, download_url = ?, updated_at = NOW() WHERE id = ?',
                ['completed', downloadUrl, orderId]
            );

            // 更新卖家销售统计
            await connection.query(
                'UPDATE users SET total_spent = total_spent + ? WHERE id = ?',
                [order.amount, order.seller_id]
            );

            // 更新商品销量
            await connection.query(
                'UPDATE products SET sales_count = sales_count + ? WHERE id = ?',
                [order.quantity, order.product_id]
            );

            await connection.commit();

            res.json({
                code: 200,
                message: '下载链接已生成',
                data: {
                    download_url: downloadUrl,
                    product_title: product.title
                }
            });

        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }

    } catch (error) {
        next(error);
    }
});

// 获取下载链接 (已完成的订单)
router.get('/download/:id', authenticateToken, async (req, res, next) => {
    try {
        const orderId = req.params.id;
        const userId = req.user.id;

        // 查询订单
        const [orders] = await pool.query(
            'SELECT * FROM orders WHERE id = ? AND buyer_id = ?',
            [orderId, userId]
        );

        if (orders.length === 0) {
            return res.status(404).json({
                code: 404,
                message: '订单不存在'
            });
        }

        const order = orders[0];

        // 只有已完成的订单才能下载
        if (order.status !== 'completed') {
            return res.status(400).json({
                code: 400,
                message: '订单未完成，无法下载'
            });
        }

        // 获取商品信息
        const [products] = await pool.query(
            'SELECT * FROM products WHERE id = ?',
            [order.product_id]
        );

        if (products.length === 0) {
            return res.status(404).json({
                code: 404,
                message: '商品不存在'
            });
        }

        const product = products[0];

        // 返回下载信息
        res.json({
            code: 200,
            message: 'success',
            data: {
                download_url: order.download_url || `/downloads/${order.order_no}/${product.id}`,
                product_title: product.title,
                order_no: order.order_no
            }
        });

    } catch (error) {
        next(error);
    }
});

module.exports = router;
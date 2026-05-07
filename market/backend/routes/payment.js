const express = require('express');
const { pool } = require('../config/database');
const { authenticateToken } = require('../middleware/auth');
const router = express.Router();

// 支付回调(模拟第三方支付)
router.post('/callback', async (req, res, next) => {
    try {
        const { order_no, transaction_id, amount, status, payment_method } = req.body;

        if (!order_no || !transaction_id || !amount || !status) {
            return res.status(400).json({
                code: 400,
                message: '缺少必要参数'
            });
        }

        console.log(`📦 收到支付回调: 订单号=${order_no}, 交易号=${transaction_id}, 金额=${amount}, 状态=${status}`);

        // 记录回调
        await pool.query(
            `INSERT INTO payment_callbacks 
             (order_no, transaction_id, amount, payment_status, raw_data) 
             VALUES (?, ?, ?, ?, ?)`,
            [order_no, transaction_id, amount, status, JSON.stringify(req.body)]
        );

        // 查询订单
        const [orders] = await pool.query(
            'SELECT * FROM orders WHERE order_no = ?',
            [order_no]
        );

        if (orders.length === 0) {
            return res.status(404).json({
                code: 404,
                message: '订单不存在'
            });
        }

        const order = orders[0];

        // 防止重复处理
        if (order.status !== 'pending') {
            return res.json({
                code: 200,
                message: '订单已处理'
            });
        }

        // 根据支付状态更新订单
        let newOrderStatus = order.status;
        
        switch (status) {
            case 'success':
                newOrderStatus = 'paid';
                break;
            case 'failed':
                newOrderStatus = 'cancelled';
                break;
            case 'refunded':
                newOrderStatus = 'refunded';
                break;
        }

        // 开启事务处理
        const connection = await pool.getConnection();
        try {
            await connection.beginTransaction();

            // 更新订单状态
            await connection.query(
                `UPDATE orders 
                 SET status = ?, payment_method = ?, payment_time = NOW(), updated_at = NOW() 
                 WHERE id = ?`,
                [newOrderStatus, payment_method, order.id]
            );

            if (newOrderStatus === 'paid') {
                // 扣除库存
                await connection.query(
                    'UPDATE products SET stock = stock - ? WHERE id = ?',
                    [order.quantity, order.product_id]
                );

                // 如果库存为0，下架商品
                await connection.query(
                    'UPDATE products SET status = 2 WHERE id = ? AND stock <= 0',
                    [order.product_id]
                );
            }

            await connection.commit();

        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }

        res.json({
            code: 200,
            message: '回调处理成功'
        });

    } catch (error) {
        next(error);
    }
});

// 模拟支付接口
router.post('/pay', authenticateToken, async (req, res, next) => {
    try {
        const { order_id, payment_method = 'alipay' } = req.body;
        const userId = req.user.id;

        // 查询订单
        const [orders] = await pool.query(
            'SELECT * FROM orders WHERE id = ? AND buyer_id = ? AND status = ?',
            [order_id, userId, 'pending']
        );

        if (orders.length === 0) {
            return res.status(404).json({
                code: 404,
                message: '订单不存在或状态不允许支付'
            });
        }

        const order = orders[0];

        // 模拟支付成功
        // 这里应该是调用第三方支付接口，这里简化处理直接成功
        const transaction_id = `TXN${Date.now()}${Math.random().toString(36).substring(7).toUpperCase()}`;

        const connection = await pool.getConnection();
        try {
            await connection.beginTransaction();

            // 更新订单状态
            await connection.query(
                `UPDATE orders 
                 SET status = 'paid', payment_method = ?, payment_time = NOW(), updated_at = NOW() 
                 WHERE id = ?`,
                [payment_method, order.id]
            );

            // 扣除库存
            await connection.query(
                'UPDATE products SET stock = stock - ? WHERE id = ?',
                [order.quantity, order.product_id]
            );

            // 如果库存为0，下架商品
            await connection.query(
                'UPDATE products SET status = 2 WHERE id = ? AND stock <= 0',
                [order.product_id]
            );

            await connection.commit();

            res.json({
                code: 200,
                message: '支付成功',
                data: {
                    order_id: order.id,
                    order_no: order.order_no,
                    transaction_id,
                    amount: order.amount
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

module.exports = router;
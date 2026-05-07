const express = require('express');
const bcrypt = require('bcryptjs');
const { pool } = require('../config/database');
const { authenticateToken, generateToken } = require('../middleware/auth');
const router = express.Router();

// 用户注册
router.post('/register', async (req, res, next) => {
    try {
        const { username, password, nickname, phone, email } = req.body;

        // 验证必填字段
        if (!username || !password) {
            return res.status(400).json({
                code: 400,
                message: '用户名和密码不能为空'
            });
        }

        if (username.length < 3 || username.length > 20) {
            return res.status(400).json({
                code: 400,
                message: '用户名长度需在3-20个字符之间'
            });
        }

        if (password.length < 6) {
            return res.status(400).json({
                code: 400,
                message: '密码长度不能少于6位'
            });
        }

        // 检查用户名是否已存在
        const [existingUsers] = await pool.query(
            'SELECT id FROM users WHERE username = ?',
            [username]
        );

        if (existingUsers.length > 0) {
            return res.status(400).json({
                code: 400,
                message: '用户名已存在'
            });
        }

        // 加密密码
        const hashedPassword = await bcrypt.hash(password, 10);

        // 创建用户
        const [result] = await pool.query(
            `INSERT INTO users (username, password, nickname, phone, email) 
             VALUES (?, ?, ?, ?, ?)`,
            [username, hashedPassword, nickname || username, phone, email]
        );

        // 生成令牌
        const token = generateToken({
            id: result.insertId,
            username
        });

        res.status(201).json({
            code: 201,
            message: '注册成功',
            data: {
                id: result.insertId,
                username,
                nickname: nickname || username,
                token
            }
        });

    } catch (error) {
        next(error);
    }
});

// 用户登录
router.post('/login', async (req, res, next) => {
    try {
        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(400).json({
                code: 400,
                message: '用户名和密码不能为空'
            });
        }

        // 查询用户
        const [users] = await pool.query(
            'SELECT * FROM users WHERE username = ?',
            [username]
        );

        if (users.length === 0) {
            return res.status(401).json({
                code: 401,
                message: '用户名或密码错误'
            });
        }

        const user = users[0];

        // 检查账户状态
        if (user.status === 0) {
            return res.status(403).json({
                code: 403,
                message: '账户已被禁用，请联系客服'
            });
        }

        // 验证密码
        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(401).json({
                code: 401,
                message: '用户名或密码错误'
            });
        }

        // 生成令牌
        const token = generateToken({
            id: user.id,
            username: user.username
        });

        // 返回用户信息
        res.json({
            code: 200,
            message: '登录成功',
            data: {
                id: user.id,
                username: user.username,
                nickname: user.nickname,
                avatar: user.avatar,
                phone: user.phone,
                email: user.email,
                balance: user.balance,
                total_spent: user.total_spent,
                token
            }
        });

    } catch (error) {
        next(error);
    }
});

// 获取用户信息
router.get('/profile', authenticateToken, async (req, res, next) => {
    try {
        const userId = req.user.id;

        const [users] = await pool.query(
            'SELECT id, username, nickname, avatar, phone, email, balance, total_spent, created_at FROM users WHERE id = ?',
            [userId]
        );

        if (users.length === 0) {
            return res.status(404).json({
                code: 404,
                message: '用户不存在'
            });
        }

        // 获取用户统计数据
        const [stats] = await pool.query(
            `SELECT 
                (SELECT COUNT(*) FROM products WHERE seller_id = ? AND status = 1) as selling_count,
                (SELECT COUNT(*) FROM orders WHERE buyer_id = ?) as bought_count,
                (SELECT COUNT(*) FROM orders WHERE seller_id = ?) as sold_count,
                (SELECT COUNT(*) FROM favorites WHERE user_id = ?) as favorite_count`,
            [userId, userId, userId, userId]
        );

        res.json({
            code: 200,
            message: 'success',
            data: {
                ...users[0],
                stats: stats[0]
            }
        });

    } catch (error) {
        next(error);
    }
});

// 更新用户信息
router.put('/profile', authenticateToken, async (req, res, next) => {
    try {
        const userId = req.user.id;
        const { nickname, avatar, phone, email } = req.body;

        const updates = [];
        const params = [];

        if (nickname) {
            updates.push('nickname = ?');
            params.push(nickname);
        }
        if (avatar) {
            updates.push('avatar = ?');
            params.push(avatar);
        }
        if (phone) {
            updates.push('phone = ?');
            params.push(phone);
        }
        if (email) {
            updates.push('email = ?');
            params.push(email);
        }

        if (updates.length === 0) {
            return res.status(400).json({
                code: 400,
                message: '没有要更新的内容'
            });
        }

        params.push(userId);

        await pool.query(
            `UPDATE users SET ${updates.join(', ')} WHERE id = ?`,
            params
        );

        res.json({
            code: 200,
            message: '更新成功'
        });

    } catch (error) {
        next(error);
    }
});

// 修改密码
router.put('/password', authenticateToken, async (req, res, next) => {
    try {
        const userId = req.user.id;
        const { old_password, new_password } = req.body;

        if (!old_password || !new_password) {
            return res.status(400).json({
                code: 400,
                message: '原密码和新密码不能为空'
            });
        }

        if (new_password.length < 6) {
            return res.status(400).json({
                code: 400,
                message: '新密码长度不能少于6位'
            });
        }

        // 获取当前密码
        const [users] = await pool.query('SELECT password FROM users WHERE id = ?', [userId]);

        if (users.length === 0) {
            return res.status(404).json({
                code: 404,
                message: '用户不存在'
            });
        }

        // 验证原密码
        const isMatch = await bcrypt.compare(old_password, users[0].password);

        if (!isMatch) {
            return res.status(401).json({
                code: 401,
                message: '原密码错误'
            });
        }

        // 更新密码
        const hashedPassword = await bcrypt.hash(new_password, 10);

        await pool.query('UPDATE users SET password = ? WHERE id = ?', [hashedPassword, userId]);

        res.json({
            code: 200,
            message: '密码修改成功'
        });

    } catch (error) {
        next(error);
    }
});

module.exports = router;
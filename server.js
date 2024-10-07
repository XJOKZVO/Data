const express = require('express');
const bodyParser = require('body-parser');
const { Sequelize, DataTypes } = require('sequelize');
const path = require('path');
require('dotenv').config();

// Initialize express
const app = express();
app.use(bodyParser.urlencoded({ extended: false }));

// Set EJS as the templating engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Serve static files from the public directory
app.use(express.static(path.join(__dirname, 'public')));

// Setup PostgreSQL connection using Sequelize with environment variables
const sequelize = new Sequelize(process.env.POSTGRES_URL, {
    dialect: 'postgres',
    dialectOptions: {
        ssl: {
            require: true,
            rejectUnauthorized: false,
        },
    },
});

// Define a model for blog posts
const Post = sequelize.define('Date', {
    name: {
        type: DataTypes.STRING,
        allowNull: false, // الاسم
    },
    phone: {
        type: DataTypes.STRING,
        allowNull: false, // رقم التليفون
    },
    college: {
        type: DataTypes.STRING,
        allowNull: false, // الكلية
    },
    year: {
        type: DataTypes.STRING,
        allowNull: false, // الفرقة
    },
}, {
    timestamps: true,
});

// Sync models with the database
sequelize.sync()
    .then(() => console.log('Database synced'))
    .catch(err => console.error('Unable to connect to the database:', err));

// Routes

// Home page to list all posts
app.get('/date', async (req, res) => {
    try {
        const posts = await Post.findAll();
        res.render('index', { posts });
    } catch (error) {
        res.status(500).send('Unable to fetch posts');
    }
});

// Form to create a new post
app.get('/', (req, res) => {
    res.render('new-post');
});

// Create a new post
app.post('/posts', async (req, res) => {
    try {
        const { title, content, name, phone, college, year } = req.body;
        await Post.create({ title, content, name, phone, college, year });
        res.redirect('/');
    } catch (error) {
        res.status(500).send('Unable to create post');
    }
});

// Get a single post by ID
app.get('/posts/:id', async (req, res) => {
    try {
        const post = await Post.findByPk(req.params.id);
        if (post) {
            res.render('post-detail', { post });
        } else {
            res.status(404).send('Post not found');
        }
    } catch (error) {
        res.status(500).send('Unable to fetch post');
    }
});

// Update a post (render form)
app.get('/posts/:id/edit', async (req, res) => {
    try {
        const post = await Post.findByPk(req.params.id);
        if (post) {
            res.render('edit-post', { post });
        } else {
            res.status(404).send('Post not found');
        }
    } catch (error) {
        res.status(500).send('Unable to fetch post');
    }
});

// Update a post by ID
app.post('/posts/:id/edit', async (req, res) => {
    try {
        const { title, content, name, phone, college, year } = req.body;
        const post = await Post.findByPk(req.params.id);
        if (post) {
            post.title = title;
            post.content = content;
            post.name = name;
            post.phone = phone;
            post.college = college;
            post.year = year;
            await post.save();
            res.redirect(`/posts/${req.params.id}`);
        } else {
            res.status(404).send('Post not found');
        }
    } catch (error) {
        res.status(500).send('Unable to update post');
    }
});

// Delete a post by ID
app.post('/posts/:id/delete', async (req, res) => {
    try {
        const post = await Post.findByPk(req.params.id);
        if (post) {
            await post.destroy();
            res.redirect('/');
        } else {
            res.status(404).send('Post not found');
        }
    } catch (error) {
        res.status(500).send('Unable to delete post');
    }
});


app.listen(process.env.PORT, () => {
    console.log(`Server running on port ${process.env.PORT}`);
});

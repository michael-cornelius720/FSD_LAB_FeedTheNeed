const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Serve static files (HTML, CSS, JS, images)
app.use(express.static(__dirname));

app.get('/api/volunteers', (req, res) => {
    fs.readFile(path.join(__dirname, 'users.json'), 'utf8', (err, data) => {
        if (err) return res.status(500).json({ error: 'Server Error' });
        const users = JSON.parse(data);
        const volunteers = users.filter(u => u.role === 'volunteer').map(u => ({
            id: u.username,
            name: u.username,
            role: 'Delivery Volunteer'
        }));
        res.json(volunteers);
    });
});

app.post('/login', (req, res) => {
    const { username, password } = req.body;
    
    fs.readFile(path.join(__dirname, 'users.json'), 'utf8', (err, data) => {
        if (err) {
            return res.status(500).send('Server Error');
        }
        
        const users = JSON.parse(data);
        const user = users.find(u => u.username === username && u.password === password);
        
        if (user) {
            switch (user.role) {
                case 'admin':
                    return res.redirect('/dashboard.html?user=' + user.username);
                case 'donor':
                    return res.redirect('/donor.html?user=' + user.username);
                case 'volunteer':
                    return res.redirect('/volunteer.html?user=' + user.username);
                default:
                    return res.redirect('/index.html');
            }
        } else {
            return res.status(401).send('Invalid credentials. <a href="javascript:history.back()">Try again</a>');
        }
    });
});

app.post('/register', (req, res) => {
    const { username, password, role } = req.body;
    
    fs.readFile(path.join(__dirname, 'users.json'), 'utf8', (err, data) => {
        if (err) return res.status(500).send('Server Error');
        
        const users = JSON.parse(data);
        if (users.find(u => u.username === username)) {
            return res.status(400).send('Username already exists. <a href="javascript:history.back()">Go back</a>');
        }
        
        const newUser = { username, password, role };
        
        users.push(newUser);
        fs.writeFile(path.join(__dirname, 'users.json'), JSON.stringify(users, null, 2), (err) => {
            if (err) return res.status(500).send('Server Error');
            
            if (role === 'donor') return res.redirect('/donor.html?user=' + username);
            if (role === 'volunteer') return res.redirect('/volunteer.html?user=' + username);
            res.redirect('/index.html');
        });
    });
});

module.exports = app;

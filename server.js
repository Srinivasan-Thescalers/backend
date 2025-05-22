require('dotenv').config();
const express = require('express');
const cors = require('cors'); // Import the CORS middleware
const app = express();
const Product = require('./models/Taskmodel');
const mongoose = require('mongoose');
const User = require('./models/Usermodel'); // Import User model
const jwt = require('jsonwebtoken'); // Import JWT
const CustomUser = require('./models/CustomUsermodel'); // Import CustomUser model
const PerformanceModel = require('./models/PerformanceModel'); // Import the new model

const Mongourl = process.env.MONGO_URL;

// Enable CORS for requests from http://localhost:3000 and https://scalers-internaltool.vercel.app and allow specific headers
app.use(cors({
    origin: ['http://localhost:3000', 'https://scalers-internaltool.vercel.app'], // Allow localhost and hosted frontend
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// Explicitly handle preflight requests
app.options('*', cors());

app.use(express.json());

app.get('/', (req, res) => {
    res.send("hey i am running on port 3000");
});

app.get('/blog', (req, res) =>{
    res.send('this is blog route');
})

// Registration API
app.post('/register', async (req, res) => {
    try {
        const { username, email, password } = req.body;
        if (!username || !email || !password) {
            return res.status(400).json({ message: "All fields are required" });
        }

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: "Email already registered" });
        }

        const user = new User({ username, email, password });
        await user.save();
        res.status(201).json({ message: "User registered successfully" });
    } catch (error) {
        console.error("Error during registration:", error.message);
        res.status(500).json({ message: error.message });
    }
});

// Login API
app.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ message: "Email and password are required" });
        }

        const user = await User.findOne({ email });
        if (!user || !(await user.comparePassword(password))) {
            return res.status(401).json({ message: "Invalid email or password" });
        }

        const token = user.generateAuthToken();
        res.status(200).json({ token });
    } catch (error) {
        console.error("Error during login:", error.message);
        res.status(500).json({ message: error.message });
    }
});

// Custom User Registration API
app.post('/custom/register', async (req, res) => {
    try {
        const { username, email, password } = req.body;
        if (!username || !email || !password) {
            return res.status(400).json({ message: "All fields are required" });
        }

        const existingUser = await CustomUser.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: "Email already registered" });
        }

        const user = new CustomUser({ username, email, password });
        await user.save();
        res.status(201).json({ message: "Custom user registered successfully" });
    } catch (error) {
        console.error("Error during custom user registration:", error.message);
        res.status(500).json({ message: error.message });
    }
});

// Custom User Login API
app.post('/custom/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ message: "Email and password are required" });
        }

        const user = await CustomUser.findOne({ email });
        if (!user || !(await user.comparePassword(password))) {
            return res.status(401).json({ message: "Invalid email or password" });
        }

        const token = user.generateAuthToken();
        res.status(200).json({ token });
    } catch (error) {
        console.error("Error during custom user login:", error.message);
        res.status(500).json({ message: error.message });
    }
});

// Middleware to verify JWT
const authenticate = (req, res, next) => {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) {
        return res.status(401).json({ message: "Access denied. No token provided." });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        res.status(400).json({ message: "Invalid token" });
    }
};

// Protected route
app.get('/protected', authenticate, (req, res) => {
    res.status(200).json({ message: "This is a protected route", user: req.user });
});

app.post('/task', async (req, res) => {
    try {
        const { username, email, ...taskData } = req.body; // Extract username and email from the request body
        if (!username || !email) {
            return res.status(400).json({ message: "Username and email are required" });
        }

        const task = await Product.create({ ...taskData, username, email }); // Save task with username and email
        res.status(200).json(task);
        console.log(req.body);
    } catch (error) {
        console.log(error.message);
        res.status(500).json({ message: error.message });
    }
});

app.get('/task', async (req,res)=>{
    try {
        const product = await Product.find({});
        res.status(200).json(product)
        
        } catch (error) {
        console.log(error.message)
        res.status(500).json({message: error.message})
    }
})

app.get('/task/:email', async (req, res) => {
    try {
        const { email } = req.params; // Extract email from request parameters

        // Fetch all tasks for the given email
        const tasks = await Product.find({ email }); // Use Task.find instead of Product.find

        // If no tasks are found, return an empty array
        if (tasks.length === 0) {
            return res.status(200).json([]);
        }

        // Return the tasks
        res.status(200).json(tasks);
    } catch (error) {
        console.error("Error fetching tasks:", error.message);
        res.status(500).json({ message: error.message });
    }
});
app.delete('/task/:email', async (req, res) => {
    try {
        const { email } = req.params; // Extract email from request parameters
        const product = await Product.findOneAndDelete({ email }); // Find and delete task by email
        if (!product) {
            return res.status(404).json({ message: `No task found for email: ${email}` });
        }
        res.status(200).json(product);
    } catch (error) {
        console.log(error.message);
        res.status(500).json({ message: error.message });
    }
});

// Protected route to update feedback, comments, rating, and marks using task ID
app.put('/task/:id', authenticate, async (req, res) => {
    try {
        const { id } = req.params; // Extract task ID from the request parameters
        const { feedback, comments, percentage, rating, isCompleted } = req.body; // Include additional fields for update

        // Find the task by ID and update the fields
        const updatedTask = await Product.findByIdAndUpdate(
            id, // Query by task ID
            { $set: { feedback, comments, percentage, rating, isCompleted } }, // Update all specified fields
            { new: true } // Return the updated document
        );

        if (!updatedTask) {
            return res.status(404).json({ message: "Task not found for the given ID" });
        }

        res.status(200).json(updatedTask);
    } catch (error) {
        console.error("Error updating task:", error.message);
        res.status(500).json({ message: error.message });
    }
});


app.post('/performance', authenticate, async (req, res) => {
    try {
        const { username, email, partnerName, position, marks, percentage, rating, isCompleted } = req.body;

        // Validate required fields
        if (!username || !email || !partnerName || !position || marks == null || percentage == null || rating == null ||  isCompleted == null) {
            return res.status(400).json({ message: "Username, email, and all performance fields are required" });
        }

        // Create a new performance record
        const performance = new PerformanceModel({
            username,
            email,
            partnerName,
            position,
            marks,
            percentage,
            rating,
            isCompleted,
        });

        await performance.save();

        res.status(201).json({ message: "Performance record created successfully", performance });
    } catch (error) {
        console.error("Error creating performance record:", error.message);
        res.status(500).json({ message: error.message });
    }
});
// Protected GET API to fetch all performance records
app.get('/performance', authenticate, async (req, res) => {
    try {
        const performances = await PerformanceModel.find({});
        res.status(200).json(performances);
    } catch (error) {
        console.error("Error fetching performance records:", error.message);
        res.status(500).json({ message: error.message });
    }
});



mongoose.set('strictQuery', false)

mongoose.connect(Mongourl)
.then(()=>{
    console.log('connected to mongodb');
    app.listen(4000, ()=> {
        console.log("server is running in port 4000");
    })

    
}).catch((error)=>{
    console.log(error)
})


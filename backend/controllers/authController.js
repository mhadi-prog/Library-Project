const bcrypt = require('bcrypt');
const pool = require('../db');

exports.signup = async (req, res) => {
    const { name, email, password, role } = req.body;

    console.log('\n--- SIGNUP REQUEST ---');
    console.log('Received:', { name, email, role });

    try {
        // Validation
        if (!name || !email || !password || !role) {
            console.log('❌ Validation failed: Missing required fields');
            return res.status(400).json({ message: "All fields are required" });
        }

        // Hash password
        console.log('🔐 Hashing password...');
        const hashedPassword = await bcrypt.hash(password, 10);

        // Build query
        const query = `
            INSERT INTO Users (Name, Email, Password, Role)
            VALUES (@name, @email, @password, @role)
        `;

        console.log('📝 Creating request...');
        const request = pool.request();

        console.log('📝 Adding parameters...');
        request.input('name', name);
        request.input('email', email);
        request.input('password', hashedPassword);
        request.input('role', role);

        console.log('📝 Executing query...');
        const result = await request.query(query);

        console.log('✓ Query successful. Rows affected:', result.rowsAffected);
        return res.status(201).json({ message: "Signup successful" });

    } catch (err) {
        console.log(err);
        console.error('❌ Signup Error:', err.message);
        console.error('Error Code:', err.code);
        console.error('Error Number:', err.number);

        if (err.number === 2627) {
            return res.status(400).json({ message: "Email already exists" });
        }

        return res.status(500).json({ 
            message: "Server error during signup",
            error: err.message 
        });
    }
};

exports.login = async (req, res) => {
    const { email, password } = req.body;

    console.log('\n--- LOGIN REQUEST ---');
    console.log('Email:', email);

    try {
        // Validation
        if (!email || !password) {
            console.log('❌ Validation failed: Missing email or password');
            return res.status(400).json({ message: "Email and password are required" });
        }

        // Build query
        const query = `SELECT * FROM Users WHERE Email = @email`;

        console.log('📝 Creating request...');
        const request = pool.request();

        console.log('📝 Adding parameter...');
        request.input('email', email);

        console.log('📝 Executing query...');
        const result = await request.query(query);

        console.log('📊 Query result:', {
            resultExists: !!result,
            recordsetExists: !!result?.recordset,
            recordsetLength: result?.recordset?.length || 0
        });

        // Check result
        if (!result) {
            console.log('❌ Result is null/undefined');
            return res.status(500).json({ message: "Database query returned no result" });
        }

        // Get records
        const records = result?.recordset || [];

        if (records.length === 0) {
            console.log('❌ No user found with email:', email);
            return res.status(401).json({ message: "Invalid credentials" });
        }

        console.log('✓ User found');
        const user = records[0];

        console.log('🔐 Comparing passwords...');
        const isMatch = await bcrypt.compare(password, user.Password);

        if (!isMatch) {
            console.log('❌ Password mismatch');
            return res.status(401).json({ message: "Invalid credentials" });
        }

        console.log('✓ Password matches');

        const userResponse = {
            userID: user.UserID,
            name: user.Name,
            email: user.Email,
            role: user.Role
        };

        console.log('✓ Login successful');
        return res.status(200).json({ 
            message: "Login successful", 
            user: userResponse 
        });

    } catch (err) {
        console.error('❌ Login Error:', err.message);
        return res.status(500).json({ 
            message: "Server error during login",
            error: err.message 
        });
    }
};
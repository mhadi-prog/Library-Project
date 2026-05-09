const bcrypt = require('bcrypt');
const pool = require('../db');

// ================= SIGNUP =================
exports.signup = async (req, res) => {
    // Destructure all fields including the new Student-specific ones
    const { name, email, password, role, department, batchYear } = req.body;

    console.log('\n--- SIGNUP REQUEST ---');
    console.log('Received:', { name, email, role, department, batchYear });

    try {
        // Validation
        if (!name || !email || !password || !role) {
            console.log('❌ Validation failed: Missing basic fields');
            return res.status(400).json({ message: "All fields are required" });
        }

        // Student-specific validation
        if (role === 'Student' && (!department || !batchYear)) {
            return res.status(400).json({ message: "Department and Batch Year are required for students" });
        }

        console.log('🔐 Hashing password...');
        const hashedPassword = await bcrypt.hash(password, 10);

        // Updated Query to include Department and BatchYear columns
        const query = `
            INSERT INTO Users (Name, Email, Password, Role, Department, BatchYear)
            VALUES (@name, @email, @password, @role, @dept, @batch);
            SELECT SCOPE_IDENTITY() AS UserID;
        `;

        const request = pool.request();
        request.input('name', name);
        request.input('email', email);
        request.input('password', hashedPassword);
        request.input('role', role);
        
        // Use nulls if the user is an Admin
        request.input('dept', role === 'Student' ? department : null);
        request.input('batch', role === 'Student' ? parseInt(batchYear) : null);

        console.log('📝 Executing signup query...');
        const result = await request.query(query);
        const userID = result.recordset[0].UserID;

        console.log('✓ Signup successful. UserID:', userID);

        return res.status(201).json({
            message: "Signup successful",
            user: { userID, name, email, role }
        });

    } catch (err) {
        console.error('❌ Signup Error:', err.message);
        if (err.number === 2627) {
            return res.status(400).json({ message: "Email already exists" });
        }
        return res.status(500).json({ message: "Server error during signup", error: err.message });
    }
};

// ================= LOGIN =================
exports.login = async (req, res) => {
    const { email, password, role } = req.body;

    try {
        if (!email || !password || !role) {
            return res.status(400).json({ message: "Email, password and role are required" });
        }

        const request = pool.request();
        request.input('email', email);
        request.input('role', role);

        const result = await request.query(`SELECT * FROM Users WHERE Email = @email AND Role = @role`);
        const user = result.recordset[0];

        if (!user) {
            return res.status(401).json({ message: "Invalid credentials" });
        }

        const isMatch = await bcrypt.compare(password, user.Password);
        if (!isMatch) {
            return res.status(401).json({ message: "Invalid credentials" });
        }

        return res.status(200).json({
            message: "Login successful",
            user: { userID: user.UserID, name: user.Name, email: user.Email, role: user.Role }
        });

    } catch (err) {
        console.error('❌ Login Error:', err.message);
        return res.status(500).json({ message: "Server error during login" });
    }
};

// ================= VERIFY IDENTITY =================
exports.verifyIdentity = async (req, res) => {
    const { email, role, department, batchYear, name } = req.body;

    try {
        if (!email || !role) {
            return res.status(400).json({ message: "Email and role are required" });
        }

        const request = pool.request();
        request.input('email', email);
        request.input('role', role);

        const result = await request.query(`SELECT * FROM Users WHERE Email = @email AND Role = @role`);

        if (result.recordset.length === 0) {
            return res.status(404).json({ message: "No account found with this email" });
        }

        const user = result.recordset[0];

        if (role === 'Student') {
            // Fuzzy matching: Trim and Lowercase both sides
            const dbDept = (user.Department || "").toString().toLowerCase().trim();
            const inputDept = (department || "").toString().toLowerCase().trim();
            
            // Numeric matching: Ensure both are Integers
            const dbBatch = parseInt(user.BatchYear);
            const inputBatch = parseInt(batchYear);

            if (dbDept !== inputDept || dbBatch !== inputBatch) {
                console.log('❌ Student Mismatch:', { dbDept, inputDept, dbBatch, inputBatch });
                return res.status(401).json({ message: "Department or batch year does not match our records" });
            }
        } 
        else if (role === 'Admin') {
            const dbName = (user.Name || "").toString().toLowerCase().trim();
            const inputName = (name || "").toString().toLowerCase().trim();

            if (dbName !== inputName) {
                return res.status(401).json({ message: "Name does not match our records" });
            }
        }

        return res.status(200).json({ message: "Identity verified", userID: user.UserID });

    } catch (err) {
        console.error('❌ Verify Error:', err.message);
        return res.status(500).json({ message: "Server error" });
    }
};

// ================= RESET PASSWORD =================
exports.resetPassword = async (req, res) => {
    const { userID, newPassword } = req.body;

    try {
        if (!userID || !newPassword) {
            return res.status(400).json({ message: "User ID and new password are required" });
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);
        const request = pool.request();
        request.input('userID', userID);
        request.input('password', hashedPassword);

        await request.query(`UPDATE Users SET Password = @password WHERE UserID = @userID`);

        return res.status(200).json({ message: "Password reset successfully" });
    } catch (err) {
        console.error('❌ Reset Error:', err.message);
        return res.status(500).json({ message: "Server error" });
    }
};
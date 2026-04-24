const sql = require('mssql');
const { exec } = require('child_process');
const util = require('util');
const execPromise = util.promisify(exec);

console.log('🔍 SQL Server Diagnostic Tool\n');
console.log('='.repeat(60));

// Test 1: Check SQL Server Service Status
async function checkServiceStatus() {
    console.log('\n1️⃣  SQL Server Service Status:');
    try {
        const { stdout } = await execPromise('Get-Service | Where-Object {$_.Name -like "*SQL*"} | Select-Object Name, Status', { shell: 'powershell' });
        console.log(stdout);
    } catch (err) {
        console.log('⚠️  Could not check service status. Run PowerShell as Administrator.');
    }
}

// Test 2: Check SQL Server Protocols (Named Pipes, TCP/IP)
async function checkProtocols() {
    console.log('\n2️⃣  SQL Server Protocols:');
    console.log('Open SQL Server Configuration Manager and verify:');
    console.log('  ✓ SQLEXPRESS → Protocols for SQLEXPRESS');
    console.log('  ✓ Check if "Named Pipes" is ENABLED');
    console.log('  ✓ Check if "TCP/IP" is ENABLED');
}

// Test 3: Test connection with different configurations
async function testConnections() {
    console.log('\n3️⃣  Testing Different Connection Configurations:\n');

    const configs = [
        {
            name: 'localhost\\SQLEXPRESS (Named Pipes)',
            config: {
                user: 'LibraryProject_Admin',
                password: 'hadi1234',
                server: 'localhost\\SQLEXPRESS',
                database: 'master',
                options: { encrypt: false, trustServerCertificate: true }
            }
        },
        {
            name: '.\\SQLEXPRESS (Dot notation)',
            config: {
                user: 'LibraryProject_Admin',
                password: 'hadi1234',
                server: '.\\SQLEXPRESS',
                database: 'master',
                options: { encrypt: false, trustServerCertificate: true }
            }
        },
        {
            name: 'TCP/IP (127.0.0.1:1433)',
            config: {
                user: 'LibraryProject_Admin',
                password: 'hadi1234',
                server: '127.0.0.1',
                port: 1433,
                database: 'master',
                options: { encrypt: false, trustServerCertificate: true }
            }
        },
        {
            name: 'Windows Authentication (localhost\\SQLEXPRESS)',
            config: {
                server: 'localhost\\SQLEXPRESS',
                database: 'master',
                authentication: {
                    type: 'ntlm',
                    options: {
                        domain: 'HADI'
                    }
                },
                options: { encrypt: false, trustServerCertificate: true }
            }
        }
    ];

    for (const test of configs) {
        console.log(`\nTesting: ${test.name}`);
        console.log('-'.repeat(50));
        try {
            const pool = new sql.ConnectionPool(test.config);
            await pool.connect();
            console.log('✅ SUCCESS - Connection established!');
            console.log(`   Use this config: ${JSON.stringify(test.config, null, 2)}`);
            await pool.close();
            return; // Stop on first success
        } catch (err) {
            console.log(`❌ FAILED - ${err.message}`);
        }
    }
}

// Test 4: Check SQL Server Mixed Mode Authentication
function checkMixedMode() {
    console.log('\n4️⃣  Mixed Mode Authentication Check:');
    console.log('Open SQL Server Management Studio:');
    console.log('  1. Right-click on Server → Properties');
    console.log('  2. Go to Security tab');
    console.log('  3. Ensure "SQL Server and Windows Authentication mode" is selected');
    console.log('  4. NOT just "Windows Authentication mode"');
}

// Test 5: Check user login in SQL Server
function checkUserLogin() {
    console.log('\n5️⃣  Verify User Login in SQL Server:');
    console.log('In SQL Server Management Studio, run:');
    console.log(`  SELECT name, type_desc FROM sys.server_principals WHERE name = 'LibraryProject_Admin';`);
    console.log('\nIf no results, the user might not exist or was created in the wrong database.');
}

// Run all diagnostics
async function runDiagnostics() {
    await checkServiceStatus();
    await checkProtocols();
    await testConnections();
    checkMixedMode();
    checkUserLogin();
    console.log('\n' + '='.repeat(60));
    console.log('📋 Diagnostic Summary:');
    console.log('If all tests fail, check:');
    console.log('  1. SQL Server Mixed Mode is enabled');
    console.log('  2. Named Pipes protocol is enabled in SQL Server Configuration Manager');
    console.log('  3. TCP/IP protocol is enabled');
    console.log('  4. User "LibraryProject_Admin" exists at server level');
    console.log('  5. User password is correct');
    console.log('='.repeat(60) + '\n');
}

runDiagnostics().catch(console.error);
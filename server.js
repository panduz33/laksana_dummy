const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = 'your-secret-key-here';

app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());
app.use(cookieParser());

const dbPath = path.join(__dirname, 'database.db');
const db = new sqlite3.Database(dbPath);

db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS device_loans (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    device_category TEXT NOT NULL,
    device_merk TEXT NOT NULL,
    device_count INTEGER NOT NULL,
    condition TEXT NOT NULL,
    user_id INTEGER,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(user_id) REFERENCES users(id)
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS komoditas (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    device_category TEXT NOT NULL,
    device_name TEXT NOT NULL,
    total_quantity INTEGER NOT NULL DEFAULT 0,
    available_quantity INTEGER NOT NULL DEFAULT 0,
    loaned_quantity INTEGER NOT NULL DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS peminjaman (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nama_peminjam TEXT NOT NULL,
    tanggal_peminjaman DATE NOT NULL,
    nama_program TEXT NOT NULL,
    rencana_pengembalian DATE NOT NULL,
    alat_yang_dipinjam TEXT NOT NULL,
    remaining_items TEXT,
    nama_operator TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'active',
    return_details TEXT,
    returned_at DATETIME,
    user_id INTEGER,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(user_id) REFERENCES users(id)
  )`);

  const hashedPassword = bcrypt.hashSync('admin123', 10);
  db.run(`INSERT OR IGNORE INTO users (username, password) VALUES (?, ?)`, 
    ['admin', hashedPassword]);

  // Insert initial komoditas data
  const komoditasData = [
    ['Laptop', 'Dell Latitude 5420', 10, 8, 2],
    ['Laptop', 'HP EliteBook 840', 8, 5, 3],
    ['Projector', 'Epson EB-X41', 4, 3, 1],
    ['Projector', 'BenQ MX535', 4, 2, 2],
    ['Camera', 'Canon EOS 750D', 5, 4, 1],
    ['Camera', 'Sony Alpha 7 III', 3, 2, 1],
    ['Audio Equipment', 'Shure SM58 Microphone', 12, 10, 2],
    ['Audio Equipment', 'JBL EON615 Speaker', 8, 6, 2],
    ['Network Equipment', 'Cisco Catalyst 2960', 3, 3, 0],
    ['Network Equipment', 'TP-Link Archer C7', 8, 7, 1]
  ];

  komoditasData.forEach(item => {
    db.run(`INSERT OR IGNORE INTO komoditas (device_category, device_name, total_quantity, available_quantity, loaned_quantity) 
            VALUES (?, ?, ?, ?, ?)`, item);
  });
});

const authenticateToken = (req, res, next) => {
  // Try to get token from cookie first, then from Authorization header
  let token = req.cookies.authToken;
  
  if (!token) {
    const authHeader = req.headers['authorization'];
    token = authHeader && authHeader.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      if (err.name === 'TokenExpiredError') {
        return res.status(401).json({ error: 'Token expired' });
      }
      return res.status(403).json({ error: 'Invalid token' });
    }
    req.user = user;
    next();
  });
};

app.post('/api/login', (req, res) => {
  const { username, password } = req.body;

  db.get('SELECT * FROM users WHERE username = ?', [username], (err, user) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    if (!user || !bcrypt.compareSync(password, user.password)) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Create JWT token with 2-hour expiration
    const token = jwt.sign(
      { id: user.id, username: user.username }, 
      JWT_SECRET, 
      { expiresIn: '2h' }
    );

    // Set cookie with 2-hour expiration
    res.cookie('authToken', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 2 * 60 * 60 * 1000, // 2 hours in milliseconds
      sameSite: 'lax'
    });

    res.json({ 
      token, 
      user: { id: user.id, username: user.username },
      expiresAt: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString()
    });
  });
});

app.post('/api/logout', (req, res) => {
  res.clearCookie('authToken');
  res.json({ message: 'Logged out successfully' });
});

app.get('/api/auth/status', authenticateToken, (req, res) => {
  res.json({ 
    authenticated: true, 
    user: { id: req.user.id, username: req.user.username } 
  });
});

app.post('/api/device-loans', authenticateToken, (req, res) => {
  const { device_category, device_merk, device_count, condition } = req.body;
  const user_id = req.user.id;

  db.run(
    'INSERT INTO device_loans (device_category, device_merk, device_count, condition, user_id) VALUES (?, ?, ?, ?, ?)',
    [device_category, device_merk, device_count, condition, user_id],
    function(err) {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }
      res.json({ 
        id: this.lastID, 
        message: 'Device loan record created successfully' 
      });
    }
  );
});

app.get('/api/device-loans', authenticateToken, (req, res) => {
  db.all(
    'SELECT * FROM device_loans WHERE user_id = ? ORDER BY created_at DESC',
    [req.user.id],
    (err, rows) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }
      res.json(rows);
    }
  );
});

app.get('/api/komoditas', authenticateToken, (req, res) => {
  const { category, name } = req.query;
  
  let query = 'SELECT * FROM komoditas';
  let params = [];
  let conditions = [];
  
  if (category) {
    conditions.push('LOWER(device_category) LIKE LOWER(?)');
    params.push(`%${category}%`);
  }
  
  if (name) {
    conditions.push('LOWER(device_name) LIKE LOWER(?)');
    params.push(`%${name}%`);
  }
  
  if (conditions.length > 0) {
    query += ' WHERE ' + conditions.join(' AND ');
  }
  
  query += ' ORDER BY device_category, device_name';
  
  db.all(query, params, (err, rows) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    res.json(rows);
  });
});

app.post('/api/komoditas', authenticateToken, (req, res) => {
  const { device_category, device_name, quantity } = req.body;
  
  // Validate input
  if (!device_category || !device_name || !quantity || quantity < 1) {
    return res.status(400).json({ error: 'All fields are required and quantity must be greater than 0' });
  }

  // Check if item already exists
  db.get(
    'SELECT * FROM komoditas WHERE LOWER(device_category) = LOWER(?) AND LOWER(device_name) = LOWER(?)',
    [device_category, device_name],
    (err, existingItem) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }

      if (existingItem) {
        // Item exists, update quantity
        const newTotalQuantity = existingItem.total_quantity + quantity;
        const newAvailableQuantity = existingItem.available_quantity + quantity;
        
        db.run(
          'UPDATE komoditas SET total_quantity = ?, available_quantity = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
          [newTotalQuantity, newAvailableQuantity, existingItem.id],
          function(err) {
            if (err) {
              return res.status(500).json({ error: 'Database error' });
            }
            res.json({ 
              id: existingItem.id, 
              message: 'Item quantity updated successfully',
              added_quantity: quantity,
              new_total: newTotalQuantity
            });
          }
        );
      } else {
        // New item, create it
        db.run(
          'INSERT INTO komoditas (device_category, device_name, total_quantity, available_quantity, loaned_quantity) VALUES (?, ?, ?, ?, 0)',
          [device_category, device_name, quantity, quantity],
          function(err) {
            if (err) {
              return res.status(500).json({ error: 'Database error' });
            }
            res.json({ 
              id: this.lastID, 
              message: 'New item created successfully' 
            });
          }
        );
      }
    }
  );
});

// Peminjaman endpoints
app.post('/api/peminjaman', authenticateToken, (req, res) => {
  const { namaPeminjam, tanggalPeminjaman, namaProgram, rencanaPengembalian, alatYangDipinjam, namaOperator } = req.body;
  const user_id = req.user.id;

  db.run(
    'INSERT INTO peminjaman (nama_peminjam, tanggal_peminjaman, nama_program, rencana_pengembalian, alat_yang_dipinjam, remaining_items, nama_operator, user_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
    [namaPeminjam, tanggalPeminjaman, namaProgram, rencanaPengembalian, JSON.stringify(alatYangDipinjam), JSON.stringify(alatYangDipinjam), namaOperator, user_id],
    function(err) {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }
      res.json({ 
        id: this.lastID, 
        message: 'Peminjaman record created successfully' 
      });
    }
  );
});

app.get('/api/peminjaman', authenticateToken, (req, res) => {
  db.all(
    'SELECT * FROM peminjaman ORDER BY created_at DESC',
    [],
    (err, rows) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }
      
      // Parse the JSON fields
      const processedRows = rows.map(row => ({
        ...row,
        alatYangDipinjam: JSON.parse(row.alat_yang_dipinjam),
        remainingItems: row.remaining_items ? JSON.parse(row.remaining_items) : null
      }));
      
      res.json(processedRows);
    }
  );
});

app.patch('/api/peminjaman/:id/return', authenticateToken, (req, res) => {
  const { id } = req.params;
  const { returnedDevices } = req.body;
  
  // First, get the current loan data
  db.get('SELECT * FROM peminjaman WHERE id = ?', [id], (err, row) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    if (!row) {
      return res.status(404).json({ error: 'Peminjaman record not found' });
    }

    // Parse current remaining items (or use original items if first return)
    const remainingItems = row.remaining_items ? JSON.parse(row.remaining_items) : JSON.parse(row.alat_yang_dipinjam);
    
    // Calculate new remaining items after this return
    const newRemainingItems = remainingItems.map(originalItem => {
      const returnedItem = returnedDevices.find(ret => 
        ret.kategoriAlat === originalItem.kategoriAlat && ret.namaAlat === originalItem.namaAlat
      );
      
      if (returnedItem) {
        return {
          ...originalItem,
          jumlah: originalItem.jumlah - returnedItem.returnedCount
        };
      }
      return originalItem;
    }).filter(item => item.jumlah > 0); // Remove items with 0 remaining

    // Check if this is a partial return by comparing returned vs original quantities
    let isPartialReturn = false;
    
    // Check if any item is being returned partially (less than remaining amount)
    for (const returnedItem of returnedDevices) {
      const originalItem = remainingItems.find(item => 
        item.kategoriAlat === returnedItem.kategoriAlat && item.namaAlat === returnedItem.namaAlat
      );
      if (originalItem && returnedItem.returnedCount < originalItem.jumlah) {
        isPartialReturn = true;
        break;
      }
    }
    
    // Check if some items are not being returned at all
    if (!isPartialReturn) {
      const returnedItemKeys = returnedDevices.map(item => `${item.kategoriAlat}-${item.namaAlat}`);
      const remainingItemKeys = remainingItems.map(item => `${item.kategoriAlat}-${item.namaAlat}`);
      isPartialReturn = remainingItemKeys.some(key => !returnedItemKeys.includes(key));
    }

    // Determine status based on remaining items and partial return detection
    const status = newRemainingItems.length === 0 ? 'returned' : 'partial_return';
    
    // Store return details
    const returnDetails = returnedDevices ? JSON.stringify(returnedDevices) : null;
    const remainingItemsJson = JSON.stringify(newRemainingItems);
    
    db.run(
      'UPDATE peminjaman SET status = ?, remaining_items = ?, return_details = ?, returned_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [status, remainingItemsJson, returnDetails, id],
      function(err) {
        if (err) {
          return res.status(500).json({ error: 'Database error' });
        }
        res.json({ 
          message: status === 'returned' ? 'Peminjaman returned completely' : 'Partial return processed successfully',
          returnDetails: returnedDevices,
          remainingItems: newRemainingItems,
          status: status
        });
      }
    );
  });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
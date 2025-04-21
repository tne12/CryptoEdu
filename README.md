# CryptoEdu: Classical Encryption Learning Platform

![CryptoEdu Logo](https://your-repository-url/logo.png) ????

## Overview

CryptoEdu is an interactive web application designed to teach and demonstrate classical encryption techniques. The platform provides hands-on experience with various ciphers, step-by-step explanations of encryption and decryption processes, and tools for analyzing and breaking ciphers.

## Features

- **Interactive Cipher Implementations:**
  - Affine Cipher (encryption, decryption, and cryptanalysis)
  - Caesar Cipher (with brute force attack capability)
  - Vigenère Cipher
  - Playfair Cipher
  - Hill Cipher (2×2 and 3×3 matrices)
  - Extended Euclidean Algorithm calculator

- **Educational Components:**
  - Step-by-step explanations for each encryption/decryption operation
  - Visual representations of cipher mechanics
  - Historical context and security analysis
  - Matrix operations visualization for Hill cipher

- **User Features:**
  - User authentication system
  - Encryption history tracking
  - Responsive design for desktop and mobile devices

## Technologies Used

- **Frontend:**
  - Next.js 14 (App Router)
  - React 18
  - TypeScript
  - Tailwind CSS
  - shadcn/ui component library
  - Nginx (web server and proxy)
  - PM2 (production process manager for Node.js applications)

- **State Management:**
  - React Hooks (useState, useEffect)
  - Context API for user authentication

- **Styling:**
  - Tailwind CSS for responsive design
  - CSS Grid and Flexbox for layouts

## Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/cryptoedu.git
   cd cryptoedu

2. Install dependencies:
   ```bash
   npm install
   npm install --legacy-peer-deps

3. Run the development server:
   ```bash
   npm run dev

4. Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

## Deployment
This project runs on a Virtual Machine. Follow the steps below to deploy the app successfully.

Set your VM's Adapter 1 to: Bridged Adapter
This allows your VM to be accessible on the same network.
Open a terminal in your VM and run the following commands:
1. Install Dependencies in your VM:
   ```bash
   sudo apt update
   sudo apt install nodejs npm nginx sqlite3 git curl -y

2. Install pm2 globally:
   ```bash
   npm install -g pm2
3. Clone and Set Up the App:
   ```bash
   git clone https://github.com/yourusername/cryptoedu.git
   cd cryptoedu
   npm install --legacy-peer-deps

4. Since the app uses Next.js, so for production:
   ```bash
   npm run build
  
5. Start the app: 
    ```bash
    npm start
   
6. Use PM2 to Keep It Running:(keeps the app alive)
    ```bash
    pm2 start npm --name "cryptoedu" -- run start
    pm2 save
    pm2 startup

7. Follow the output it prints after step 7 (usually sudo env PATH=... pm2 startup systemd -u your-user-name).


8. Check status:
    ```bash
    pm2 status

9. Configure Nginx as a Reverse Proxy
  -Remove default page:
    ```bash
    sudo rm /etc/nginx/sites-enabled/default

  -Reveal your VM ip:
      ```bash
      ip a (usually like 192.X.X.X)

  -Create a new Nginx config to your VM: ```bash   sudo nano /etc/nginx/sites-available/cryptoedu

  -Paste this in the config: 
  server {
      listen 80;
      server_name 192.168.0.132;  # your VM's IP
      location / {
          proxy_pass http://localhost:3000;
          proxy_http_version 1.1;
          proxy_set_header Upgrade $http_upgrade;
          proxy_set_header Connection 'upgrade';
          proxy_set_header Host $host;
          proxy_cache_bypass $http_upgrade;}}
      
  -Enable the config: sudo ln -s /etc/nginx/sites-available/cryptoedu /etc/nginx/sites-enabled/
  
  -Test config: sudo nginx -t
  
  -Reload Nginx: sudo systemctl reload nginx

10. Access the App:
Open your browser
Go to:
http://localhost (from inside the VM)
http://your-vm-ip  (from host machine or network)



## Acknowledgments

- The project was developed as part of a cryptography course
- Cipher algorithms were modified from geekforgeeks

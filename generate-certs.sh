#!/bin/bash

echo "🔐 Setting up SSL certificates for development..."

# Create certificates directory in project root
mkdir -p certs
cd certs

# Generate private key
echo "📝 Generating private key..."
openssl genrsa -out server.key 2048

# Create certificate configuration with Subject Alternative Names
echo "📋 Creating certificate configuration..."
cat > server.conf <<EOF
[req]
distinguished_name = req_distinguished_name
req_extensions = v3_req
prompt = no

[req_distinguished_name]
C = US
ST = Development
L = Local
O = DevOrg
CN = localhost

[v3_req]
keyUsage = keyEncipherment, dataEncipherment
extendedKeyUsage = serverAuth
subjectAltName = @alt_names

[alt_names]
DNS.1 = localhost
DNS.2 = *.localhost
DNS.3 = fastify-backend
DNS.4 = vite-frontend
IP.1 = 127.0.0.1
IP.2 = ::1
EOF

# Generate self-signed certificate
echo "🔑 Generating self-signed certificate..."
openssl req -new -x509 -key server.key -out server.crt -days 365 -config server.conf -extensions v3_req

# Set proper permissions
chmod 600 server.key
chmod 644 server.crt

echo ""
echo "✅ SSL certificates generated successfully!"
echo ""
echo "📁 Files created in ./certs/:"
echo "   - server.key (private key)"
echo "   - server.crt (certificate)"
echo "   - server.conf (config file)"
echo ""
echo "🚀 Next steps:"
echo "   1. Update your backend and frontend configurations"
echo "   2. Run: docker-compose up --build"
echo "   3. Access your apps:"
echo "      - Frontend: https://localhost:5173"
echo "      - Backend:  https://localhost:3000"
echo ""
echo "⚠️  Note: You'll need to accept the security warning in your browser for self-signed certificates"

cd ..
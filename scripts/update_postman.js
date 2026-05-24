const fs = require('fs');

const path = 'd:/University/Nam3/Các công nghệ phần mềm mới/DoAn2/UTE-SHOP-01/UTE-SHOP-01/UTEShop_API_Collection.postman_collection.json';
const data = JSON.parse(fs.readFileSync(path, 'utf8'));

const sellerFolder = {
    "name": "Seller",
    "item": [
        {
            "name": "Products",
            "item": [
                {
                    "name": "Get Products",
                    "request": {
                        "auth": { "type": "bearer", "bearer": [ { "key": "token", "value": "{{token}}", "type": "string" } ] },
                        "method": "GET",
                        "header": [],
                        "url": { "raw": "{{baseUrl}}/seller/products", "host": [ "{{baseUrl}}" ], "path": [ "seller", "products" ] }
                    },
                    "response": []
                },
                {
                    "name": "Export Products",
                    "request": {
                        "auth": { "type": "bearer", "bearer": [ { "key": "token", "value": "{{token}}", "type": "string" } ] },
                        "method": "GET",
                        "header": [],
                        "url": { "raw": "{{baseUrl}}/seller/products/export", "host": [ "{{baseUrl}}" ], "path": [ "seller", "products", "export" ] }
                    },
                    "response": []
                }
            ]
        },
        {
            "name": "Orders",
            "item": [
                {
                    "name": "Get Orders",
                    "request": {
                        "auth": { "type": "bearer", "bearer": [ { "key": "token", "value": "{{token}}", "type": "string" } ] },
                        "method": "GET",
                        "header": [],
                        "url": { "raw": "{{baseUrl}}/seller/orders", "host": [ "{{baseUrl}}" ], "path": [ "seller", "orders" ] }
                    },
                    "response": []
                },
                {
                    "name": "Export Orders",
                    "request": {
                        "auth": { "type": "bearer", "bearer": [ { "key": "token", "value": "{{token}}", "type": "string" } ] },
                        "method": "GET",
                        "header": [],
                        "url": { "raw": "{{baseUrl}}/seller/orders/export", "host": [ "{{baseUrl}}" ], "path": [ "seller", "orders", "export" ] }
                    },
                    "response": []
                }
            ]
        },
        {
            "name": "Analytics",
            "item": [
                {
                    "name": "Get Analytics",
                    "request": {
                        "auth": { "type": "bearer", "bearer": [ { "key": "token", "value": "{{token}}", "type": "string" } ] },
                        "method": "GET",
                        "header": [],
                        "url": { "raw": "{{baseUrl}}/seller/analytics", "host": [ "{{baseUrl}}" ], "path": [ "seller", "analytics" ] }
                    },
                    "response": []
                },
                {
                    "name": "Export Analytics",
                    "request": {
                        "auth": { "type": "bearer", "bearer": [ { "key": "token", "value": "{{token}}", "type": "string" } ] },
                        "method": "GET",
                        "header": [],
                        "url": { "raw": "{{baseUrl}}/seller/analytics/export", "host": [ "{{baseUrl}}" ], "path": [ "seller", "analytics", "export" ] }
                    },
                    "response": []
                }
            ]
        },
        {
            "name": "Wallet",
            "item": [
                {
                    "name": "Get Wallet",
                    "request": {
                        "auth": { "type": "bearer", "bearer": [ { "key": "token", "value": "{{token}}", "type": "string" } ] },
                        "method": "GET",
                        "header": [],
                        "url": { "raw": "{{baseUrl}}/seller/wallet", "host": [ "{{baseUrl}}" ], "path": [ "seller", "wallet" ] }
                    },
                    "response": []
                },
                {
                    "name": "Get Wallet Transactions",
                    "request": {
                        "auth": { "type": "bearer", "bearer": [ { "key": "token", "value": "{{token}}", "type": "string" } ] },
                        "method": "GET",
                        "header": [],
                        "url": { "raw": "{{baseUrl}}/seller/wallet/transactions", "host": [ "{{baseUrl}}" ], "path": [ "seller", "wallet", "transactions" ] }
                    },
                    "response": []
                },
                {
                    "name": "Export Transactions",
                    "request": {
                        "auth": { "type": "bearer", "bearer": [ { "key": "token", "value": "{{token}}", "type": "string" } ] },
                        "method": "GET",
                        "header": [],
                        "url": { "raw": "{{baseUrl}}/seller/wallet/transactions/export", "host": [ "{{baseUrl}}" ], "path": [ "seller", "wallet", "transactions", "export" ] }
                    },
                    "response": []
                }
            ]
        }
    ]
};

// Remove if it exists to avoid duplicates
data.item = data.item.filter(i => i.name !== 'Seller');
data.item.push(sellerFolder);

fs.writeFileSync(path, JSON.stringify(data, null, '\t'));
console.log('Successfully updated Postman collection with Seller routes!');

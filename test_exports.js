const express = require('express');
const path = require('path');

const routes = [
  './routes/menu',
  './routes/auth',
  './routes/orders',
  './routes/ai'
];

routes.forEach(routePath => {
  try {
    const route = require(path.join(process.cwd(), routePath));
    console.log(`Route ${routePath} type: ${typeof route}`);
    if (typeof route !== 'function') {
      console.log(`ERROR: ${routePath} is NOT a function/router!`);
    }
  } catch (err) {
    console.log(`ERROR requiring ${routePath}: ${err.message}`);
  }
});

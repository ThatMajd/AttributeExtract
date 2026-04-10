import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AppShell } from './app/AppShell'
import { CartProvider } from './features/cart/CartContext'
import { Home } from './features/categories/Home'
import { CategoryPage } from './features/products/CategoryPage'
import { ProductDetailPage } from './features/products/ProductDetailPage'
import './index.css'
import 'leaflet/dist/leaflet.css'

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <BrowserRouter>
      <CartProvider>
        <Routes>
          <Route element={<AppShell />}>
            <Route path="/" element={<Home />} />
            <Route path="/category/:slug" element={<CategoryPage />} />
            <Route path="/product/:productId" element={<ProductDetailPage />} />
          </Route>
        </Routes>
      </CartProvider>
    </BrowserRouter>
  </React.StrictMode>,
)

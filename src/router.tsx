import { BrowserRouter, Routes, Route } from 'react-router-dom';
import App from './App';
import { HistoryPage } from './pages/HistoryPage';

export function Router() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<App />} />
                <Route path="/history" element={<HistoryPage />} />
            </Routes>
        </BrowserRouter>
    );
}

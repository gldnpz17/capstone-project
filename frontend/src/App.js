import LoginForm from './pages/LoginForm.js'
import AccManagement from './pages/AccManagement'
import { BrowserRouter, createBrowserRouter, Route, Routes } from 'react-router-dom'
import './App.css';
import { ApolloClient, ApolloProvider, InMemoryCache } from '@apollo/client';

const graphqlClient = new ApolloClient({
    uri: "http://localhost:4000",
    cache: new InMemoryCache()
})

function App() {
    return (
        <div className="page">
            <ApolloProvider client={graphqlClient}>
                <BrowserRouter>
                    <Routes>
                        <Route path="/admin">
                            <Route path="login" element={<LoginForm />} />
                            <Route path="accounts" element={<AccManagement />} />
                        </Route>
                    </Routes>
                </BrowserRouter>
            </ApolloProvider>
        </div>
    );
}

export default App;
